import pytest
import sys
from pathlib import Path
from fastapi.testclient import TestClient

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from main import app


@pytest.fixture
def client():
    return TestClient(app)


def test_api_list_projects(client):
    response = client.get("/api/v1/projects")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    project_ids = [p["id"] for p in data]
    assert "edca" in project_ids
    assert "daytrad" in project_ids


def test_api_edca_details(client):
    response = client.get("/api/v1/projects/edca/details")
    assert response.status_code == 200
    data = response.json()
    assert "holdings" in data
    assert "weekly_execution" in data


def test_api_daytrad_details(client):
    response = client.get("/api/v1/projects/daytrad/details")
    assert response.status_code == 200
    data = response.json()
    assert "charts" in data
    assert "daily_target" in data


def test_api_not_found(client):
    response = client.get("/api/v1/projects/non_existent/details")
    assert response.status_code == 404
