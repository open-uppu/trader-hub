# Trader Central Hub - Operational Directives & Architecture

> Workspace-wide rules (skill/plugin/MCP use, repo map, commands, safety) live in [../AGENTS.md](../AGENTS.md). Read that file first if it is not already in your context.

## 1. Network & Tailscale Architecture
- **Multi-Device Setup**:
  - Mac (`100.93.63.86` / `localhost`): Main development workstation.
  - Laptop (`100.105.249.12`): Windows deployment host running Docker & LiteLLM Gateway (`:4000`).
- **Port Allocation**:
  - `3000`: Hub Frontend (Next.js 14 App Router)
  - `8000`: Hub Backend API (FastAPI) [Published as `8005` in Docker]
  - `8080` / `8000`: Daytrad MT5/MT4 Bridge Server & Pilotfish Terminal
  - `4000`: LiteLLM AI Gateway (`http://100.105.249.12:4000/v1`)
- **Dynamic API Resolution**:
  - `frontend/src/lib/api.ts` resolves `API_BASE` dynamically using `window.location.hostname`.
  - When accessed via Tailscale IP (`100.x.x.x`), it targets the corresponding backend port automatically without hardcoding `127.0.0.1`.
- **Realtime stream**: the portal uses `ws://<page-host>/ws/telemetry` (proxied by `frontend/server.js` to the hub backend). The backend pushes a daytrad tick about once a second and a full snapshot about every 15 seconds. HTTP `/api/v1/*` remains the bootstrap and image path.

## 2. Core Domain Contracts
- **Daytrad (9 Multi-Asset Specialists)**:
  - Gold (`XAUUSD`), Bitcoin (`BTCUSD`), Ethereum (`ETHUSD`), Silver (`XAGUSD`), GBP/USD (`GBPUSD`), EUR/USD (`EURUSD`), Platinum (`XPTUSD`), Brent Crude Oil (`UKOIL`), Natural Gas (`XNGUSD`).
  - Execution States: `IN_POSITION` (active orders with floating PnL), `WAITING` (scanning/monitoring under Cadence Pacer), `STANDBY` (bridge offline).
- **EDCA (Dime! Minimum Order & Market Radar)**:
  - Minimum Order Rule: 50.00 THB per order enforced by `filter_and_allocate()`.
  - Budget < 50 THB rolls into Cash Buffer.
  - Budget 50-99 THB consolidates into 1 order for top candidate.
  - Budget >= 100 THB splits across 2 candidates with >= 50 THB per order.
  - Budget >= 150 THB with both radar A+/A names and an existing discounted holding splits across 3 lots (up to 2 NEW ENTRY + 1 ACCUMULATE) so names like NVDA/META/DELTA are not dropped.
  - High-grade new stocks (A+/A) from `market_scanner` are allocated as `NEW ENTRY (BUY)`.
  - Thai SET names (DELTA, BDMS, SCB, …) are **whole shares only** (minimum 1 share, no fractions). Cash that cannot buy 1 share is rolled to US lots (Dime! allows fractional US) or Cash Buffer.

## 3. Performance & Caching Safeguards
- `edca_connector`: In-memory TTL cache for Market Scanner (5 min) and AI Advisory (10 min) to prevent slow synchronous Yahoo Finance or LLM network blocking.
- **Weekly advisory archive**: each generated AI Weekly Investment Advisory is persisted under `edca/data/advisories/{YYYY-Www}.json` (+ `.md`). Past weeks are immutable. Hub `get_details()` exposes `previous_week` from that archive (read-only Docker mount is fine for reads; writes fall back to `hub/backend/data/edca_advisories/`). Reconstruct a missing past week with `python cli.py archive backfill`.
