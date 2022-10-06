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

    def __init__(self, name):
        super().__init__(name)
        self.s3 = self.db(store='s3')

    async def compile(self, dcf: DCF, name: str) -> str:
        """ Compile a DCF and write it back to S3 (as a library and as an executable) """
        self.log.debug(f'[{dcf.account_id}] Compiling DCF: {name}')
        ttp_id, platform, arch, ext = re.match(CompileService.NAME_REGEX, name).groups()

        if arch == 'python':
            out = dict(script=f'{dcf.accounts_bucket}/dst/{name}')
            await self.s3.write(out['script'], await self.s3.read(f'{dcf.accounts_bucket}/src/{name}'))
            return out

        with tempfile.TemporaryDirectory() as dir:
            self.s3.download_file(f'{dcf.accounts_bucket}/src/{name}', f'{dir}/{name}')
            res = self._compile_file(dir, name, platform, arch, ext)
            if res.get('err'):
                return res

            out = dict(
                lib=f'{dcf.accounts_bucket}/dst/{res["lib"]}',
                exe=f'{dcf.accounts_bucket}/dst/{res["exe"]}'
            )
            self.s3.upload_file(f'{dir}/{res["lib"]}', out['lib'])
            self.s3.upload_file(f'{dir}/{res["exe"]}', out['exe'])
            return out

    def _compile_file(self, dir: str, name: str, platform: str, arch: str, ext: str):
        target = CompileService.TARGETS.get(f'{platform}_{arch}')

        out_lib = name.replace(f'.{ext}', '.so')
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
            f'-femit-bin={dir}/{out_lib}'
        ], capture_output=True, text=True).stderr

        if not err:
            out_exe = name.replace(f'.{ext}', '.exe' if platform == 'windows' else '')
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
                f'{dir}/{out_exe}'
            ], capture_output=True, text=True).stderr

        if err:
            return dict(err=err)
        return dict(lib=out_lib, exe=out_exe)
