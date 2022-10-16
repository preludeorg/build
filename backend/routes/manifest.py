import uuid
import re

from aiohttp import web
from vertebrae.core import Route

from backend.modules.account import Account
from backend.util.decorators import allowed


class ManifestRoutes:

    def routes(self) -> [Route]:
        return [
            Route('GET', '/manifest', self._get_manifest),
            Route('PUT', '/manifest', self._put_manifest),
            Route('GET', '/manifest/{id}', self._get_manifest_entry),
            Route('DELETE', '/manifest/{id}', self._del_manifest_entry),
            Route('GET', '/manifest/{id}/url', self._redirects)
        ]

    @allowed
    async def _get_manifest(self, account: Account, data: dict) -> web.json_response:
        return web.json_response(await account.manifest.select())

    @allowed
    async def _put_manifest(self, account: Account, data: dict) -> web.json_response:
        identifier = data.get('id', str(uuid.uuid4()))
        valid = re.compile('[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}')
        if not valid.match(identifier):
            raise TypeError(f'{identifier} is not a valid UUID-4')

        await account.manifest.add(ttp_id=identifier, name=data.get('name'))
        return web.Response(status=200)

    @allowed
    async def _get_manifest_entry(self, account: Account, data: dict) -> web.Response:
        ttp = await account.manifest.select(ttp_id=data['id'])
        if ttp:
            code_files = await account.dcf.code_files(ttp_id=data['id'])
            return web.json_response(dict(**ttp, dcf=code_files))
        raise FileNotFoundError(f'{data["id"]} not in manifest')

    @allowed
    async def _del_manifest_entry(self, account: Account, data: dict) -> web.Response:
        await account.manifest.remove(ttp_id=data['id'])
        for code_file in await account.dcf.code_files(ttp_id=data['id']):
            await account.dcf.remove(name=code_file)
        return web.Response(status=200)

    @allowed
    async def _redirects(self, account: Account, data: dict) -> web.Response:
        urls = await account.manifest.redirects(ttp_id=data['id'])
        return web.json_response(urls)
