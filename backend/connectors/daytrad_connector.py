import os
import socket
import json
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, List, Optional

from .base import BaseConnector
from config import DAYTRAD_DIR

SUPPORTED_SPECIALISTS = [
    {"key": "gold", "symbol": "XAUUSD", "name": "Gold (ทองคำ)", "category": "Commodities", "strategy": "MTF Momentum Cross", "timeframe": "M5"},
    {"key": "btc", "symbol": "BTCUSD", "name": "Bitcoin", "category": "Crypto", "strategy": "EMA Pullback Rejection", "timeframe": "M5"},
    {"key": "eth", "symbol": "ETHUSD", "name": "Ethereum", "category": "Crypto", "strategy": "Bollinger Bands Reversion", "timeframe": "M5"},
    {"key": "xag", "symbol": "XAGUSD", "name": "Silver (โลหะเงิน)", "category": "Commodities", "strategy": "High-Volatility Scalper", "timeframe": "M15"},
    {"key": "gbp", "symbol": "GBPUSD", "name": "GBP/USD", "category": "Forex", "strategy": "London Breakout Flow", "timeframe": "M15"},
    {"key": "eur", "symbol": "EURUSD", "name": "EUR/USD", "category": "Forex", "strategy": "Trend Exhaustion Scalper", "timeframe": "M15"},
    {"key": "xpt", "symbol": "XPTUSD", "name": "Platinum (ทองคำขาว)", "category": "Commodities", "strategy": "Mean Reversion Channel", "timeframe": "M15"},
    {"key": "ukoil", "symbol": "UKOIL", "name": "Brent Crude Oil", "category": "Energy", "strategy": "Momentum Swing", "timeframe": "M15"},
    {"key": "xng", "symbol": "XNGUSD", "name": "Natural Gas", "category": "Energy", "strategy": "Spike Reversal", "timeframe": "M15"},
]


