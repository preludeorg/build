from vertebrae.service import Service


class CompileService(Service):

    def __init__(self, name):
        super().__init__(name)

    async def compile(self, name: str) -> str:
        """ Compile a DCF """
