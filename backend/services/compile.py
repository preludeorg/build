import re
import subprocess
import sys
import tempfile

from backend.modules.account import DCF
from vertebrae.service import Service


class CompileService(Service):
    NAME_REGEX = re.compile('([^_]+)_([^-]+)-([^\.]+).(.+)')
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
        self.s3 = self.db(store='s3')

    async def compile(self, dcf: DCF, name: str) -> dict:
        """ Compile a DCF and write it back to S3 """
        self.log.debug(f'[{dcf.account_id}] Compiling DCF: {name}')
        ttp_id, platform, arch, ext = re.match(CompileService.NAME_REGEX, name).groups()
        src = f'{dcf.accounts_bucket}/src/{name}'

        if arch in CompileService.SCRIPTING_LANGUAGES:
            dst = f'{dcf.accounts_bucket}/dst/{name}'
            await self.s3.write(dst, await self.s3.read(src))
            return dict(script=dst)

        with tempfile.TemporaryDirectory() as dir:
            self.s3.download_file(src, f'{dir}/{name}')
            res = self._compile_file(dir, name, platform, arch, ext)
            out = dict()
            for k in res.keys():
                out[k] = f'{dcf.accounts_bucket}/dst/{res[k]}'
                self.s3.upload_file(f'{dir}/{res[k]}', out[k])
            return out

    def _compile_file(self, dir: str, name: str, platform: str, arch: str, ext: str) -> dict:
        target = CompileService.TARGETS.get(f'{platform}_{arch}')
        out = dict(lib=name.replace(f'.{ext}', '.so'),
                   exe=name.replace(f'.{ext}', '.exe' if platform == 'windows' else ''))

        err = subprocess.run([
            sys.executable,
            '-m',
            'ziglang',
            'build-lib',
            f'{dir}/{name}',
            '-fPIC',
            '-dynamic',
            '--library',
            'c',
            '-target',
            f'{target}',
            f'-femit-bin={dir}/{out["lib"]}'
        ], capture_output=True, text=True).stderr

        if not err:
            err = subprocess.run([
                sys.executable,
                '-m',
                'ziglang',
                'cc',
                f'{dir}/{name}',
                '-Oz',
                '-target',
                f'{target}',
                '-o',
                f'{dir}/{out["exe"]}'
            ], capture_output=True, text=True).stderr

            if 'MissingMainEntrypoint' in err:
                err = None
                del out["exe"]

        if err:
            raise Exception(err)
        return out
