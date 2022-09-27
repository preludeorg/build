from vertebrae.config import Config
from vertebrae.service import Service

from backend.queries.query import Query
from backend.util.link import Link


class DCF:

    def __init__(self, account_id: str):
        self.account_id = account_id
        self.database = Service.db()
        self._accounts_bucket = Config.find('aws')['buckets']['accounts']
        self.query = Query()

    async def select(self, name: str) -> str:
        """ Locate a single DCF """
        return (await self.database.s3.read(bucket=self._accounts_bucket, key=f'{self.account_id}/src/{name}')).decode('utf-8')

    async def add(self, name: str, code: str) -> None:
        """ Add an entry to the manifest """
        await self.database.s3.write(bucket=self._accounts_bucket, key=f'{self.account_id}/src/{name}', contents=code)

    async def remove(self, name: str) -> None:
        """ Remove an entry from the manifest """
        await self.database.s3.delete(bucket=self._accounts_bucket, key=f'{self.account_id}/src/{name}')

    async def links(self, name: str) -> [Link]:
        """ Get results for a given DCF """
        params = dict(account_id=self.account_id, name=name)
        hits = await self.database.relational.fetch(self.query.activity(), params)
        return [Link(name=h[0], status=h[1], cpu=h[2], created=h[3]) for h in hits]

    async def code_files(self, ttp_id: str):
        """ Find all code files for a given TTP """
        f = await self.database.s3.read_all(bucket=self._accounts_bucket, prefix=f'{self.account_id}/src/{ttp_id}')
        return list(f.keys())


class Manifest:

    def __init__(self, account_id: str):
        self.account_id = account_id
        self.database = Service.db()
        self.query = Query()

    async def select(self, ttp_id=None) -> dict:
        """ Get a copy of the manifest """
        query = self.query.single_manifest() if ttp_id else self.query.manifest()
        hits = await self.database.relational.fetch(query, dict(account_id=self.account_id, id=ttp_id))
        return {hit[0]: dict(id=hit[0], name=hit[1], classification=hit[2]) for hit in hits}

    async def add(self, ttp_id: str, name: str, classification='unknown') -> None:
        """ Add an entry to the manifest """
        params = dict(account_id=self.account_id, id=ttp_id, name=name, classification=classification)
        await self.database.relational.execute(self.query.update_manifest(), params)

    async def remove(self, ttp_id: str) -> None:
        """ Remove an entry from the manifest """
        params = dict(account_id=self.account_id, id=ttp_id)
        await self.database.relational.execute(self.query.remove_manifest(), params)


class Account:

    def __init__(self, account_id: str):
        self.dcf = DCF(account_id=account_id)
        self.manifest = Manifest(account_id=account_id)
