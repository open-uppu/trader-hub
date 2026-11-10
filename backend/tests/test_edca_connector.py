import pytest
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from connectors.edca_connector import EdcaConnector


def test_edca_connector_status():
    connector = EdcaConnector()
    status = connector.get_status()
    assert status["status"] in ("active", "idle", "offline")
    assert "project_id" in status
    assert status["project_id"] == "edca"


def test_edca_connector_summary():
    connector = EdcaConnector()
    summary = connector.get_summary()
    assert "total_portfolio_usd" in summary
    assert "base_weekly_budget" in summary
    assert summary["base_weekly_budget"] == 1000.0
    assert summary["min_order_thb"] == 50.0


def test_edca_connector_details():
    connector = EdcaConnector()
    details = connector.get_details()
    assert "holdings" in details
    assert len(details["holdings"]) > 0
    assert "weekly_execution" in details
    assert "allocations" in details["weekly_execution"]
    assert len(details["weekly_execution"]["allocations"]) > 0
    assert "advisory" in details
    assert "optimal_day" in details
    assert "previous_week" in details
    assert "week_id" in details
    assert "missing 1 required positional argument" not in details["advisory"]

    # 50 THB minimum order rule verification
    assert "min_order_rule" in details
    assert details["min_order_rule"]["min_order_thb"] == 50.0
    assert details["min_order_rule"]["platform"] == "Dime!"
    for alloc in details["weekly_execution"]["allocations"]:
        if alloc["allocated_thb"] > 0:
            assert alloc["allocated_thb"] >= 50.0, f"{alloc['ticker']} allocation {alloc['allocated_thb']} is below 50 THB"

    # Scanner opportunities verification
    assert "scanner_opportunities" in details
    assert isinstance(details["scanner_opportunities"], list)
    assert len(details["scanner_opportunities"]) > 0
