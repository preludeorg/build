import asyncio
from abc import ABC, abstractmethod
from urllib.parse import urlparse

import aiohttp
from vertebrae.config import Config
from vertebrae.service import Service


async def check(account_id, token):
    exists, valid = await Detect(account_id=account_id, token=token).validate()
    if exists and valid:
        return True
    elif exists and not valid:
        return False
    else:
        _, valid = await Local(account_id=account_id, token=token).validate()
        return valid


class Authentication(ABC):

    def __init__(self, account_id: str, token: str):
        self.account_id = account_id
        self.token = token
        self.log = Service.create_log('auth')

    @abstractmethod
    async def validate(self):
        """ Return tuple: if_exists and is_valid"""
        pass


class Local(Authentication):
    """ Validate the global token is being used """

    async def validate(self):
        is_valid = Config.find('token') == self.token
        if not is_valid:
            self.log.warning(f'[{self.account_id}] Invalid Local login attempted')
        return True, is_valid


class Detect(Authentication):
    """ Check if requester is a valid Detect account """

    async def validate(self):
        url = f'{Config.find("prelude_service")}/valid'
        hd = dict(account=self.account_id, token=self.token)
        try:
            async with aiohttp.ClientSession(headers=hd) as session:
                resp = await session.post(url=url, timeout=aiohttp.ClientTimeout(total=10))
                if resp.status == 200:
                    return True, True
                elif resp.status in [403, 412]:
                    self.log.warning(f'[{self.account_id}] Invalid Detect login attempted')
                    return True, False
        except aiohttp.ClientConnectionError or aiohttp.ClientConnectorError:
            self.log.error(f'Prelude Service is offline ({urlparse(url).netloc})')
        except aiohttp.InvalidURL:
            self.log.error(f'Prelude Service invalid ({urlparse(url).netloc})')
        except asyncio.TimeoutError:
            self.log.error(f'Prelude Service timed out ({urlparse(url).netloc})')
        return False, False
