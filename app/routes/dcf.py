from aiohttp import web
from vertebrae.core import Route
from vertebrae.service import Service

from app.util.decorators import allowed


class DCFRoutes:

    def routes(self) -> [Route]:
        return [
            Route('GET', '/dcf/{name}', self._get_dcf),
            Route('POST', '/dcf/{name}', self._post_dcf),
            Route('DELETE', '/dcf/{name}', self._del_dcf),
            Route('POST', '/dcf/{name}/test', self._test_dcf),
            Route('POST', '/dcf/{name}/submit', self._submit_dcf)
        ]

    @allowed
    async def _get_dcf(self, data: dict) -> web.json_response:
        code = await Service.service('dcf').select(name=data['name'])
        return web.json_response(dict(code=code))

    @allowed
    async def _post_dcf(self, data: dict) -> web.Response:
        await Service.service('dcf').add(name=data['name'], code=data['code'])
        return web.Response(status=200)

    @allowed
    async def _del_dcf(self,data: dict) -> web.Response:
        await Service.service('dcf').remove(name=data['name'])
        return web.Response(status=200)

    @allowed
    async def _test_dcf(self, data: dict) -> web.json_response:
        link = await Service.service('testbench').test(name=data['name'])
        return web.json_response(link)

    @allowed
    async def _submit_dcf(self, data: dict) -> web.Response:
        compiled = await Service.service('compile').compile(name=data['name'])
        if await Service.service('testbench').test(so=compiled):
            await Service.service('signing').sign(name=data['name'])
            return web.Response(status=200)
