from vertebrae.service import Service


class SigningService(Service):

    def __init__(self, name):
        super().__init__(name)

    async def sign(self, so: str) -> str:
        """ Sign a DCF """
