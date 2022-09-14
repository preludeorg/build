import logging
from functools import wraps

from aiohttp import web
from vertebrae.config import Config


async def get_request_data(req):
    if req.method in ['GET', 'DELETE']:
        return dict(req.rel_url.query) | dict(req.match_info)
    return dict(await req.json()) | dict(req.match_info)


def allowed(func):
    @wraps(func)
    async def helper(*args, **params):
        try:
            if args[1].headers.get('token') != Config.find('token'):
                logging.error('Unauthorized request')
                return web.Response(status=401, text='Token not accepted')
            return await func(args[0], data=await get_request_data(args[1]))

        except KeyError as e:
            logging.error(e)
            return web.Response(status=400, text=str(e))
        except TypeError as e:
            logging.error(e)
            return web.Response(status=400, text=str(e))
        except ValueError as e:
            logging.error(e)
            return web.Response(status=400, text=str(e))
        except FileNotFoundError as e:
            logging.error(e)
            return web.Response(status=404, text=str(e))
        except TimeoutError as e:
            logging.error(e)
            return web.Response(status=408, text=str(e))
        except ConnectionError as e:
            logging.error(e)
            return web.Response(status=503, text=str(e))
        except Exception as e:
            logging.error(f'Unhandled: {e}')
            return web.Response(status=500, text=str(e))
    return helper
