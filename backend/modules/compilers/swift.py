import subprocess
from distutils.spawn import find_executable

from backend.services.compile import Compiler


class Compile(Compiler):

    def get_extension(self) -> str:
        return '.swift'

    def is_available(self) -> bool:
        return find_executable('swiftc') is not None

    def targets(self) -> dict:
        return dict(
            darwin=[
                'x86_64-apple-macos10.15',
                'arm64-apple-macos10.15'
            ]
        )

    async def run(self, src: str, dst: str) -> str:
        for platform, targets in self.targets().items():
            for target in targets:
                subprocess.run(['swiftc', '-Osize', src, '-target', target, '-o', dst], timeout=30)
                yield f'{platform}-{target.partition("-")[0]}'
