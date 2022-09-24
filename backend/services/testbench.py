import tempfile
from ctypes import CDLL
from datetime import datetime

from vertebrae.service import Service

from backend.queries.query import Query
from backend.util.decorators import clock
from backend.util.link import Link


class TestBenchService(Service):

    def __init__(self, name):
        super().__init__(name)
        self.database = self.db()
        self.query = Query()

    async def test(self, name: str, so: str) -> Link:
        """ Test a DCF """
        self.log.debug(f'{name} running test')
        library = await self.database.directory.read(so)
        status, cpu = await self.run(code=library)
        link = Link(name=name, status=status, cpu=cpu, created=datetime.now())
        await self.database.relational.execute(self.query.add_link(), link.display)
        return link

    @clock
    async def run(self, code: str):
        """ Execute a shared library and record the CPU cycles used """
        fp = tempfile.NamedTemporaryFile()
        fp.write(code)
        dcf = CDLL(fp.name)
        status = dcf.attack()
        dcf.cleanup()
        fp.close()
        return status
