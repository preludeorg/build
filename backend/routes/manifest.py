import uuid

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
            Route('DELETE', '/manifest/{id}', self._del_manifest_entry)
        ]

    @allowed
    async def _get_manifest(self, account: Account, data: dict) -> web.json_response:
        return web.json_response(await account.manifest.select())

    @allowed
    async def _put_manifest(self, account: Account, data: dict) -> web.json_response:
        identifier = data.get('id', str(uuid.uuid4()))
        ttp = await account.manifest.select(ttp_id=identifier)
        if ttp:
            await account.manifest.add(
                ttp_id=identifier,
                name=data.get('name', ttp.get('name')),
                tags=data.get('tags', ttp.get('tags', []))
            )
        else:
            await account.manifest.add(ttp_id=identifier, name=data.get('name'))
            ttp = await account.manifest.select(ttp_id=identifier)
        return web.json_response(ttp)

    @allowed
    async def _get_manifest_entry(self, account: Account, data: dict) -> web.Response:
        ttp = await account.manifest.select(ttp_id=data['id'])
        if ttp:
            code_files = await account.dcf.code_files(ttp_id=data['id'])
            return web.json_response(dict(**ttp, dcf=code_files))
        return web.Response(status=404, text='No TTP with that identifier')

    @allowed
    async def _del_manifest_entry(self, account: Account, data: dict) -> web.Response:
        await account.manifest.remove(ttp_id=data['id'])
        return web.Response(status=200)
