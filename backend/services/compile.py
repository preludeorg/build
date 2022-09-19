import os
import subprocess
import sys

from vertebrae.service import Service


class CompileService(Service):

    def __init__(self, name):
        super().__init__(name)
        self.file = self.db(store='directory')

    async def compile(self, account_id: str, name: str) -> str:
        """ Compile a DCF """
        targets = dict(
            linux_amd64='x86_64-linux-gnu',
            linux_arm64='aarch64-linux-gnu',
            darwin_amd64='x86_64-macos',
            darwin_arm64='aarch64-macos',
            windows_amd64='x86_64-windows',
            windows_arm64='aarch64-windows',
        )
        src = os.path.join(self.database.directory.name, 'src', f'{name}.c')
        dst = os.path.join(self.database.directory.name, 'dst', f'{name}')
        target = targets.get(name.split('_').pop().replace('-', '_'))
        subprocess.call([
            sys.executable,
            '-m',
            'ziglang',
            'build-lib',
            src,
            '-fPIC',
            '-dynamic',
            '--library',
            'c',
            '-target',
            f'{target}',
            f'-femit-bin={dst}'
        ])
        return dst
