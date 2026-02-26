@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion
echo.
echo ============================================
echo   INSTALADOR - Sistema Ferretería Facturación
echo ============================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
  echo [ERROR] No se encontró Node.js. Instálalo desde https://nodejs.org
  pause
  exit /b 1
)

echo [1/5] Node.js encontrado: 
node -v
npm -v
echo.

echo [2/5] Instalando dependencias del BACKEND...
cd /d "%~dp0backend"
call npm install
if %errorlevel% neq 0 (
  echo [ERROR] Falló npm install en backend
  pause
  exit /b 1
)

if not exist ".env" (
  echo     Creando .env desde .env.example...
  copy .env.example .env >nul
  echo     IMPORTANTE: Edita backend\.env con tu base de datos MySQL.
) else (
  echo     .env ya existe, no se sobrescribe.
)

call npm run init-folders 2>nul
echo.

echo [3/5] Instalando dependencias del FRONTEND...
cd /d "%~dp0frontend"
call npm install
if %errorlevel% neq 0 (
  echo [ERROR] Falló npm install en frontend
  pause
  exit /b 1
)

if not exist ".env" (
  echo     Creando .env desde .env.example...
  copy .env.example .env >nul
) else (
  echo     .env ya existe, no se sobrescribe.
)

echo.
echo [4/5] Instalación completada.
echo.
echo ============================================
echo   PRÓXIMOS PASOS
echo ============================================
echo.
echo 1. Configura backend\.env con tu MySQL (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT).
echo 2. Crea la base de datos en MySQL (solo el nombre; las tablas se crean al iniciar el backend).
echo 3. Crear usuario de prueba (opcional):
echo       cd backend
echo       node src/scripts/inicializar-datos-basicos.js
echo    Credenciales: admin@ferreteria.com / admin123
echo.
echo 4. Iniciar BACKEND (en una terminal):
echo       cd backend
echo       npm run dev
echo.
echo 5. Iniciar FRONTEND (en otra terminal):
echo       cd frontend
echo       npm run dev
echo.
echo 6. Abrir en el navegador: http://localhost:5173
echo.
pause
