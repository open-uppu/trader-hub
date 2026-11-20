import os
from pathlib import Path

# Paths
BACKEND_DIR = Path(__file__).resolve().parent
HUB_DIR = BACKEND_DIR.parent
TRADER_DIR = HUB_DIR.parent

# Check Docker mount path first, then local paths
if Path("/app/daytrad").exists():
    DAYTRAD_DIR = Path("/app/daytrad")
elif (TRADER_DIR / "daytrad").exists():
    DAYTRAD_DIR = TRADER_DIR / "daytrad"
elif (TRADER_DIR / "daytrading").exists():
    DAYTRAD_DIR = TRADER_DIR / "daytrading"
else:
    DAYTRAD_DIR = Path("D:/daytrading")

if Path("/app/edca").exists():
    EDCA_DIR = Path("/app/edca")
elif (TRADER_DIR / "edca").exists():
    EDCA_DIR = TRADER_DIR / "edca"
else:
    EDCA_DIR = Path("D:/edca")

# Server configuration
HOST = os.getenv("HUB_HOST", "0.0.0.0")
PORT = int(os.getenv("HUB_PORT", 8000))
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Compatibility with edca modules importing Settings from config
from dataclasses import dataclass

@dataclass
class Settings:
    base_weekly_budget: float = float(os.getenv("BASE_WEEKLY_BUDGET", "1000.0"))
    min_multiplier: float = 0.5
    max_multiplier: float = 2.0
    llm_gateway_url: str = os.getenv("LLM_GATEWAY_URL", "http://100.105.249.12:4000/v1")
    llm_api_key: str = os.getenv("LLM_API_KEY", "")
    llm_model: str = os.getenv("LLM_MODEL", "auto")
