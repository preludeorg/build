from vertebrae.service import Service


class SigningService(Service):

    def __init__(self, name):
        super().__init__(name)

    async def sign(self, binary) -> str:
        """ Sign a compiled DCF """
        # TODO: 1) sign file 2) upload to S3
