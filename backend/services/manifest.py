from vertebrae.service import Service

from backend.queries.query import Query


class ManifestService(Service):

    def __init__(self, name):
        super().__init__(name)
        self.database = self.db()
        self.query = Query()

    async def select(self, ttp_id=None) -> dict:
        """ Get a copy of the manifest """
        query = self.query.single_manifest() if ttp_id else self.query.manifest()
        hits = await self.database.relational.fetch(query, dict(id=ttp_id))
        return {hit[0]: dict(name=hit[1], classification=hit[2]) for hit in hits}

    async def add(self, ttp_id: str, name: str, classification='unknown') -> None:
        """ Add an entry to the manifest """
        params = dict(id=ttp_id, name=name, classification=classification)
        await self.database.relational.execute(self.query.update_manifest(), params)

    async def remove(self, ttp_id: str) -> None:
        """ Remove an entry from the manifest """
        await self.database.relational.execute(self.query.remove_manifest(), dict(id=ttp_id))
