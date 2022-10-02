import asyncio
from abc import ABC, abstractmethod
from urllib.parse import urlparse

import aiohttp
from vertebrae.config import Config
from vertebrae.service import Service


class Authentication(ABC):

    def __init__(self, account_id: str, token: str):
        self.account_id = account_id
        self.token = token
        self.log = Service.create_log('auth')

    @abstractmethod
    async def validate(self):
        pass


class Local(Authentication):
    """ Local auth validates the global token is being used """

    async def validate(self):
        return self.account_id, Config.find('token') == self.token


class Detect(Authentication):
    """ Service auth checks if requester is a valid Detect account """

    async def validate(self):
        url = f'{Config.find("prelude_service")}/valid/operator'
        hd = dict(account=self.account_id, token=self.token)
        try:
            async with aiohttp.ClientSession(headers=hd) as session:
                resp = await session.post(url=url, timeout=aiohttp.ClientTimeout(total=10))
                if resp.status == 200:
                    return True, True
                elif resp.status in [403, 412]:
                    return True, False
        except aiohttp.ClientConnectionError or aiohttp.ClientConnectorError:
            self.log.error(f'Prelude Service is offline ({urlparse(url).netloc})')
        except aiohttp.InvalidURL:
            self.log.error(f'Prelude Service invalid ({urlparse(url).netloc})')
        except asyncio.TimeoutError:
            self.log.error(f'Prelude Service timed out ({urlparse(url).netloc})')
        return False, False
