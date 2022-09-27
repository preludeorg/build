import hashlib

from vertebrae.config import Config
from vertebrae.service import Service


class SigningService(Service):

    def __init__(self, name):
        super().__init__(name)
        self.s3 = self.db().s3
        self.signing_key = Config.find('signing')['key'].encode('utf8')

    def __compute_digest(self, data: bytes) -> str:
        h = hashlib.sha3_512()
        h.update(data)
        h.update(self.signing_key)
        return h.hexdigest()

    async def sign(self, account_id: str, dcf_name: str, binary: bytes) -> str:
        """ Sign a compiled DCF """
        digest = self.__compute_digest(binary)
        self.s3.write(Config.find('aws')['buckets']['procedures'], f'{account_id}/{dcf_name}', f'{digest}{str(binary)}')
        return digest
