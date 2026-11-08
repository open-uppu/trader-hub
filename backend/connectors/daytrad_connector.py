import os
import socket
from pathlib import Path
from typing import Dict, Any, List

from .base import BaseConnector
from config import DAYTRAD_DIR


class DaytradConnector(BaseConnector):
    project_id = "daytrad"
    project_name = "Agentic Gold Day Trading"
    description = "Autonomous XAUUSD Quantitative & Multimodal Vision Day Trading System with 3% Daily Target Lock"
    category = "Algorithmic Trading"

    def __init__(self, bridge_port: int = 8080):
        self.bridge_port = bridge_port
        self.artifacts_dir = DAYTRAD_DIR / "artifacts"
        self.charts_dir = self.artifacts_dir / "charts"
        self.journal_dir = DAYTRAD_DIR / "journal"

    def _is_bridge_online(self) -> bool:
        """Check if local daytrad MT4/MT5 bridge is actively listening."""
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.settimeout(0.2)
                return s.connect_ex(("127.0.0.1", self.bridge_port)) == 0
        except Exception:
            return False

    def get_status(self) -> Dict[str, Any]:
        online = self._is_bridge_online()
        return {
            "project_id": self.project_id,
            "name": self.project_name,
            "status": "active" if online else "standby",
            "online": online,
            "bridge_port": self.bridge_port,
            "data_ready": self.artifacts_dir.exists()
        }

    def get_summary(self) -> Dict[str, Any]:
        status_info = self.get_status()
        chart_count = len(self._scan_charts())
        return {
            "symbol": "XAUUSD (Gold)",
            "target_profit_pct": 3.0,
            "max_daily_loss_pct": 2.0,
            "base_capital_usd": 10000.0,
            "daily_target_usd": 300.0,
            "max_loss_usd": 200.0,
            "bot_status": "ONLINE (Looping)" if status_info["online"] else "STANDBY (Data Available)",
            "charts_available": chart_count,
            "kpis": [
                {"label": "คู่เทรดหลัก", "value": "XAUUSD (Gold)", "color": "amber"},
                {"label": "เป้าหมายกำไรรายวัน", "value": "+3.0% ($300)", "color": "emerald"},
                {"label": "คัทออฟขาดทุนสูงสุด", "value": "-2.0% ($200)", "color": "rose"},
                {"label": "สถานะระบบ", "value": "STANDBY" if not status_info["online"] else "ACTIVE", "color": "cyan"},
            ]
        }

    def _scan_charts(self) -> List[Dict[str, Any]]:
        charts = []
        dirs_to_check = [self.charts_dir, self.artifacts_dir]
        seen_names = set()

        for d in dirs_to_check:
            if not d.exists():
                continue
            for f in sorted(d.glob("*.png"), key=lambda p: p.stat().st_mtime, reverse=True):
                if f.name in seen_names:
                    continue
                seen_names.add(f.name)
                charts.append({
                    "filename": f.name,
                    "path": str(f),
                    "size_kb": round(f.stat().st_size / 1024, 1),
                    "modified": f.stat().st_mtime,
                    "url": f"/api/v1/projects/daytrad/charts/{f.name}"
                })
        return charts

    def _read_journal_file(self, filename: str) -> str:
        filepath = self.journal_dir / filename
        if filepath.exists():
            try:
                return filepath.read_text(encoding="utf-8")
            except Exception as e:
                return f"Error reading {filename}: {str(e)}"
        return f"File {filename} not found."

    def get_details(self) -> Dict[str, Any]:
        summary = self.get_summary()
        charts = self._scan_charts()
        learned_rules = self._read_journal_file("learned_rules.md")
        mistakes_database = self._read_journal_file("mistakes_database.md")

        return {
            "summary": summary,
            "daily_target": {
                "target_pct": 3.0,
                "current_pct": 0.0,
                "cutoff_pct": -2.0,
                "status": "STANDBY",
                "rules": [
                    "เมื่อกำไรสะสมถึง 3.0% ระบบจะล็อกกำไรและหยุดเปิดออเดอร์ทันที (Target Lock)",
                    "หากขาดทุนแตะ -2.0% ระบบจะหยุดเทรดทันทีเพื่อรักษาทุน (Hard Stop)"
                ]
            },
            "charts": charts[:12],  # Return up to 12 recent charts
            "learned_rules": learned_rules,
            "mistakes_database": mistakes_database
        }
