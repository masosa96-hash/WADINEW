class ProjectMemory:
    def __init__(self):
        self.architecture = {}
        self.stack = {}
        self.database_schema = {}
        self.api_contracts = {}
        self.decisions = []

    def dict(self):
        return {
            "stack": self.stack,
            "architecture": self.architecture,
            "database_schema": self.database_schema,
            "api_contracts": self.api_contracts,
            "decisions": self.decisions
        }

    def __str__(self):
        return str(self.dict())
