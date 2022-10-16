import re
from pathlib import Path

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
            Route('POST', '/dcf/{name}/compile', self._compile_dcf)
        ]

    @allowed
    async def _get_dcf(self, account: Account, data: dict) -> web.json_response:
        return web.Response(body=await account.dcf.select(name=data['name']))

    @allowed
    async def _post_dcf(self, account: Account, data: dict) -> web.Response:
        valid = re.compile('[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12}..+?')
        if not valid.match(data['name']):
            raise TypeError(f'{data["name"]} is not a valid file name')

        if not await account.manifest.select(ttp_id=Path(data['name']).stem):
            raise FileNotFoundError(f'{Path(data["name"]).stem} not in manifest')

        await account.dcf.add(name=data['name'], code=data['code'])
        return web.Response(status=200)

    @allowed
    async def _del_dcf(self, account: Account, data: dict) -> web.Response:
        if data['name'] in await account.dcf.code_files(ttp_id=Path(data['name']).stem):
            await account.dcf.remove(name=data['name'])
            return web.Response(status=200)
        raise FileNotFoundError(f'{data["name"]} does not exist')

    @allowed
    async def _compile_dcf(self, account: Account, data: dict) -> web.Response:
        names = []
        async for name in Service.find('compile').compile(account_id=account.account_id, name=data['name']):
            names.append(name)
        return web.json_response(names)
