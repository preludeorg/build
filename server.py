from vertebrae.config import Config
from vertebrae.core import Server, Application

from app.routes.dcf import DCFRoutes
from app.routes.manifest import ManifestRoutes
from app.routes.probe import ProbeRoutes
from app.services.compile import CompileService
from app.services.dcf import DCFService
from app.services.manifest import ManifestService
from app.services.signing import SigningService
from app.services.testbench import TestBenchService

if __name__ == '__main__':
    Config.load(Config.strip(env='conf/env.yml'))
    server = Server(
        applications=[
            Application(port=3000, routes=[
                ManifestRoutes(),
                ProbeRoutes(),
                DCFRoutes()
            ])
        ],
        services=[
            ManifestService(),
            DCFService(),
            SigningService(),
            TestBenchService(),
            CompileService()
        ])
    server.run()
