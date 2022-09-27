from vertebrae.service import Service


class CompileService(Service):

    def __init__(self, name):
        super().__init__(name)
        self.file = self.db(store='s3')

    async def compile(self, name: str) -> str:
        """ Compile a DCF """
        code = await self.file.read(f'src/{name}')
        # TODO: 1) compile 2) return compiled code
        return code
