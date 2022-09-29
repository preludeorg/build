from aiohttp import web
from vertebrae.core import Route
from vertebrae.service import Service
import logging
from backend.modules.account import Account
from backend.util.decorators import allowed


class DCFRoutes:

    def routes(self) -> [Route]:
        return [
            Route('GET', '/dcf/{name}', self._get_dcf),
            Route('POST', '/dcf/{name}', self._post_dcf),
            Route('DELETE', '/dcf/{name}', self._del_dcf),
            Route('POST', '/dcf/{name}/submit', self._submit_dcf)
        ]

    @allowed
    async def _get_dcf(self, account: Account, data: dict) -> web.json_response:
        code = await account.dcf.select(name=data['name'])
        return web.json_response(dict(code=code))

    @allowed
    async def _post_dcf(self, account: Account, data: dict) -> web.Response:
        await account.dcf.add(name=data['name'], code=data['code'])
        return web.Response(status=200)

    @allowed
    async def _del_dcf(self, account: Account, data: dict) -> web.Response:
        await account.dcf.remove(name=data['name'])
        return web.Response(status=200)

    @allowed
    async def _submit_dcf(self, account: Account, data: dict) -> web.Response:
        res = await Service.find('compile').compile(account_id=account.account_id, name=data['name'])
        if res.get('err'):
            return web.Response(status=500, text=res['err'])

        links = await Service.find('testbench').test(name=data['name'], binary=res['lib'])
        if all([li.status == 0 for li in links]):
            await Service.find('signing').sign(binary=res['lib'])
        return web.json_response(links)
