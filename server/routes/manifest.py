from aiohttp import web
from vertebrae.core import Route
from vertebrae.service import Service

from app.util.decorators import allowed


class ManifestRoutes:

    def routes(self) -> [Route]:
        return [
            Route('GET', '/manifest', self._get_manifest),
            Route('PUT', '/manifest', self._put_manifest),
            Route('GET', '/manifest/{id}', self._get_manifest_entry),
            Route('DELETE', '/manifest/{id}', self._del_manifest_entry)
        ]

    @allowed
    async def _get_manifest(self, data: dict) -> web.json_response:
        return web.json_response(await Service.find('manifest').select())

    @allowed
    async def _put_manifest(self, data: dict) -> web.Response:
        await Service.find('manifest').add(
            ttp_id=data['id'],
            name=data['name'],
            classification=data['classification']
        )
        return web.Response(status=200)

    @allowed
    async def _get_manifest_entry(self, data: dict) -> web.json_response:
        ttp = await Service.find('manifest').select(ttp_id=data['id'])
        if ttp:
            code_files = await Service.find('dcf').code_files(ttp_id=data['id'])
            return web.json_response(dict(**ttp, dcf=code_files))
        return web.Response(status=404, text='TTP not found')

    @allowed
    async def _del_manifest_entry(self, data: dict) -> web.Response:
        await Service.find('manifest').remove(ttp_id=data['id'])
        return web.Response(status=200)
