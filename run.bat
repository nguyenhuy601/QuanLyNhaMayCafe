@echo off

cd /d "%~dp0server\api-gateway"
start "" cmd /k "node index.js"

cd /d "%~dp0server\admin-service"
start "" cmd /k "node index.js"
timeout /t 1 >nul

cd /d "%~dp0server\auth-service"
start "" cmd /k "node index.js"
timeout /t 1 >nul

cd /d "%~dp0server\director-service"
start "" cmd /k "node index.js"
timeout /t 1 >nul

cd /d "%~dp0server\factory-service"
start "" cmd /k "node index.js"
timeout /t 1 >nul

cd /d "%~dp0server\production-plan-service"
start "" cmd /k "node index.js"
timeout /t 1 >nul

cd /d "%~dp0server\qc-service"
start "" cmd /k "node index.js"
timeout /t 1 >nul

cd /d "%~dp0server\report-service"
start "" cmd /k "node index.js"
timeout /t 1 >nul

cd /d "%~dp0server\sales-service"
start "" cmd /k "node index.js"
timeout /t 1 >nul

cd /d "%~dp0server\warehouse-service"
start "" cmd /k "node index.js"
timeout /t 1 >nul

cd /d "%~dp0client"
start "" cmd /k "npx vite --port 5173"
