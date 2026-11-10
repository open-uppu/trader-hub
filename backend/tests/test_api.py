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
    assert "previous_week" in data


def test_api_daytrad_details(client):
    response = client.get("/api/v1/projects/daytrad/details")
    assert response.status_code == 200
    data = response.json()
    assert "charts" in data
    assert "daily_target" in data


def test_api_not_found(client):
    response = client.get("/api/v1/projects/non_existent/details")
    assert response.status_code == 404


def _receive_type(ws, expected: str, limit: int = 6):
    last = None
    for _ in range(limit):
        last = ws.receive_json()
        if last.get("type") == expected:
            return last
    raise AssertionError(f"did not receive {expected}, last={last}")


def test_ws_telemetry_hello_and_pong(client):
    with client.websocket_connect("/ws/telemetry") as ws:
        hello = ws.receive_json()
        assert hello["type"] == "hello"
        assert hello["interval_sec"] == 1.0
        ws.send_text("ping")
        pong = _receive_type(ws, "pong")
        assert "ts" in pong


def test_ws_telemetry_subscribe_validates_symbol(client):
    with client.websocket_connect("/api/v1/ws/telemetry") as ws:
        assert ws.receive_json()["type"] == "hello"
        ws.send_json({"action": "subscribe", "symbol": "btcusd", "timeframe": "m5"})
        ack = _receive_type(ws, "subscribed")
        assert ack["symbol"] == "BTCUSD"
        assert ack["timeframe"] == "M5"

        ws.send_json({"action": "subscribe", "symbol": "../etc/passwd", "timeframe": "NOPE"})
        rejected = _receive_type(ws, "subscribed")
        assert rejected["symbol"] == "BTCUSD"
        assert rejected["timeframe"] == "M5"
