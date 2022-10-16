import glob
import importlib
import pathlib
import tempfile
from abc import ABC, abstractmethod

from vertebrae.config import Config
from vertebrae.service import Service


class Compiler(ABC):
    @abstractmethod
    def get_extension(self) -> str:
        """ File extension triggering this compiler """

    @abstractmethod
    def is_available(self) -> bool:
        """ Verify compiler is installed """

    @abstractmethod
    def targets(self) -> dict:
        """ Dict of all platforms -> build targets """

    @abstractmethod
    def run(self, src: str, dst: str) -> str:
        """ Compile a source file into a destination file """


class CompileService(Service):

    def __init__(self, name):
        super().__init__(name)
        self.compilers = dict()
        self.file = self.db(store='s3')
        self._accounts_bucket = f'{Config.find("aws")["buckets"]["accounts"]}'

    async def start(self):
        """ Load compilers into the service """
        for filename in glob.glob('backend/modules/compilers/*.py'):
            name = pathlib.Path(filename).stem
            module = importlib.import_module(f'backend.modules.compilers.{name}')
            compiler = getattr(module, 'Compile')()
            if not compiler.is_available():
                self.log.warning(f'[{compiler.get_extension()}] compiler: failed to load')
                continue
            self.compilers[compiler.get_extension()] = compiler
            self.log.debug(f'[{compiler.get_extension()}] compiler: loaded')

    async def compile(self, account_id: str, name: str) -> str:
        """ Compile a code file into all supported platforms """
        code = await self.file.read(f'{self._accounts_bucket}/{account_id}/src/{name}')
        extension = pathlib.Path(name).suffix
        if not self.compilers.get(extension):
            self.log.warning(f'Compiler not available for {extension}')
            return

        with tempfile.NamedTemporaryFile(prefix=account_id, suffix=extension) as src:
            self.log.debug(f'Compiling {src.name}')
            src.write(code)
            src.flush()

            with tempfile.NamedTemporaryFile(prefix=account_id) as dst:
                async for dos in self.compilers[extension].run(src=src.name, dst=dst.name):
                    relative = f'{pathlib.Path(name).stem}_{dos}'
                    absolute = f'{self._accounts_bucket}/{account_id}/dst/{relative}'
                    await self.file.write(filename=absolute, contents=code)
                    yield relative
