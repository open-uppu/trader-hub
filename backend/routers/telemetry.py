"""WebSocket stream that pushes hub telemetry instead of making the browser poll."""
from __future__ import annotations

import asyncio
import json
import logging
import re
import time
from datetime import datetime, timezone
from typing import Any, Dict, Optional, Set, Tuple

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

logger = logging.getLogger("telemetry_router")
router = APIRouter(tags=["telemetry"])

TICK_INTERVAL_SEC = 1.0
SNAPSHOT_INTERVAL_SEC = 15.0
_SYMBOL_RE = re.compile(r"[A-Z0-9]{3,12}")
_TF_RE = re.compile(r"M\d{1,3}|H\d{1,2}")


def init_telemetry(registry) -> None:
    hub.registry = registry


class _Client:
    def __init__(self, websocket: WebSocket):
        self.websocket = websocket
        self.symbol = "XAUUSD"
        self.timeframe = "M5"


class TelemetryHub:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
        self.clients: Dict[WebSocket, _Client] = {}
        self.registry = None
        self.latest_snapshot: Optional[Dict[str, Any]] = None
        self._task: Optional[asyncio.Task] = None
        self._last_full = 0.0

    async def connect(self, websocket: WebSocket) -> _Client:
        await websocket.accept()
        client = _Client(websocket)
        self.active_connections.add(websocket)
        self.clients[websocket] = client
        logger.info("telemetry client connected (%s)", len(self.clients))
        return client

    def disconnect(self, websocket: WebSocket) -> None:
        self.active_connections.discard(websocket)
        self.clients.pop(websocket, None)

    def ensure_publisher(self) -> None:
        if self._task is None or self._task.done():
            self._task = asyncio.create_task(self._publish_loop())

    async def broadcast(self, message: Dict[str, Any]) -> None:
        for connection in list(self.active_connections):
            await self.send(connection, message)

    async def send(self, websocket: WebSocket, message: Dict[str, Any]) -> None:
        try:
            await websocket.send_json(message)
        except Exception:
            self.disconnect(websocket)

    async def push_symbol(self, websocket: WebSocket, symbol: str, timeframe: str) -> None:
        tick = await asyncio.to_thread(load_tick, self.registry, symbol, timeframe)
        if tick and websocket in self.clients:
            await self.send(websocket, {"type": "tick", "ts": _now(), **tick})

    async def _publish_loop(self) -> None:
        try:
            while self.clients:
                # Yield first so a short-lived client (tests, refreshes) can
                # finish the handshake without starting a bridge scan.
                await asyncio.sleep(TICK_INTERVAL_SEC)
                if not self.clients:
                    break
                try:
                    now = time.monotonic()
                    if self.latest_snapshot is None or (now - self._last_full) >= SNAPSHOT_INTERVAL_SEC:
                        await self._publish_snapshot()
                        self._last_full = time.monotonic()
                    await self._publish_ticks()
                except Exception as exc:
                    logger.warning("telemetry publish failed: %s", exc)
        except asyncio.CancelledError:
            raise
        finally:
            self._task = None

    async def _publish_snapshot(self) -> None:
        payload = await asyncio.to_thread(load_snapshot, self.registry)
        message = {"type": "snapshot", "ts": _now(), **payload}
        self.latest_snapshot = message
        if self.clients:
            await self.broadcast(message)

    async def _publish_ticks(self) -> None:
        pairs = {(client.symbol, client.timeframe) for client in self.clients.values()}
        if not pairs:
            return
        ticks = await asyncio.to_thread(load_ticks, self.registry, pairs)
        ts = _now()
        for websocket, client in list(self.clients.items()):
            tick = ticks.get((client.symbol, client.timeframe))
            if not tick:
                await self.send(websocket, {
                    "type": "heartbeat",
                    "ok": False,
                    "ts": ts,
                    "symbol": client.symbol,
                })
                continue
            await self.send(websocket, {"type": "tick", "ts": ts, **tick})


hub = TelemetryHub()


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def load_snapshot(registry) -> Dict[str, Any]:
    if registry is None:
        return {"projects": [], "daytrad": None, "edca": None}
    projects: list = []
    daytrad = None
    edca = None
    try:
        projects = registry.list_all()
    except Exception as exc:
        logger.warning("project list failed: %s", exc)
    try:
        connector = registry.get("daytrad")
        if connector:
            daytrad = connector.get_details()
    except Exception as exc:
        logger.warning("daytrad snapshot failed: %s", exc)
    try:
        connector = registry.get("edca")
        if connector:
            edca = connector.get_details()
    except Exception as exc:
        logger.warning("edca snapshot failed: %s", exc)
    return {"projects": projects, "daytrad": daytrad, "edca": edca}


def load_tick(registry, symbol: str, timeframe: str) -> Optional[Dict[str, Any]]:
    if registry is None:
        return None
    connector = registry.get("daytrad")
    if connector is None or not hasattr(connector, "get_stream_tick"):
        return None
    try:
        return connector.get_stream_tick(symbol, timeframe)
    except Exception as exc:
        logger.debug("stream tick failed: %s", exc)
        return None


def load_ticks(registry, pairs: Set[Tuple[str, str]]) -> Dict[Tuple[str, str], Dict[str, Any]]:
    found = {}
    for symbol, timeframe in pairs:
        tick = load_tick(registry, symbol, timeframe)
        if tick:
            found[(symbol, timeframe)] = tick
    return found


def _parse_client_message(raw: str) -> Dict[str, Any]:
    text = (raw or "").strip()
    if text == "ping":
        return {"action": "ping"}
    try:
        data = json.loads(text)
    except Exception:
        return {}
    return data if isinstance(data, dict) else {}


def _clean_symbol(value: Any, default: str = "XAUUSD") -> str:
    symbol = str(value or default).upper()
    return symbol if _SYMBOL_RE.fullmatch(symbol) else default


def _clean_timeframe(value: Any, default: str = "M5") -> str:
    timeframe = str(value or default).upper()
    return timeframe if _TF_RE.fullmatch(timeframe) else default


async def _serve(websocket: WebSocket) -> None:
    client = await hub.connect(websocket)
    try:
        await websocket.send_json({
            "type": "hello",
            "message": "Connected to Trader Hub Telemetry Stream",
            "interval_sec": TICK_INTERVAL_SEC,
        })
        if hub.latest_snapshot:
            await websocket.send_json(hub.latest_snapshot)
        hub.ensure_publisher()
        while True:
            raw = await websocket.receive_text()
            data = _parse_client_message(raw)
            action = data.get("action") or data.get("type")
            if action == "ping" or (raw or "").strip() == "ping":
                await websocket.send_json({"type": "pong", "ts": _now()})
                continue
            if action == "subscribe":
                client.symbol = _clean_symbol(data.get("symbol"), client.symbol)
                client.timeframe = _clean_timeframe(data.get("timeframe"), client.timeframe)
                await websocket.send_json({
                    "type": "subscribed",
                    "symbol": client.symbol,
                    "timeframe": client.timeframe,
                })
                asyncio.create_task(hub.push_symbol(websocket, client.symbol, client.timeframe))
    except WebSocketDisconnect:
        hub.disconnect(websocket)
    except Exception:
        hub.disconnect(websocket)


@router.websocket("/ws/telemetry")
async def websocket_telemetry(websocket: WebSocket):
    await _serve(websocket)


@router.websocket("/api/v1/ws/telemetry")
async def websocket_telemetry_via_api(websocket: WebSocket):
    await _serve(websocket)
