@echo off
chcp 65001 >nul
echo =======================================================================
echo   🚀 TRADER CENTRAL HUB - 1-CLICK DOCKER REDEPLOY (LAPTOP WINDOWS)
echo =======================================================================
echo.
echo [1/4] Stopping previous containers...
docker compose -f docker-compose.laptop.yml down

echo.
echo [2/4] Pulling latest updates from Git...
git pull origin main

echo.
echo [3/4] Building new images (Apple Minimalist Design & 9 Specialists)...
docker compose -f docker-compose.laptop.yml build --no-cache

echo.
echo [4/4] Starting updated containers...
docker compose -f docker-compose.laptop.yml up -d

echo.
echo =======================================================================
echo   ✅ REDEPLOY SUCCESSFUL!
echo   Open in browser: http://localhost:3000 (or http://100.105.249.12:3000)
echo =======================================================================
pause
