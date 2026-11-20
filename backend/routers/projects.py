import re
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path
from typing import List, Dict, Any

from connectors.registry import ConnectorRegistry

router = APIRouter(prefix="/api/v1/projects", tags=["projects"])
_registry: ConnectorRegistry = None


def init_router(registry: ConnectorRegistry):
    global _registry
    _registry = registry


@router.get("", response_model=List[Dict[str, Any]])
def list_projects():
    if not _registry:
        return []
    return _registry.list_all()


@router.get("/{project_id}/summary")
def get_project_summary(project_id: str):
    if not _registry:
        raise HTTPException(status_code=500, detail="Registry not initialized")
    connector = _registry.get(project_id)
    if not connector:
        raise HTTPException(status_code=404, detail=f"Project '{project_id}' not found")
    return connector.get_summary()


@router.get("/{project_id}/details")
def get_project_details(project_id: str):
    if not _registry:
        raise HTTPException(status_code=500, detail="Registry not initialized")
    connector = _registry.get(project_id)
    if not connector:
        raise HTTPException(status_code=404, detail=f"Project '{project_id}' not found")
    return connector.get_details()


@router.get("/daytrad/bars")
def get_daytrad_bars(symbol: str = "XAUUSD", timeframe: str = "M5"):
    if not _registry:
        raise HTTPException(status_code=500, detail="Registry not initialized")
    connector = _registry.get("daytrad")
    if not connector:
        raise HTTPException(status_code=404, detail="Daytrad project not registered")
    symbol, timeframe = symbol.upper(), timeframe.upper()
    if not re.fullmatch(r"[A-Z0-9]{3,12}", symbol) or not re.fullmatch(r"M\d{1,3}|H\d{1,2}", timeframe):
        raise HTTPException(status_code=400, detail="Invalid symbol or timeframe")
    return {"symbol": symbol, "timeframe": timeframe, "bars": connector.get_bars(symbol, timeframe)}


@router.get("/daytrad/charts")
def get_daytrad_charts():
    if not _registry:
        raise HTTPException(status_code=500, detail="Registry not initialized")
    connector = _registry.get("daytrad")
    if not connector:
        raise HTTPException(status_code=404, detail="Daytrad project not registered")
    details = connector.get_details()
    return details.get("charts", [])


@router.get("/daytrad/charts/{filename}")
def serve_daytrad_chart(filename: str):
    if not _registry:
        raise HTTPException(status_code=500, detail="Registry not initialized")
    connector = _registry.get("daytrad")
    if not connector:
        raise HTTPException(status_code=404, detail="Daytrad project not registered")
    
    details = connector.get_details()
    charts = details.get("charts", [])
    target = next((c for c in charts if c["filename"] == filename), None)
    
    if not target or not Path(target["path"]).exists():
        raise HTTPException(status_code=404, detail=f"Chart '{filename}' not found")
    
    return FileResponse(target["path"], media_type="image/png")
