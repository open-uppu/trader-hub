#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "=========================================================="
echo "          🚀 LAUNCHING TRADER CENTRAL HUB                "
echo "=========================================================="
echo " • Backend:  FastAPI on http://127.0.0.1:8000"
echo " • Frontend: Next.js on http://127.0.0.1:3000"
echo " • API Docs: http://127.0.0.1:8000/docs"
echo "=========================================================="

# Trap to kill both processes on exit
cleanup() {
    echo ""
    echo "Shutting down Trader Hub..."
    kill $(jobs -p) 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# 1. Start Backend in background
echo "[1/2] Starting Backend Gateway..."
cd "$DIR/backend"
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait for backend to be ready
sleep 1.5

# 2. Start Frontend
echo "[2/2] Starting Frontend Portal..."
cd "$DIR/frontend"
if command -v bun &> /dev/null; then
    bun run start
else
    npm run start
fi
