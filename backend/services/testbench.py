from vertebrae.service import Service

from backend.util.decorators import clock
from backend.util.link import Link


class TestBenchService(Service):

    def __init__(self, name):
        super().__init__(name)

    async def test(self, name: str, so: str) -> [Link]:
        """ Test a DCF """
        for container in []:
            self.log.debug(f'{name} running test')
            await self.run(address=container, code=so)

    @clock
    async def run(self, address: str, code: str):
        """ Execute test and record the CPU cycles used """
        pass
