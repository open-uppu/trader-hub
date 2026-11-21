import sys
from pathlib import Path
from typing import Dict, Any, List, Optional

from .base import BaseConnector
from config import EDCA_DIR

# Safely inject edca path into sys.path
edca_str = str(EDCA_DIR)
if edca_str not in sys.path:
    sys.path.insert(0, edca_str)

try:
    from advisor.archive import (
        load_snapshot,
        previous_week_id,
        save_snapshot,
        snapshot_to_hub,
        week_bounds,
        week_id_for,
    )
    ARCHIVE_LOADED = True
except Exception:
    ARCHIVE_LOADED = False

try:
    from portfolio.rebalancer import Holding, filter_and_allocate, MIN_ORDER_THB
    from core.edca_engine import compute_edca_multiplier, calculate_weekly_execution
    from market_calendar.holiday_engine import get_best_trading_day
    from advisor.ai_advisor import generate_weekly_advisory
    from portfolio.market_scanner import scan_market_opportunities
    from data.price_feed import THAI_STOCKS, get_live_market_metrics
    EDCA_MODULES_LOADED = True
except Exception as e:
    EDCA_MODULES_LOADED = False
    _load_error = str(e)


# Default Holdings baseline from Dime statement
DEFAULT_HOLDINGS_DATA = [
    {"ticker": "TSM", "market_value_usd": 524.44, "port_weight": 29.88, "return_pct": 64.79, "market": "US"},
    {"ticker": "ARM", "market_value_usd": 416.68, "port_weight": 23.74, "return_pct": 18.04, "market": "US"},
    {"ticker": "GOOGL", "market_value_usd": 253.37, "port_weight": 14.44, "return_pct": -7.16, "market": "US"},
    {"ticker": "AMZN", "market_value_usd": 140.54, "port_weight": 8.01, "return_pct": 8.11, "market": "US"},
    {"ticker": "TSLA", "market_value_usd": 139.27, "port_weight": 7.93, "return_pct": -8.59, "market": "US"},
    {"ticker": "CRWD", "market_value_usd": 11.32, "port_weight": 0.64, "return_pct": 102.07, "market": "US"},
    {"ticker": "LLY", "market_value_usd": 19.86, "port_weight": 1.13, "return_pct": 99.04, "market": "US"},
    {"ticker": "SCB", "market_value_usd": 522.0, "port_weight": 66.74, "return_pct": 11.49, "market": "TH"},
    {"ticker": "GULF", "market_value_usd": 76.0, "port_weight": 9.75, "return_pct": 6.81, "market": "TH"},
    {"ticker": "DELTA", "market_value_usd": 72.0, "port_weight": 9.27, "return_pct": -20.27, "market": "TH"},
    {"ticker": "SIRI", "market_value_usd": 48.0, "port_weight": 6.13, "return_pct": -1.85, "market": "TH"},
    {"ticker": "CPALL", "market_value_usd": 1.3, "port_weight": 0.17, "return_pct": -7.54, "market": "TH"},
    {"ticker": "BDMS", "market_value_usd": 1.2, "port_weight": 0.15, "return_pct": -9.59, "market": "TH"},
]

# Curated Focus Watchlist for fast live scanning without blocking
FOCUS_SCANNER_WATCHLIST = ["NVDA", "META", "MSFT", "AAPL", "VOO", "QQQ"]

# Global in-memory cache for opportunities and advisory to avoid slow network blocking
_CACHED_OPPS: List[Dict[str, Any]] = []
_LAST_SCAN_TIME: float = 0.0
_CACHE_TTL_SEC: float = 300.0  # 5 minutes cache

_CACHED_ADVISORY: str = ""
_LAST_ADVISORY_TIME: float = 0.0
_ADVISORY_TTL_SEC: float = 600.0  # 10 minutes cache

_CACHED_THAI_PRICES: Dict[str, float] = {}
_LAST_THAI_PRICE_TIME: float = 0.0


