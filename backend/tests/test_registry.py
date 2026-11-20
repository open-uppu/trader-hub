import pytest
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from connectors.base import BaseConnector
from connectors.registry import ConnectorRegistry


class MockProjectConnector(BaseConnector):
    project_id = "mock_project"
    project_name = "Mock Project"
    description = "Mock description"

    def get_status(self):
        return {"status": "active", "online": True}

    def get_summary(self):
        return {"kpis": [{"label": "Score", "value": "100"}]}

    def get_details(self):
        return {"data": "detailed_mock_data"}


def test_registry_register_and_retrieve():
    registry = ConnectorRegistry()
    connector = MockProjectConnector()
    registry.register(connector)

    retrieved = registry.get("mock_project")
    assert retrieved is not None
    assert retrieved.project_name == "Mock Project"
    assert retrieved.get_status()["status"] == "active"


def test_registry_list_all():
    registry = ConnectorRegistry()
    registry.register(MockProjectConnector())

    projects = registry.list_all()
    assert len(projects) == 1
    assert projects[0]["id"] == "mock_project"
    assert projects[0]["name"] == "Mock Project"
    assert projects[0]["status"] == "active"
