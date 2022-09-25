from vertebrae.service import Service


class CompileService(Service):

    def __init__(self, name):
        super().__init__(name)
        self.database = self.db()

    async def compile(self, name: str) -> str:
        """ Compile a DCF """
        code = await self.database.directory.read(f'src/{name}')
        # TODO: 1) compile 2) return compiled code
        return code
