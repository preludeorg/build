from vertebrae.service import Service


class CompileService(Service):

    def __init__(self):
        self.log = self.logger('compile')

    async def compile(self, name: str) -> str:
        """ Compile a DCF """
