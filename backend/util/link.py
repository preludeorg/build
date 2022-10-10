from datetime import datetime


class Link:

    def __init__(self, name: str, status: int, cpu: float, output: str, effects: [str], created: datetime):
        self.name = name
        self.status = status
        self.cpu = cpu
        self.output = output
        self.effects = effects
        self.created = created

    def display(self):
        return dict(
            name=self.name,
            status=self.status,
            cpu=self.cpu,
            output=self.output,
            effects=self.effects,
            created=self.created
        )
