#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

echo ""
echo "============================================"
echo "  INSTALADOR - Sistema Ferretería Facturación"
echo "============================================"
echo ""

if ! command -v node &> /dev/null; then
  echo "[ERROR] No se encontró Node.js. Instálalo desde https://nodejs.org"
  exit 1
fi

echo "[1/5] Node.js encontrado:"
node -v
npm -v
echo ""

echo "[2/5] Instalando dependencias del BACKEND..."
cd backend
npm install

if [ ! -f .env ]; then
  echo "    Creando .env desde .env.example..."
  cp .env.example .env
  echo "    IMPORTANTE: Edita backend/.env con tu base de datos MySQL."
else
  echo "    .env ya existe, no se sobrescribe."
fi

npm run init-folders 2>/dev/null || true
cd ..
echo ""

echo "[3/5] Instalando dependencias del FRONTEND..."
cd frontend
npm install

if [ ! -f .env ]; then
  echo "    Creando .env desde .env.example..."
  cp .env.example .env
else
  echo "    .env ya existe, no se sobrescribe."
fi

cd ..
echo ""
echo "[4/5] Instalación completada."
echo ""
echo "============================================"
echo "  PRÓXIMOS PASOS"
echo "============================================"
echo ""
echo "1. Configura backend/.env con tu MySQL (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT)."
echo "2. Crea la base de datos en MySQL (solo el nombre; las tablas se crean al iniciar el backend)."
echo "3. Crear usuario de prueba (opcional):"
echo "      cd backend && node src/scripts/inicializar-datos-basicos.js"
echo "   Credenciales: admin@ferreteria.com / admin123"
echo ""
echo "4. Iniciar BACKEND (en una terminal):"
echo "      cd backend && npm run dev"
echo ""
echo "5. Iniciar FRONTEND (en otra terminal):"
echo "      cd frontend && npm run dev"
echo ""
echo "6. Abrir en el navegador: http://localhost:5173"
echo ""
