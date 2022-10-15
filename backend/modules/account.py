import json
from pathlib import Path

from vertebrae.config import Config
from vertebrae.service import Service


class Manifest:

    def __init__(self, account_id: str):
        self.account_id = account_id
        self.log = Service.create_log(name='manifest')
        self.file = Service.db(store='s3')
        self._accounts_bucket = f'{Config.find("aws")["buckets"]["accounts"]}/{account_id}'

    async def select(self, ttp_id=None) -> dict:
        """ Get a copy of the manifest """
        try:
            manifest = json.loads(await self.file.read(filename=f'{self._accounts_bucket}/manifest.json'))
            return manifest.get(ttp_id, manifest)
        except TypeError:
            await self.file.write(filename=f'{self._accounts_bucket}/manifest.json', contents=json.dumps({}))
            return {}

    async def add(self, ttp_id: str, name: str) -> None:
        """ Add an entry to the manifest """
        self.log.debug(f'[{self.account_id}] Updating TTP: {ttp_id}')
        manifest = await self.select()
        manifest[ttp_id] = dict(id=ttp_id, name=name)
        await self.file.write(filename=f'{self._accounts_bucket}/manifest.json', contents=json.dumps(manifest))

    async def remove(self, ttp_id: str) -> None:
        """ Remove an entry from the manifest """
        manifest = await self.select()
        if ttp_id in manifest:
            self.log.debug(f'[{self.account_id}] Deleting TTP: {ttp_id}')
            del manifest[ttp_id]
            await self.file.write(filename=f'{self._accounts_bucket}/manifest.json', contents=json.dumps(manifest))


class DCF:

    def __init__(self, account_id: str):
        self.account_id = account_id
        self.log = Service.create_log('dcf')
        self.s3 = Service.db(store='s3')
        self.relational = Service.db(store='relational')
        self._accounts_bucket = f'{Config.find("aws")["buckets"]["accounts"]}/{self.account_id}'

    async def select(self, name: str) -> str:
        """ Locate a single DCF """
        self.log.debug(f'[{self.account_id}] Viewing DCF: {name}')
        return (await self.s3.read(filename=f'{self._accounts_bucket}/src/{name}')).decode('utf-8')

    async def add(self, name: str, code: str) -> None:
        """ Upload a new or updated DCF """
        self.log.debug(f'[{self.account_id}] Updating DCF: {name}')
        await self.s3.write(filename=f'{self._accounts_bucket}/src/{name}', contents=code)

    async def remove(self, name: str) -> None:
        """ Remove a DCF """
        self.log.debug(f'[{self.account_id}] Deleting DCF: {name}')
        await self.s3.delete(filename=f'{self._accounts_bucket}/src/{name}')

    async def code_files(self, ttp_id: str):
        """ Find all code files for a given TTP """
        self.log.debug(f'[{self.account_id}] Viewing TTP: {ttp_id}')
        files = await self.s3.walk(bucket=self._accounts_bucket.split('/')[0], prefix=f'{self.account_id}/src/{ttp_id}')
        return [Path(f).name for f in files]


class Account:

    def __init__(self, account_id: str):
        self.account_id = account_id
        # internal modules
        self.manifest = Manifest(account_id=account_id)
        self.dcf = DCF(account_id=account_id)
