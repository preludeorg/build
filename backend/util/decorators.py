import resource
from functools import wraps

from aiohttp import web
from vertebrae.core import strip_request
from vertebrae.service import Service

from backend.modules.account import Account
from backend.util.authentication import check

log = Service.create_log('api')
cache = Service.db('cache')


def allowed(func):
    @wraps(func)
    async def helper(*args, **params):
        try:
            account_id = args[1].headers.get('account') or Account.register()
            token = args[1].headers.get('token')

            cached = await cache.get(account_id)
            if not cached:
                if not await check(account_id=account_id, token=token):
                    return web.Response(status=403)
                await cache.set(account_id, Service.hash(token), ex=3600)

            params['account'] = Account(account_id=account_id)
            params['data'] = await strip_request(args[1])
            return await func(args, **params)

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
            log.exception(f'Unhandled: {e}')
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
