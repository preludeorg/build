from vertebrae.config import Config
from vertebrae.core import Server, Application

from backend.routes.dcf import DCFRoutes
from backend.routes.manifest import ManifestRoutes
from backend.routes.web import WebRoutes
from backend.services.compile import CompileService
from backend.services.dcf import DCFService
from backend.services.manifest import ManifestService
from backend.services.signing import SigningService
from backend.services.testbench import TestBenchService

if __name__ == '__main__':
    Config.load(Config.strip(env='conf/env.yml'))
    server = Server(
        applications=[
            Application(port=3000, routes=[
                WebRoutes(),
                ManifestRoutes(),
                DCFRoutes()
            ])
        ],
        services=[
            ManifestService(name='manifest'),
            DCFService(name='dcf'),
            SigningService(name='signing'),
            TestBenchService(name='testbench'),
            CompileService(name='compile')
        ])
    server.run()
