from aiohttp import web
from aiohttp_jinja2 import template
from vertebrae.core import Route


class WebRoutes:

    def routes(self) -> [Route]:
        return [
            Route('GET', '/', self._get_index)
        ]

    @template('index.html')
    async def _get_index(self, request: web.Request) -> dict:
        return dict(hello='world')