class DaytradConnector(BaseConnector):
    project_id = "daytrad"
    project_name = "Agentic Multi-Asset Day Trading"
    description = "Autonomous Multi-Asset (9 Specialists) Quantitative & Multimodal Vision Day Trading Squad with 3% Daily Target Lock"
    category = "Algorithmic Trading"

    def __init__(self, bridge_port: int = 8080):
        self.bridge_port = int(os.getenv("DAYTRAD_PORT", str(bridge_port)))
        self.artifacts_dir = DAYTRAD_DIR / "artifacts"
        self.charts_dir = self.artifacts_dir / "charts"
        self.journal_dir = DAYTRAD_DIR / "journal"

    def _is_bridge_online(self) -> bool:
        """Check if local or network daytrad MT4/MT5 bridge is actively listening."""
        candidate_hosts = [h for h in [os.getenv("DAYTRAD_HOST"), "host.docker.internal", "100.105.249.12", "127.0.0.1"] if h]
        ports = [self.bridge_port, 8000, 8001, 8080]
        for host in candidate_hosts:
            for port in ports:
                # Avoid self-connection on 127.0.0.1:8000 if port is Hub itself
                if host in ("127.0.0.1", "localhost") and port == 8000 and not os.getenv("DAYTRAD_PORT"):
                    continue
                try:
                    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                        s.settimeout(0.25)
                        if s.connect_ex((host, port)) == 0:
                            return True
                except Exception:
                    pass
        return False

    def _fetch_all_snapshots(self) -> List[Dict[str, Any]]:
        """Fetch snapshots from all active bridge ports (e.g. 8000 for Cent, 8001 for Demo)."""
        candidate_hosts = [h for h in [os.getenv("DAYTRAD_HOST"), "host.docker.internal", "100.105.249.12", "127.0.0.1"] if h]
        ports = [self.bridge_port, 8000, 8001, 8080]
        results = []
        seen_accounts = set()
        for host in candidate_hosts:
            for port in ports:
                if host in ("127.0.0.1", "localhost") and port == 8000 and not os.getenv("DAYTRAD_PORT"):
                    continue
                try:
                    url = f"http://{host}:{port}/api/dashboard/snapshot?symbol=XAUUSD&timeframe=M5"
                    req = urllib.request.Request(url, headers={"User-Agent": "TraderHubConnector/1.0"})
                    with urllib.request.urlopen(req, timeout=0.8) as response:
                        if response.status == 200:
                            data = json.loads(response.read().decode("utf-8"))
                            if isinstance(data, dict) and data.get("type") == "snapshot":
                                acc_num = data.get("account", {}).get("account_number")
                                if acc_num and acc_num not in seen_accounts:
                                    seen_accounts.add(acc_num)
                                    results.append({
                                        "port": port,
                                        "host": host,
                                        "account": data.get("account", {}),
                                        "portfolio": data.get("portfolio", {}),
                                        "snapshot": data,
                                    })
                except Exception:
                    continue
        return results

    def get_bars(self, symbol: str, timeframe: str = "M5") -> List[Dict[str, Any]]:
        """OHLC bars for one symbol from the first bridge that answers with bars."""
        candidate_hosts = [h for h in [os.getenv("DAYTRAD_HOST"), "host.docker.internal", "100.105.249.12", "127.0.0.1"] if h]
        for host in candidate_hosts:
            for port in [self.bridge_port, 8000, 8001, 8080]:
                if host in ("127.0.0.1", "localhost") and port == 8000 and not os.getenv("DAYTRAD_PORT"):
                    continue
                try:
                    url = f"http://{host}:{port}/api/dashboard/snapshot?symbol={symbol}&timeframe={timeframe}"
                    req = urllib.request.Request(url, headers={"User-Agent": "TraderHubConnector/1.0"})
                    with urllib.request.urlopen(req, timeout=0.8) as response:
                        data = json.loads(response.read().decode("utf-8"))
                    if isinstance(data, dict) and data.get("type") == "snapshot" and data.get("bars"):
                        return data["bars"]
                except Exception:
                    continue
        return []

    def _fetch_live_snapshot(self) -> Optional[Dict[str, Any]]:
        """Attempt to fetch live snapshot telemetry from local bridge API or direct python fallback."""
        all_snapshots = self._fetch_all_snapshots()
        if all_snapshots:
            return all_snapshots[0]["snapshot"]

        # 2. Local Python fallback via daytrad's feed_provider
        try:
            import sys
            daytrad_path = str(DAYTRAD_DIR)
            if daytrad_path not in sys.path:
                sys.path.insert(0, daytrad_path)
            from frontend.feed_provider import DashboardFeedProvider
            provider = DashboardFeedProvider()
            return provider.get_snapshot("XAUUSD", "M5")
        except Exception:
            pass

        return None

    def _get_specialist_runtime_heartbeats(self) -> Dict[str, Any]:
        """Check persistent specialist runtime heartbeat files."""
        runtime_dir = self.journal_dir / "specialist_runtime"
        result = {}
        if runtime_dir.exists():
            for f in runtime_dir.glob("*.json"):
                try:
                    data = json.loads(f.read_text(encoding="utf-8"))
                    specs = data.get("specialists", {})
                    for k, v in specs.items():
                        result[k] = v
                except Exception:
                    pass
        return result

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

    def _compute_execution_status(self, snapshot: Optional[Dict[str, Any]], online: bool) -> Dict[str, Any]:
        """Determine whether the system is currently in position or waiting for setup."""
        if snapshot:
            open_positions = snapshot.get("open_positions", [])
            connected = snapshot.get("account", {}).get("connected", False)
            floating_pnl = float(snapshot.get("account", {}).get("floating_pnl", 0.0))

            if open_positions:
                pos_count = len(open_positions)
                symbols = list({p.get("symbol", "") for p in open_positions})
                return {
                    "state": "IN_POSITION",
                    "badge": "IN POSITION (ถือไม้)",
                    "badge_color": "amber",
                    "message": f"ถือออเดอร์ในตลาด {pos_count} ไม้ ({', '.join(symbols)}) | Floating PnL: ${floating_pnl:+.2f}",
                    "active_count": pos_count,
                    "connected": connected,
                    "mode": snapshot.get("account", {}).get("mode", "LIVE")
                }
            elif connected:
                return {
                    "state": "WAITING",
                    "badge": "WAIT / SCANNING (รอจังหวะ)",
                    "badge_color": "cyan",
                    "message": "0 ไม้ในตลาด - ระบบกำลังมอนิเตอร์สัญญาณและรอจังหวะแท่งเทียน M5/M15",
                    "active_count": 0,
                    "connected": True,
                    "mode": snapshot.get("account", {}).get("mode", "LIVE")
                }

        if online:
            return {
                "state": "WAITING",
                "badge": "BRIDGE ONLINE (รอเชื่อมต่อ EA)",
                "badge_color": "cyan",
                "message": "Bridge เชื่อมต่อพร้อมทำงาน - กำลังรอข้อมูล Telemetry จาก MetaTrader EA",
                "active_count": 0,
                "connected": False,
                "mode": "STANDBY"
            }

        return {
            "state": "STANDBY",
            "badge": "STANDBY (รอเปิดบอท)",
            "badge_color": "zinc",
            "message": "ระบบอยู่ในสถานะสแตนด์บาย (0 ไม้ในตลาด - สั่งรัน main.py เพื่อเริ่มสแกน 9 สินทรัพย์)",
            "active_count": 0,
            "connected": False,
            "mode": "OFFLINE"
        }

    def get_summary(self) -> Dict[str, Any]:
        status_info = self.get_status()
        chart_count = len(self._scan_charts())
        snapshot = self._fetch_live_snapshot()
        exec_status = self._compute_execution_status(snapshot, status_info["online"])

        # Determine balance, equity, floating and target details from snapshot or defaults
        balance = 10000.0
        equity = 10000.0
        floating_pnl = 0.0
        daily_pnl = 0.0
        daily_pct = 0.0
        account_num = "99999999"
        account_server = "PaperTrading-Simulation"
        account_mode = "PAPER SIMULATION"
        connected = status_info["online"]
        last_sync = datetime.now(timezone.utc).isoformat()

        if snapshot:
            portfolio = snapshot.get("portfolio", {})
            acc = snapshot.get("account", {})
            balance = float(acc.get("balance", balance))
            equity = float(acc.get("equity", equity))
            floating_pnl = float(acc.get("floating_pnl", 0.0))
            starting_bal = float(portfolio.get("starting_balance", balance))
            if starting_bal == 10000.0 and balance < 1000.0:
                # Sanitize unscaled default baseline from older bridge code
                daily_pnl = 0.0
                daily_pct = 0.0
            else:
                daily_pnl = float(portfolio.get("realized_pnl_usd", 0.0))
                daily_pct = float(portfolio.get("daily_return_pct", 0.0))
            account_num = str(acc.get("account_number", account_num))
            account_server = acc.get("server", account_server)
            account_mode = acc.get("mode", account_mode)
            connected = acc.get("connected", connected)
            last_sync = acc.get("last_sync", last_sync)

        return {
            "symbol": "9 Multi-Assets (Gold, Crypto, FX, Energy)",
            "symbols_list": [s["symbol"] for s in SUPPORTED_SPECIALISTS],
            "specialists_count": len(SUPPORTED_SPECIALISTS),
            "target_profit_pct": 3.0,
            "max_daily_loss_pct": 5.0,
            "base_capital_usd": balance,
            "current_equity_usd": equity,
            "daily_target_usd": round(balance * 0.03, 2),
            "max_loss_usd": round(balance * 0.05, 2),
            "daily_pnl_usd": daily_pnl,
            "daily_return_pct": daily_pct,
            "floating_pnl_usd": floating_pnl,
            "bot_status": "ONLINE (Looping)" if connected else "STANDBY (Squad Ready)",
            "charts_available": chart_count,
            "execution_status": exec_status,
            "account": {
                "account_number": account_num,
                "server": account_server,
                "mode": account_mode,
                "balance": balance,
                "equity": equity,
                "floating_pnl": floating_pnl,
                "realized_pnl": daily_pnl,
                "daily_return_pct": daily_pct,
                "connected": connected,
                "last_sync": last_sync
            },
            "kpis": [
                {"label": "มูลค่าพอร์ตสุทธิ (Equity)", "value": f"${equity:,.2f}", "color": "emerald" if equity >= balance else "rose"},
                {"label": "เงินทุนคงเหลือ (Balance)", "value": f"${balance:,.2f}", "color": "cyan"},
                {"label": "สถานะการเข้าซื้อ/ถือไม้", "value": exec_status["badge"], "color": exec_status["badge_color"]},
                {"label": "กำไรสะสมวันนี้ (Realized)", "value": f"{'+' if daily_pnl >= 0 else ''}${daily_pnl:,.2f} ({'+' if daily_pct >= 0 else ''}{daily_pct:.1f}%)", "color": "emerald" if daily_pnl >= 0 else "rose"},
                {"label": "Floating PnL ไม้ที่ถืออยู่", "value": f"{'+' if floating_pnl >= 0 else ''}${floating_pnl:,.2f}", "color": "emerald" if floating_pnl > 0 else ("rose" if floating_pnl < 0 else "zinc")},
                {"label": "เป้าหมายกำไรรายวัน", "value": f"+3.0% (+${round(balance * 0.03):,.0f})", "color": "amber"},
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
        snapshot = self._fetch_live_snapshot()
        runtime_heartbeats = self._get_specialist_runtime_heartbeats()

        # Build specialists list with live/runtime status
        specialists = []
        for s in SUPPORTED_SPECIALISTS:
            key = s["key"]
            spec_copy = dict(s)
            
            # Check live snapshot status
            if snapshot and key in snapshot.get("specialists", {}):
                live_spec = snapshot["specialists"][key]
                spec_copy["status"] = live_spec.get("status", "ACTIVE")
            elif key in runtime_heartbeats:
                hb = runtime_heartbeats[key]
                spec_copy["status"] = hb.get("status", "WAIT_SETUP")
                spec_copy["last_action"] = hb.get("action")
            else:
                spec_copy["status"] = "READY (Standby)"

            specialists.append(spec_copy)

        # Open positions & closed orders
        open_positions = []
        closed_orders = []
        if snapshot:
            open_positions = snapshot.get("open_positions", [])
            closed_orders = snapshot.get("closed_orders", [])

        return {
            "summary": summary,
            "account": summary.get("account", {}),
            "portfolio": snapshot.get("portfolio", {}) if snapshot else {},
            "execution_status": summary["execution_status"],
            "specialists": specialists,
            "open_positions": open_positions,
            "closed_orders": closed_orders,
            "active_accounts": self._fetch_all_snapshots(),
            "daily_target": {
                "target_pct": 3.0,
                "current_pct": summary.get("daily_return_pct", 0.0),
                "cutoff_pct": -5.0,
                "status": summary["execution_status"]["state"],
                "rules": [
                    "เมื่อกำไรสะสมถึง 3.0% ระบบจะล็อกกำไรและลดความเสี่ยงทันที (Soft Target Lock)",
                    "หากกำไรแตะ 20.0% จะปิดระบบล็อกกำไรทั้งพอร์ต (Hard Target Lock)",
                    "หากขาดทุนแตะ -5.0% ระบบจะหยุดเปิดออเดอร์ใหม่เพื่อรักษาทุน (Hard Stop)"
                ]
            },
            "charts": charts[:12],
            "learned_rules": learned_rules,
            "mistakes_database": mistakes_database
        }
