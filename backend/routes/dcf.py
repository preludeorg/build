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
            Route('POST', '/dcf/{name}/test', self._test_dcf)
        ]

    @allowed
    async def _get_dcf(self, account: Account, data: dict) -> web.json_response:
        return web.Response(body=await account.dcf.select(name=data['name']))

    @allowed
    async def _post_dcf(self, account: Account, data: dict) -> web.Response:
        await account.dcf.add(name=data['name'], code=data['code'])
        return web.Response(status=200)

    @allowed
    async def _del_dcf(self, account: Account, data: dict) -> web.Response:
        await account.dcf.remove(name=data['name'])
        return web.Response(status=200)

    @allowed
    async def _test_dcf(self, account: Account, data: dict) -> web.Response:
        async for binary in Service.find('compile').compile(account_id=account.account_id, name=data['name']):
            print(binary)
        #links = await Service.find('testbench').test(name=data['name'], binary=binary)
        return web.json_response([])
