from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Set, Dict, Any
import logging

logger = logging.getLogger("telemetry_router")
router = APIRouter(tags=["telemetry"])


class TelemetryHub:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)

    async def broadcast(self, message: Dict[str, Any]):
        dead = set()
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception:
                dead.add(connection)
        for d in dead:
            self.active_connections.discard(d)


hub = TelemetryHub()


@router.websocket("/ws/telemetry")
async def websocket_telemetry(websocket: WebSocket):
    await hub.connect(websocket)
    try:
        # Send initial greeting snapshot
        await websocket.send_json({
            "type": "connection_established",
            "message": "Connected to Trader Hub Telemetry Stream"
        })
        while True:
            data = await websocket.receive_text()
            # Echo or handle incoming client ping
            if data == "ping":
                await websocket.send_json({"type": "pong"})
    except WebSocketDisconnect:
        hub.disconnect(websocket)
    except Exception:
        hub.disconnect(websocket)
