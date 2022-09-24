import asyncio

from aiohttp import web
from vertebrae.core import Route
from vertebrae.service import Service

from backend.util.decorators import allowed


class DCFRoutes:

    def routes(self) -> [Route]:
        return [
            Route('GET', '/{account_id}/dcf/{name}', self._get_dcf),
            Route('POST', '/{account_id}/dcf/{name}', self._post_dcf),
            Route('DELETE', '/{account_id}/dcf/{name}', self._del_dcf),
            Route('GET', '/{account_id}/dcf/{name}/links', self._get_links),
            Route('POST', '/{account_id}/dcf/{name}/submit', self._submit_dcf)
        ]

    @allowed
    async def _get_dcf(self, data: dict) -> web.json_response:
        code = await Service.find('dcf').select(name=data['name'])
        return web.json_response(dict(code=code))

    @allowed
    async def _post_dcf(self, data: dict) -> web.Response:
        await Service.find('dcf').add(name=data['name'], code=data['code'])
        return web.Response(status=200)

    @allowed
    async def _del_dcf(self,data: dict) -> web.Response:
        await Service.find('dcf').remove(name=data['name'])
        return web.Response(status=200)

    @allowed
    async def _get_links(self, data: dict) -> web.json_response:
        links = await Service.find('dcf').links(name=data['name'])
        return web.json_response(links)

    @allowed
    async def _submit_dcf(self, data: dict) -> web.Response:
        async def _submission_process():
            relative_path = await Service.find('compile').compile(name=data['name'])
            link = await Service.find('testbench').test(name=data['name'], so=relative_path)
            if link.status == 0:
                await Service.find('signing').sign(so=relative_path)

        asyncio.create_task(_submission_process())
        return web.Response(status=200, text='Submission received')
