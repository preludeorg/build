from datetime import datetime

from vertebrae.config import Config
from vertebrae.service import Service

from backend.util.decorators import clock
from backend.util.link import Link


class TestBenchService(Service):

    def __init__(self, name):
        super().__init__(name)

    async def test(self, name: str, binary) -> list[Link]:
        """ Test a compiled DCF """
        testbench = Config.find('testbench') # TODO: ensure env.yml contains web service addresses
        self.log.debug(f'{name} running test')
        # Currently the result will have a field with an array of results for each container that ran
        return await self.run(address=testbench, binary=binary)

    @clock
    async def run(self, address: str, binary) -> list[Link]:
        """ Execute test and record the CPU cycles used """
        links = []
        # TODO: 1) upload binary to test container 2) execute 3) get link back
        # TODO: POST REQUEST TO TEST CONTAINER -> response will have a uuid.
        # TODO: Check the status endpoint status/uuid -> if status is "done" then get the results
        # TODO: when status is "done" the resulting json will have a list of links
        #  PSEUDO CODE:
        # job_uuid = postresponse["uuid"]
        # while True: 
        #   resp = request(f"{address}/status/{job_uuid}")
        #   if resp["status"] == "done" or resp["status"] == "error":
        #       break
        #   asyncio.sleep(5)
        # if resp["status"] == "error":
        #   return [Link(name=("Test failed", status="error", cpu="error", created=datetime.now())]
        # for l in resp["links"]:
        #   links.append(Link(name=l["name"], status=l["status"], cpu=l["cpu"], created=datetime.now()))
        return links
