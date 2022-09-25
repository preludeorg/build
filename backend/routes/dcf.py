import asyncio

from aiohttp import web
from vertebrae.core import Route
from vertebrae.service import Service

from backend.modules.account import Account
from backend.util.decorators import allowed


class DCFRoutes:

    def routes(self) -> [Route]:
        return [
            Route('GET', '/dcf/{name}', self._get_dcf),
            Route('POST', '/dcf/{name}', self._post_dcf),
            Route('DELETE', '/dcf/{name}', self._del_dcf),
            Route('GET', '/dcf/{name}/links', self._get_links),
            Route('POST', '/dcf/{name}/submit', self._submit_dcf)
        ]

    @allowed
    async def _get_dcf(self, account: Account, data: dict) -> web.json_response:
        code = await account.dcf.select(name=data['name'])
        return web.json_response(dict(code=code))

    @allowed
    async def _post_dcf(self, account: Account, data: dict) -> web.json_response:
        await account.dcf.add(name=data['name'], code=data['code'])
        return web.json_response({})

    @allowed
    async def _del_dcf(self, account: Account, data: dict) -> web.json_response:
        await account.dcf.remove(name=data['name'])
        return web.json_response({})

    @allowed
    async def _get_links(self, account: Account, data: dict) -> web.json_response:
        links = await account.dcf.links(name=data['name'])
        return web.json_response(links)

    @allowed
    async def _submit_dcf(self, account: Account, data: dict) -> web.Response:
        async def _submission_process():
            binary = await Service.find('compile').compile(name=data['name'])
            links = await Service.find('testbench').test(name=data['name'], binary=binary)
            if all([li.status == 0 for li in links]):
                await Service.find('signing').sign(binary=binary)

        asyncio.create_task(_submission_process())
        return web.json_response({})
