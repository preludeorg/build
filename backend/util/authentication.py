from vertebrae.config import Config

from abc import ABC, abstractmethod


class Authentication(ABC):

    def __init__(self, account_id: str, token: str):
        self.account_id = account_id
        self.token = token

    @abstractmethod
    def validate(self):
        pass


class Simple(Authentication):
    """ Simple auth validates the global token is being used """

    def validate(self):
        return Config.find('token', '') == self.token
