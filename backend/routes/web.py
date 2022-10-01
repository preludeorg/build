from aiohttp import web
from aiohttp_jinja2 import template
from vertebrae.core import Route
from vertebrae.service import Service

from backend.modules.account import Account


class WebRoutes:

    def routes(self) -> [Route]:
        return [
            Route('GET', '/', self._get_index),
            Route('POST', '/register', self._register)
        ]

    @template('index.html')
    async def _get_index(self, request: web.Request) -> dict:
        return dict()

    async def _register(self, request: web.Request) -> web.Response:
        account_id = request.headers.get('account', Account.register())
        Service.create_log('account').debug(f'New login: {account_id}')
        return web.json_response(dict(account_id=account_id))
