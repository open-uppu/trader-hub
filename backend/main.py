from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import sys

# Ensure backend root is in path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from fastapi.responses import FileResponse
from config import CORS_ORIGINS, DAYTRAD_DIR
from connectors.registry import ConnectorRegistry
from connectors.edca_connector import EdcaConnector
from connectors.daytrad_connector import DaytradConnector
from routers.projects import router as projects_router, init_router
from routers.telemetry import router as telemetry_router

# Initialize Registry and Register Connectors
registry = ConnectorRegistry()
registry.register(EdcaConnector())
registry.register(DaytradConnector())

# Pass registry to router
init_router(registry)

app = FastAPI(
    title="Trader Central Hub API",
    description="Unified API Gateway for Daytrad, EDCA, and Future FinTech Projects",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for development flexibility
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projects_router)
app.include_router(telemetry_router)


@app.get("/")
def root():
    return {
        "service": "Trader Central Hub API Gateway",
        "status": "online",
        "docs_url": "/docs",
        "registered_projects": [p["id"] for p in registry.list_all()]
    }


@app.get("/api/v1/download/ea")
def download_ea():
    ea_path = DAYTRAD_DIR / "mt5" / "AgenticMT5Bridge.mq5"
    if ea_path.exists():
        return FileResponse(
            str(ea_path),
            filename="AgenticMT5Bridge.mq5",
            media_type="application/octet-stream"
        )
    return {"error": "EA file not found"}


@app.get("/api/v1/download/mt5-sync-zip")
def download_mt5_sync_zip():
    zip_path = Path(__file__).resolve().parent.parent / "frontend" / "public" / "downloads" / "mt5_native_sync.zip"
    if zip_path.exists():
        return FileResponse(
            str(zip_path),
            filename="mt5_native_sync.zip",
            media_type="application/zip"
        )
    return {"error": "Zip file not found"}


@app.get("/api/v1/download/hub-zip")
def download_hub_zip():
    zip_path = Path(__file__).resolve().parent.parent / "frontend" / "public" / "downloads" / "hub_update.zip"
    if zip_path.exists():
        return FileResponse(
            str(zip_path),
            filename="hub_update.zip",
            media_type="application/zip"
        )
    return {"error": "Hub zip file not found"}


@app.get("/api/v1/download/mt5-sync-bat")
def download_mt5_sync_bat():
    bat_path = DAYTRAD_DIR / "scripts" / "start_mt5_sync.bat"
    if bat_path.exists():
        return FileResponse(
            str(bat_path),
            filename="start_mt5_sync.bat",
            media_type="application/octet-stream"
        )
    return {"error": "BAT file not found"}


@app.get("/api/v1/download/mt5-sync-py")
def download_mt5_sync_py():
    py_path = DAYTRAD_DIR / "scripts" / "mt5_native_sync.py"
    if py_path.exists():
        return FileResponse(
            str(py_path),
            filename="mt5_native_sync.py",
            media_type="text/plain"
        )
    return {"error": "Python file not found"}


if __name__ == "__main__":
    import uvicorn
    from config import HOST, PORT
    uvicorn.run("main:app", host=HOST, port=PORT, reload=True)
