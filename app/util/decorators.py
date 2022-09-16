import resource
from functools import wraps

from aiohttp import web
from vertebrae.core import Server

log = Server.create_log('api')


async def get_request_data(req):
    if req.method in ['GET', 'DELETE']:
        return dict(req.rel_url.query) | dict(req.match_info)
    return dict(await req.json()) | dict(req.match_info)


def allowed(func):
    @wraps(func)
    async def helper(*args, **params):
        try:
            return await func(args, params)

        except KeyError as e:
            log.error(e)
            return web.Response(status=400, text=str(e))
        except TypeError as e:
            log.error(e)
            return web.Response(status=400, text=str(e))
        except ValueError as e:
            log.error(e)
            return web.Response(status=400, text=str(e))
        except FileNotFoundError as e:
            log.error(e)
            return web.Response(status=404, text=str(e))
        except TimeoutError as e:
            log.error(e)
            return web.Response(status=408, text=str(e))
        except ConnectionError as e:
            log.error(e)
            return web.Response(status=503, text=str(e))
        except Exception as e:
            log.error(f'Unhandled: {e}')
            return web.Response(status=500, text=str(e))
    return helper


def clock(func):
    @wraps(func)
    def wrapper(*args, **params):
        pre = resource.getrusage(resource.RUSAGE_SELF)
        pre_cycles = getattr(pre, 'ru_utime') + getattr(pre, 'ru_stime')
        status = func(*args, **params)
        post = resource.getrusage(resource.RUSAGE_SELF)
        post_cycles = getattr(post, 'ru_utime') + getattr(post, 'ru_stime')
        return status, '%.3f' % float(post_cycles - pre_cycles)
    return wrapper
