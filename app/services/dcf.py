from vertebrae.service import Service

from app.queries.query import Query
from app.util.link import Link


class DCFService(Service):

    def __init__(self):
        self.log = self.logger('dcf')
        self.database = self.db()
        self.query = Query()

    async def select(self, name: str) -> str:
        """ Locate a single DCF """
        return await self.database.directory.read(filename=f'src/{name}.c')

    async def add(self, name: str, code: str) -> None:
        """ Add an entry to the manifest """
        await self.database.directory.write(filename=f'src/{name}.c', contents=code)

    async def remove(self, name: str) -> None:
        """ Remove an entry from the manifest """
        await self.database.directory.delete(filename=f'src/{name}.c')

    async def links(self, name: str) -> [Link]:
        """ Get results for a given DCF """
        hits = await self.database.relational.fetch(self.query.activity(), dict(name=name))
        return [Link(name=h[0], status=h[1], cpu=h[2], created=h[3]) for h in hits]
