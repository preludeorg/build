import asyncio
import uuid
from abc import ABC, abstractmethod
from functools import wraps
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


def works(func):
    @wraps(func)
    async def helper(*args, **params):
        url = Config.find("prelude_service")
        try:
            return await func(*args, **params)
        except aiohttp.ClientConnectionError or aiohttp.ClientConnectorError:
            raise ConnectionError(f'Prelude Service is offline ({urlparse(url).netloc})')
        except aiohttp.InvalidURL:
            raise FileNotFoundError(f'Prelude Service invalid ({urlparse(url).netloc})')
        except asyncio.TimeoutError:
            raise TimeoutError(f'Prelude Service timed out ({urlparse(url).netloc})')
    return helper


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

    @works
    async def validate(self):
        url = f'{Config.find("prelude_service")}/valid'
        hd = dict(account=self.account_id, token=self.token)
        async with aiohttp.ClientSession(headers=hd) as session:
            resp = await session.post(url=url, timeout=aiohttp.ClientTimeout(total=10))
            if resp.ok:
                return True, True
            elif resp.status in [403, 412]:
                self.log.warning(f'[{self.account_id}] Invalid Detect login attempted')
                return True, False
            else:
                return False, False

    @staticmethod
    @works
    async def register() -> tuple:
        url = f'{Config.find("prelude_service")}/account'
        async with aiohttp.ClientSession() as session:
            params = dict(product='detect-community')
            resp = await session.post(url=url, json=params, timeout=aiohttp.ClientTimeout(total=10))
            if resp.ok:
                return await resp.json()
        return Service.hash(s=str(uuid.uuid4()), algo='md5'), Config.find('token')
