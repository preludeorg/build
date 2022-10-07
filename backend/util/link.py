from datetime import datetime


class Link:

    def __init__(self, name: str, status: int, cpu: float, output: str, created: datetime):
        self.name = name
        self.status = status
        self.cpu = cpu
        self.output = output
        self.created = created

    def display(self):
        return dict(name=self.name, status=self.status, cpu=self.cpu, output=self.output, created=self.created)
