from aiohttp import web
from vertebrae.core import Route
from vertebrae.service import Service

from app.util.decorators import allowed


class ProbeRoutes:

    def routes(self) -> [Route]:
        return [Route('GET', '/probe/{name}', self._get_links)]

    @allowed
    async def _get_links(self, data: dict) -> web.json_response:
        links = await Service.service('testbench').results(name=data['name'])
        return web.json_response(links)
