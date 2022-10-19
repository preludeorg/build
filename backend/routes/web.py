from typing import Union

from aiohttp import web
from aiohttp_jinja2 import template
from vertebrae.core import Route, StaticRoute
from vertebrae.service import Service

from backend.modules.account import Account
from backend.util.decorators import allowed


class WebRoutes:

    def routes(self) -> [Union[Route, StaticRoute]]:
        return [
            Route('GET', '/', self._get_index),
            Route('GET', '/serviceworker.js', self._serviceworker),
            Route('POST', '/register', self._register),
        ]

    @template('index.html')
    async def _get_index(self, request: web.Request) -> dict:
        return dict()

    async def _serviceworker(self, req):
        return web.FileResponse('client/dist/serviceworker.js')

    @allowed
    async def _register(self, account: Account, data: dict) -> web.Response:
        Service.create_log('web').debug(f'New login: {account.account_id}')
        return web.json_response(dict(account_id=account.account_id))
