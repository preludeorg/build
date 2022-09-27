import resource
from functools import wraps

from aiohttp import web
from vertebrae.config import Config
from vertebrae.core import create_log, strip_request

from backend.modules.account import Account

log = create_log('api')


def allowed(func):
    @wraps(func)
    async def helper(*args, **params):
        try:
            account_id = args[1].headers.get('account')
            if not account_id:
                log.warning(f'{account_id} is missing a required header')
                return web.Response(status=412, text='Missing account')
            elif Config.find('token', '') != args[1].headers.get('token'):
                log.warning(f'{account_id} performed an unauthorized request')
                return web.Response(status=403, text='Unauthorized request')

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
