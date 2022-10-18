from aiohttp import web
from vertebrae.core import Route
from vertebrae.service import Service

from backend.modules.account import Account
from backend.util.decorators import allowed


class DCFRoutes:

    def routes(self) -> [Route]:
        return [
            Route('GET', '/dcf', self._list_dcfs),
            Route('GET', '/dcf/{name}', self._get_dcf),
            Route('POST', '/dcf/{name}', self._post_dcf),
            Route('DELETE', '/dcf/{name}', self._del_dcf),
            Route('POST', '/dcf/{name}/submit', self._submit_dcf)
        ]

    @allowed
    async def _list_dcfs(self, account: Account, data: dict) -> web.json_response:
        return web.json_response(await account.dcf.code_files())

    @allowed
    async def _get_dcf(self, account: Account, data: dict) -> web.json_response:
        code = await account.dcf.select(name=data['name'])
        return web.json_response(dict(code=code))

    @allowed
    async def _post_dcf(self, account: Account, data: dict) -> web.Response:
        await account.dcf.add(name=data['name'], code=data['code'])
        await account.push_message(dict(code=data['code']), f'/dcf/{data["name"]}', 'SET')
        return web.Response(status=200)

    @allowed
    async def _del_dcf(self, account: Account, data: dict) -> web.Response:
        await account.dcf.remove(name=data['name'])
        await account.push_message(dict(), f'/dcf/{data["name"]}', 'DELETE')
        return web.Response(status=200)

    @allowed
    async def _submit_dcf(self, account: Account, data: dict) -> web.Response:
        binary = await Service.find('compile').compile(account_id=account.account_id, name=data['name'])
        links = await Service.find('testbench').test(name=data['name'], binary=binary)
        if all([li.status == 0 for li in links]):
            await Service.find('signing').sign(binary=binary)
        return web.json_response(links)
