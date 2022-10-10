from vertebrae.config import Config
from vertebrae.service import Service


class CompileService(Service):

    def __init__(self, name):
        super().__init__(name)
        self.file = self.db(store='s3')
        self._accounts_bucket = f'{Config.find("aws")["buckets"]["accounts"]}'

    async def compile(self, account_id: str, name: str) -> str:
        """ Compile a DCF """
        code = await self.file.read(f'{self._accounts_bucket}/{account_id}/src/{name}')
        # TODO: 1) compile 2) return compiled code
        return code
