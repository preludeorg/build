import subprocess
import sys
import tempfile

from backend.modules.account import DCF
from vertebrae.service import Service


class CompileService(Service):

    def __init__(self, name):
        super().__init__(name)
        self.s3 = self.db(store='s3')

    def compile(self, dcf: DCF, name: str) -> str:
        """ Compile a DCF and write it back to S3 (as a library and as an executable). """
        with tempfile.TemporaryDirectory() as dir:
            temp_path = f'{dir}/{name}'
            self.s3.download_file(f'{dcf.accounts_bucket}/{dcf.account_id}/src/{name}.c', f'{temp_path}.c')
            res = self._compile_file(temp_path)
            if res.get('err'):
                return res
            self.s3.upload_file(res['lib'], f'{dcf.accounts_bucket}/{dcf.account_id}/lib/{name}')
            self.s3.upload_file(res['exe'], f'{dcf.accounts_bucket}/{dcf.account_id}/exe/{name}')
            return dict(
                lib=f'{dcf.accounts_bucket}/{dcf.account_id}/lib/{name}',
                exe=f'{dcf.accounts_bucket}/{dcf.account_id}/exe/{name}'
            )

    def _compile_file(self, path: str):
        targets = dict(
            linux_amd64='x86_64-linux-gnu',
            linux_arm64='aarch64-linux-gnu',
            darwin_amd64='x86_64-macos',
            darwin_arm64='aarch64-macos',
            windows_amd64='x86_64-windows',
            windows_arm64='aarch64-windows',
        )
        target = targets.get(path.rsplit('/', 1)[-1].split('_').pop().replace('-', '_'))

        err = subprocess.run([
            sys.executable,
            '-m',
            'ziglang',
            'build-lib',
            f'{path}.c',
            '-fPIC',
            '-dynamic',
            '--library',
            'c',
            '-target',
            f'{target}',
            f'-femit-bin={path}_lib'
        ], capture_output=True, text=True).stderr

        if not err:
            err = subprocess.run([
                sys.executable,
                '-m',
                'ziglang',
                'cc',
                f'{path}.c',
                '-Oz',
                '-target',
                f'{target}',
                '-o',
                f'{path}_exe'
            ], capture_output=True, text=True).stderr

        if err:
            return dict(err=err)
        return dict(lib=f'{path}_lib', exe=f'{path}_exe')