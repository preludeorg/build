from typing import Union

from aiohttp import web
from aiohttp_jinja2 import template
from vertebrae.config import Config
from vertebrae.core import Route, StaticRoute
from vertebrae.service import Service

from backend.modules.account import Account
from backend.util.decorators import allowed

import logging

class WebRoutes:

    def routes(self) -> [Union[Route, StaticRoute]]:
        return [
            Route('GET', '/', self._get_index),
            Route('GET', '/serviceworker.js', self._serviceworker),
            Route('POST', '/register', self._register),
            StaticRoute('/static', 'client/dist/static'),
            Route('POST', '/push/subscribe', self._subscribe_push),
            Route('GET', '/vapidPublicKey', self._vapid_public)
        ]

    @allowed
    async def _subscribe_push(self, account: Account, data: dict):
        logging.debug('_subscribe_push')
        account.add_push_subscription(data['subscription'])
        return web.Response(status=200)

    async def _vapid_public(self, request):
        return web.Response(status=200,
                            text=f'{Config.find("vapid_keys")["public"]}')

    @template('index.html')
    async def _get_index(self, request: web.Request) -> dict:
        return dict()

    async def _serviceworker(self, req):
        return web.FileResponse('client/dist/serviceworker.js')

    @allowed
    async def _register(self, account: Account, data: dict) -> web.Response:
        Service.create_log('web').debug(f'New login: {account.account_id}')
        return web.json_response(dict(account_id=account.account_id))
