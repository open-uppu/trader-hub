from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import sys

# Ensure backend root is in path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from config import CORS_ORIGINS
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


if __name__ == "__main__":
    import uvicorn
    from config import HOST, PORT
    uvicorn.run("main:app", host=HOST, port=PORT, reload=True)
