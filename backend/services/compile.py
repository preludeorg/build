import re

from vertebrae.builders.aws_codebuild import AwsCodeBuild, CreateProjectRequest, ArtifactType, StartBuildRequest
from vertebrae.config import Config
from vertebrae.service import Service


class CompileService(Service):
    NAME_REGEX = re.compile('([^_]+)_([^-]+)(-([^\.]+)){0,1}.(.+)')
    TARGETS = dict(
        linux_x86='x86_64-linux-gnu',
        linux_arm64='aarch64-linux-gnu',
        darwin_x86='x86_64-macos',
        darwin_arm64='aarch64-macos',
        windows_x86='x86_64-windows',
        windows_arm64='aarch64-windows',
    )
    SCRIPTING_LANGUAGES = ['python']

    def __init__(self, name):
        super().__init__(name)
        self.store = self.db(store="s3")
        self._compiler = AwsCodeBuild(self.log)
        self._compiler.connect()

        self._compiler_role = Config.find("aws")["codebuild"]["role"]
        self._compiler_image = Config.find("aws")["codebuild"]["image"]
        self._accounts_bucket = Config.find("aws")["buckets"]["accounts"]

    async def _s3_sync(self, path_from: str, path_to: str):
        content = await self.store.read(path_from)
        await self.store.write(path_to, content)
        return content

    async def compile(self, account_id: str, name: str) -> dict:
        """ Compile a DCF """
        self.log.debug(f'[{account_id}] Compiling DCF: {name}')

        ttp_id, platform, _, arch, _ = re.match(CompileService.NAME_REGEX, name).groups()
        arch = 'x86' # TODO what do we do with arch?

        def create_bucket_for_region() -> str:
            loc = self.store.client.get_bucket_location(Bucket=self._accounts_bucket)['LocationConstraint']
            loc = 'us-east-1' if loc is None else loc
            new_bucket = self._accounts_bucket
            if loc != self._compiler.client.meta.region_name:
                bucket = f"{self._accounts_bucket}-{Config.find('aws')['region']}"
                try:
                    self.store.client.create_bucket(
                        Bucket=bucket,
                        CreateBucketConfiguration=dict(LocationConstraint=Config.find("aws")["region"]),
                    )
                except self.store.client.exceptions.BucketAlreadyExists:
                    pass
                except self.store.client.exceptions.BucketAlreadyOwnedByYou:
                    pass
                new_bucket = bucket
            return new_bucket

        if arch in CompileService.SCRIPTING_LANGUAGES:
            dst = f"{self._accounts_bucket}/{account_id}/dst/{name}"
            await self._s3_sync(f"{self._accounts_bucket}/{account_id}/src/{ttp_id}/{name}", dst)
            return dict(script=dst)

        region_bucket = create_bucket_for_region()
        await self._s3_sync(f"{self._accounts_bucket}/{account_id}/src/{ttp_id}/",
                            f"{region_bucket}/{account_id}/src/{ttp_id}/")

        project_name = self._compiler.create_project(CreateProjectRequest(
            project_name=account_id,
            source_s3=f"{region_bucket}/{account_id}/src/",
            destination_s3=f"{region_bucket}/{account_id}/dst/",
            serviceRole=self._compiler_role,
            environment=dict(
                type="ARM_CONTAINER",
                image=self._compiler_image,
                computeType="BUILD_GENERAL1_SMALL",
                imagePullCredentialsType="SERVICE_ROLE"
            )))

        builds = [
            await self._launch_build(account_id, project_name, ArtifactType.LIBRARY, name, ttp_id, platform, arch, region_bucket),
            await self._launch_build(account_id, project_name, ArtifactType.BINARY, name, ttp_id, platform, arch, region_bucket)
        ]
        build_response = {}
        if await self._compiler.wait_for_builds([build['id'] for build in builds], 5):
            build_response = {
                build["artifact_type"]: await self._s3_sync(f"{region_bucket}/{build['path']}",
                                                            f"{self._accounts_bucket}/{build['path']}")
                for build in builds
            }
        return build_response

    async def _launch_build(self, account_id: str, project_name: str, artifact_type: ArtifactType, dcf_name: str, ttp_id: str, platform: str, arch: str, region_bucket: str):
        target = CompileService.TARGETS.get(f'{platform}_{arch}')
        ext = ".so" if artifact_type == ArtifactType.LIBRARY else ".exe" if platform == "windows" else ""
        out_name = f"{ttp_id}_{target}{ext}"
        out_path = f"{account_id}/dst/{out_name}"

        # delete existing artifacts
        await self.store.delete(f"{region_bucket}/{out_path}")
        await self.store.delete(f"{self._accounts_bucket}/{out_path}")

        build_id = self._compiler.start_build(
            StartBuildRequest(
                project_name=project_name,
                target=target,
                source_dir_s3=f"{region_bucket}/{account_id}/src/{ttp_id}/",
                source_file_s3=dcf_name,
                artifact_filename_s3=out_name,
                artifact_type=artifact_type
            ))
        return dict(
            id=build_id,
            path=out_path,
            artifact_type=artifact_type.value
        )