class EdcaConnector(BaseConnector):
    project_id = "edca"
    project_name = "EDCA Investment Advisor"
    description = "Dynamic Value Averaging & Multi-Factor Portfolio Allocator (50 THB Min Order Rule & AI Market Radar)"
    category = "Wealth & DCA"

    def __init__(self, base_weekly_budget: float = 1000.0, thb_usd_rate: float = 34.5):
        self.base_weekly_budget = base_weekly_budget
        self.thb_usd_rate = thb_usd_rate
        self.min_order_thb = 50.0

    def _get_holding_objs(self) -> List[Any]:
        if not EDCA_MODULES_LOADED:
            return []
        return [
            Holding(
                ticker=h["ticker"],
                market_value_usd=h["market_value_usd"],
                port_weight=h["port_weight"],
                return_pct=h["return_pct"]
            )
            for h in DEFAULT_HOLDINGS_DATA
        ]

    def _get_scanner_opportunities(self) -> List[Dict[str, Any]]:
        """Fetch scanned market opportunities for new stock entries (with 5-minute memory cache)."""
        global _CACHED_OPPS, _LAST_SCAN_TIME
        import time
        now = time.time()
        if _CACHED_OPPS and (now - _LAST_SCAN_TIME) < _CACHE_TTL_SEC:
            return _CACHED_OPPS

        if not EDCA_MODULES_LOADED:
            return []
        try:
            opps = scan_market_opportunities(watchlist=FOCUS_SCANNER_WATCHLIST)
            _CACHED_OPPS = [
                {
                    "ticker": o.ticker,
                    "symbol": o.symbol,
                    "current_price": o.current_price,
                    "drawdown_pct": o.drawdown_pct,
                    "rsi14": o.rsi14,
                    "multiplier": o.multiplier,
                    "grade": o.grade,
                    "signal": o.signal,
                    "is_new": True
                }
                for o in opps
            ]
            _LAST_SCAN_TIME = now
            return _CACHED_OPPS
        except Exception:
            # Fallback static opportunities if network drops
            fallback = [
                {"ticker": "META", "symbol": "META", "current_price": 610.0, "drawdown_pct": -21.5, "rsi14": 24.0, "multiplier": 1.70, "grade": "A+", "signal": "ช้อนซื้อของลดราคาด่วน (Deep Discount & Oversold)", "is_new": True},
                {"ticker": "NVDA", "symbol": "NVDA", "current_price": 187.0, "drawdown_pct": -22.0, "rsi14": 30.0, "multiplier": 1.70, "grade": "A+", "signal": "ช้อนซื้อของลดราคาด่วน (Deep Discount & Oversold)", "is_new": True},
                {"ticker": "QQQ", "symbol": "QQQ", "current_price": 656.0, "drawdown_pct": -13.6, "rsi14": 30.5, "multiplier": 1.30, "grade": "A", "signal": "เริ่มทยอยสะสมได้ดี (Attractive Dip)", "is_new": True},
            ]
            _CACHED_OPPS = fallback
            _LAST_SCAN_TIME = now
            return _CACHED_OPPS

    def get_status(self) -> Dict[str, Any]:
        return {
            "project_id": self.project_id,
            "name": self.project_name,
            "status": "active" if EDCA_MODULES_LOADED else "offline",
            "online": EDCA_MODULES_LOADED,
            "modules_loaded": EDCA_MODULES_LOADED
        }

    def _price_map(self, opps: List[Dict[str, Any]]) -> Dict[str, float]:
        """US radar prices plus whole-share Thai SET prices."""
        global _CACHED_THAI_PRICES, _LAST_THAI_PRICE_TIME
        import time
        prices: Dict[str, float] = {}
        for row in opps or []:
            ticker = str(row.get("ticker") or "").replace(".BK", "")
            try:
                prices[ticker] = float(row.get("current_price"))
            except (TypeError, ValueError):
                continue
        now = time.time()
        if _CACHED_THAI_PRICES and (now - _LAST_THAI_PRICE_TIME) < _CACHE_TTL_SEC:
            prices.update(_CACHED_THAI_PRICES)
            return prices
        if EDCA_MODULES_LOADED:
            thai_prices: Dict[str, float] = {}
            for ticker in THAI_STOCKS:
                try:
                    metrics = get_live_market_metrics(ticker)
                    thai_prices[ticker] = float(metrics.current_price)
                except Exception:
                    continue
            if thai_prices:
                _CACHED_THAI_PRICES = thai_prices
                _LAST_THAI_PRICE_TIME = now
                prices.update(thai_prices)
        return prices

    def _live_multiplier(self, opps: Optional[List[Dict[str, Any]]] = None) -> float:
        """Average EDCA multiplier from the live scanner — never the old 0.85 stub."""
        rows = opps if opps is not None else self._get_scanner_opportunities()
        vals = []
        for row in rows or []:
            try:
                vals.append(float(row.get("multiplier")))
            except (TypeError, ValueError):
                continue
        if not vals:
            return 1.0
        return round(max(0.5, min(2.0, sum(vals) / len(vals))), 2)

    def get_summary(self) -> Dict[str, Any]:
        total_usd = sum(h["market_value_usd"] for h in DEFAULT_HOLDINGS_DATA)
        total_thb = total_usd * self.thb_usd_rate

        multiplier = self._live_multiplier() if EDCA_MODULES_LOADED else 1.0
        invest_amount = self.base_weekly_budget * multiplier

        return {
            "total_portfolio_usd": round(total_usd, 2),
            "total_portfolio_thb": round(total_thb, 2),
            "base_weekly_budget": self.base_weekly_budget,
            "recommended_weekly_thb": round(invest_amount, 2),
            "multiplier": multiplier,
            "holdings_count": len(DEFAULT_HOLDINGS_DATA),
            "min_order_thb": self.min_order_thb,
            "kpis": [
                {"label": "พอร์ตรวม (THB)", "value": f"฿{total_thb:,.2f}", "color": "emerald"},
                {"label": "พอร์ตรวม (USD)", "value": f"${total_usd:,.2f}", "color": "cyan"},
                {"label": "งบลงทุนสัปดาห์นี้", "value": f"฿{invest_amount:,.0f}", "color": "amber"},
                {"label": "Dynamic Multiplier", "value": f"{multiplier:.2f}x (ขั้นต่ำ ฿50)", "color": "blue"},
            ]
        }

    def get_details(self) -> Dict[str, Any]:
        summary = self.get_summary()
        holdings = DEFAULT_HOLDINGS_DATA
        holding_objs = self._get_holding_objs()

        allocations_data = []
        best_day = "วันอังคาร"
        advisory_text = "ตลาดอยู่ในโซนพักตัว แนะนำเข้าซื้อหุ้นเทคโนโลยีที่ปรับฐานลงมาลึก"
        multiplier = summary["multiplier"]
        invest_amount = summary["recommended_weekly_thb"]
        buffer_action = "Drawdown from buffer"
        raw_opps = self._get_scanner_opportunities()
        previous_week = None
        week_id = None

        if EDCA_MODULES_LOADED:
            try:
                import datetime
                today = datetime.date.today()
                monday = today - datetime.timedelta(days=today.weekday())
                best_day_date, best_day_info = get_best_trading_day(monday)
                trading_day_str = f"{best_day_date.strftime('%Y-%m-%d')} ({best_day_info}) ช่วงเวลา 21:45 - 23:00 น."
                best_day = best_day_info

                mult = self._live_multiplier(raw_opps)
                multiplier = mult
                current_buffer = 400.0
                plan = calculate_weekly_execution(
                    base_budget=self.base_weekly_budget,
                    multiplier=mult,
                    current_buffer=current_buffer
                )
                invest_amount = plan.invest_amount
                buffer_action = "Deposit to buffer" if plan.buffer_delta > 0 else "Drawdown from buffer"

                # Filter and allocate considering opportunities & Dime 50 THB minimum order rule
                alloc_kwargs = {
                    "holdings": holding_objs,
                    "available_budget": plan.invest_amount,
                    "opportunities": raw_opps,
                    "min_order_thb": self.min_order_thb,
                }
                try:
                    import inspect
                    if "prices" in inspect.signature(filter_and_allocate).parameters:
                        alloc_kwargs["prices"] = self._price_map(raw_opps)
                    allocations = filter_and_allocate(**alloc_kwargs)
                except TypeError:
                    alloc_kwargs.pop("prices", None)
                    allocations = filter_and_allocate(**alloc_kwargs)
                allocations_data = [
                    {
                        "ticker": a.ticker,
                        "allocated_thb": round(a.allocated_thb, 2),
                        "percentage": round(a.percentage, 1),
                        "action": a.action,
                        "reason": a.reason,
                        "shares": int(getattr(a, "shares", 0) or 0),
                    }
                    for a in allocations
                ]
                global _CACHED_ADVISORY, _LAST_ADVISORY_TIME
                now_ts = datetime.datetime.now().timestamp()
                if _CACHED_ADVISORY and (now_ts - _LAST_ADVISORY_TIME) < _ADVISORY_TTL_SEC:
                    advisory_text = _CACHED_ADVISORY
                else:
                    advisory_text = generate_weekly_advisory(plan, allocations, trading_day_str)
                    _CACHED_ADVISORY = advisory_text
                    _LAST_ADVISORY_TIME = now_ts
                week_id = week_id_for(today) if ARCHIVE_LOADED else None
                if ARCHIVE_LOADED and week_id:
                    start, end = week_bounds(week_id)
                    save_snapshot({
                        "week_id": week_id,
                        "week_start": start.isoformat(),
                        "week_end": end.isoformat(),
                        "as_of": today.isoformat(),
                        "reconstructed": False,
                        "source": "hub-connector",
                        "trading_day": {
                            "date": best_day_date.isoformat(),
                            "reason": best_day_info,
                            "full_string": trading_day_str,
                        },
                        "execution_plan": {
                            "base_budget": plan.base_budget,
                            "multiplier": plan.multiplier,
                            "invest_amount": plan.invest_amount,
                            "buffer_delta": plan.buffer_delta,
                            "new_buffer": plan.new_buffer,
                        },
                        "allocations": allocations_data,
                        "scanner_opportunities": raw_opps,
                        "advisory": advisory_text,
                    })
            except Exception as e:
                advisory_text = f"ระบบประมวลผลพื้นฐาน: แนะนำเข้าซื้อตามน้ำหนักพอร์ตปกติ ({str(e)})"

        if ARCHIVE_LOADED:
            try:
                prev_snap = load_snapshot(previous_week_id())
                if prev_snap:
                    previous_week = snapshot_to_hub(prev_snap)
                if week_id is None:
                    import datetime as _dt
                    week_id = week_id_for(_dt.date.today())
            except Exception:
                previous_week = None

        return {
            "summary": summary,
            "holdings": holdings,
            "weekly_execution": {
                "base_budget": self.base_weekly_budget,
                "multiplier": multiplier,
                "invest_amount_thb": invest_amount,
                "buffer_action": buffer_action,
                "allocations": allocations_data
            },
            "scanner_opportunities": raw_opps,
            "min_order_rule": {
                "min_order_thb": self.min_order_thb,
                "platform": "Dime!",
                "enforced": True,
                "description": "เกณฑ์คำสั่งซื้อขั้นต่ำ 50 บาทต่อออเดอร์ของ Dime! ระบบจะรวมงบหรือทบเข้า Cash Buffer หากจัดสรรแล้วได้ต่ำกว่า 50 บาท"
            },
            "advisory": advisory_text,
            "optimal_day": best_day,
            "week_id": week_id,
            "previous_week": previous_week,
        }
