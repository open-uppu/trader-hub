import pytest
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from connectors.daytrad_connector import DaytradConnector, SUPPORTED_SPECIALISTS


def test_daytrad_connector_status():
    connector = DaytradConnector()
    status = connector.get_status()
    assert status["project_id"] == "daytrad"
    assert "status" in status
    assert "online" in status


def test_daytrad_connector_summary():
    connector = DaytradConnector()
    summary = connector.get_summary()
    assert "target_profit_pct" in summary
    assert summary["target_profit_pct"] == 3.0
    assert "max_daily_loss_pct" in summary
    assert summary["max_daily_loss_pct"] == 5.0
    assert "kpis" in summary
    # Multi-asset verification
    assert summary["specialists_count"] == 9
    assert len(summary["symbols_list"]) == 9
    assert "XAUUSD" in summary["symbols_list"]
    assert "BTCUSD" in summary["symbols_list"]
    assert "ETHUSD" in summary["symbols_list"]
    assert "execution_status" in summary
    assert "state" in summary["execution_status"]
    assert "message" in summary["execution_status"]


def test_daytrad_connector_details():
    connector = DaytradConnector()
    details = connector.get_details()
    assert "charts" in details
    assert isinstance(details["charts"], list)
    assert "learned_rules" in details
    assert "mistakes_database" in details
    assert "daily_target" in details
    # 9 Specialists & positions verification
    assert "specialists" in details
    assert len(details["specialists"]) == 9
    assert "open_positions" in details
    assert isinstance(details["open_positions"], list)
    assert "execution_status" in details
    assert details["execution_status"]["state"] in ("IN_POSITION", "WAITING", "STANDBY")
    assert "account" in details
    assert "balance" in details["account"]
    assert "equity" in details["account"]
