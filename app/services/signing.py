from vertebrae.service import Service


class SigningService(Service):

    def __init__(self):
        self.log = self.logger('signing')

    async def sign(self, name: str) -> str:
        """ Sign a DCF """
