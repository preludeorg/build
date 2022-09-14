from vertebrae.service import Service

from app.util.link import Link


class TestBenchService(Service):

    def __init__(self):
        self.log = self.logger('testbench')

    async def test(self, name: str) -> str:
        """ Test a DCF """

    async def results(self, name: str) -> [Link]:
        """ Get results for a given TTP """
