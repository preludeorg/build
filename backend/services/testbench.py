from vertebrae.config import Config
from vertebrae.service import Service

from backend.util.decorators import clock
from backend.util.link import Link


class TestBenchService(Service):

    def __init__(self, name):
        super().__init__(name)

    async def test(self, name: str, binary) -> [Link]:
        """ Test a compiled DCF """
        links = []
        for container in Config.find('testbench'):  # TODO: ensure env.yml contains web service addresses
            self.log.debug(f'{name} running test')
            await self.run(address=container, binary=binary)
        return links

    @clock
    async def run(self, address: str, binary):
        """ Execute test and record the CPU cycles used """
        # TODO: 1) upload binary to test container 2) execute 3) get link back
