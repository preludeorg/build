from backend.services.compile import Compiler


class Compile(Compiler):

    def get_extension(self) -> str:
        return '.c'

    def is_available(self) -> bool:
        pass

    def targets(self) -> dict:
        pass

    async def run(self, platform: str, source_file: str) -> str:
        pass
