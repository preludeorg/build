from vertebrae.service import Service

from backend.queries.query import Query
from backend.util.link import Link


class DCF:

    def __init__(self, account_id: str):
        self.account_id = account_id
        self.file = Service.db(store='directory')
        self.relational = Service.db(store='relational')
        self._accounts_bucket = f'{self.file.name}/{account_id}'
        self.query = Query()

    async def select(self, name: str) -> str:
        """ Locate a single DCF """
        return await self.file.read(filename=f'{self._accounts_bucket}/src/{name}')

    async def add(self, name: str, code: str) -> None:
        """ Upload a new or updated DCF """
        await self.file.write(filename=f'{self._accounts_bucket}/src/{name}', contents=code)

    async def remove(self, name: str) -> None:
        """ Remove a DCF """
        await self.file.delete(filename=f'{self._accounts_bucket}/src/{name}')

    async def links(self, name: str) -> [Link]:
        """ Get results for a given DCF """
        params = dict(account_id=self.account_id, name=name)
        hits = await self.relational.fetch(self.query.activity(), params)
        return [Link(name=h[0], status=h[1], cpu=h[2], created=h[3]) for h in hits]

    async def code_files(self, ttp_id: str):
        """ Find all code files for a given TTP """
        return [dcf async for dcf in self.file.walk(bucket=f'{self._accounts_bucket}/src', prefix=ttp_id)]


class Manifest:

    def __init__(self, account_id: str):
        self.account_id = account_id
        self.database = Service.db(store='relational')
        self.query = Query()

    async def select(self, ttp_id=None) -> dict:
        """ Get a copy of the manifest """
        query = self.query.single_manifest() if ttp_id else self.query.manifest()
        hits = await self.database.fetch(query, dict(account_id=self.account_id, id=ttp_id))
        return {hit[0]: dict(id=hit[0], name=hit[1], classification=hit[2]) for hit in hits}

    async def add(self, ttp_id: str, name: str, classification='unknown') -> None:
        """ Add an entry to the manifest """
        params = dict(account_id=self.account_id, id=ttp_id, name=name, classification=classification)
        await self.database.execute(self.query.update_manifest(), params)

    async def remove(self, ttp_id: str) -> None:
        """ Remove an entry from the manifest """
        params = dict(account_id=self.account_id, id=ttp_id)
        await self.database.execute(self.query.remove_manifest(), params)


class Account:

    def __init__(self, account_id: str):
        self.dcf = DCF(account_id=account_id)
        self.manifest = Manifest(account_id=account_id)
