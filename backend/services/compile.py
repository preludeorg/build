import re
import subprocess
import sys
import tempfile

from backend.modules.account import DCF
from vertebrae.service import Service


class CompileService(Service):
    targets = dict(
        linux_amd64='x86_64-linux-gnu',
        linux_arm64='aarch64-linux-gnu',
        darwin_amd64='x86_64-macos',
        darwin_arm64='aarch64-macos',
        windows_amd64='x86_64-windows',
        windows_arm64='aarch64-windows',
    )

    def __init__(self, name):
        super().__init__(name)
        self.s3 = self.db(store='s3')

    def compile(self, dcf: DCF, name: str) -> str:
        """ Compile a DCF and write it back to S3 (as a library and as an executable) """
        platform, arch, ext = re.split('\.-_', name.split('_', 1).pop())
        self.log.debug(f'{platform}  {arch}  {ext}')

        if arch == 'python':
            # compile python to bytestream? to executable? to library?
            return dict()

        with tempfile.TemporaryDirectory() as dir:
            self.log.debug(f'temporary dir: {dir}')
            self.s3.download_file(f'{dcf.accounts_bucket}/src/{name}', f'{dir}/{name}')
            self.log.debug('downloaded from s3')
            res = self._compile_file(dir, name, platform, arch, ext)
            self.log.debug(f'compiled. {res}')
            if res.get('err'):
                return res

            out = dict(
                lib=f'{dcf.accounts_bucket}/dst/{res["lib"]}',
                exe=f'{dcf.accounts_bucket}/dst/{res["exe"]}'
            )
            self.log.debug('about to upload')
            self.s3.upload_file(f'{dir}/{res["lib"]}', out['lib'])
            self.s3.upload_file(f'{dir}/{res["exe"]}', out['exe'])
            self.log.debug('uploaded')
            return out

    def _compile_file(self, dir: str, name: str, platform: str, arch: str, ext: str):
        target = self.targets.get(f'{platform}_{arch}')
        self.log.debug(f'target: {target}')

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
