# Instalador - Sistema de Ferretería Facturación

Instalación rápida del proyecto (backend + frontend).

## Requisitos previos

- **Node.js** 18 o superior ([descargar](https://nodejs.org))
- **MySQL** (local o remoto) con una base de datos creada (vacía; las tablas se crean solas al iniciar el backend)

---

## Instalación automática

### Windows

1. Abre una terminal (CMD o PowerShell) en la carpeta del proyecto.
2. Ejecuta:
   ```bash
   install.bat
   ```
3. Cuando termine, edita `backend\.env` con los datos de tu MySQL y sigue los “Próximos pasos” que muestra el script.

### Linux / Mac

1. Abre una terminal en la carpeta del proyecto.
2. Da permiso de ejecución y ejecuta:
   ```bash
   chmod +x install.sh
   ./install.sh
   ```
3. Edita `backend/.env` con tu MySQL y sigue los pasos que indica el script.

---

## ¿Qué hace el instalador?

- Comprueba que Node.js esté instalado.
- Instala dependencias del **backend** (`backend/node_modules`).
- Crea `backend/.env` desde `backend/.env.example` si no existe.
- Crea carpetas necesarias del backend (uploads, files, etc.).
- Instala dependencias del **frontend** (`frontend/node_modules`).
- Crea `frontend/.env` desde `frontend/.env.example` si no existe.

---

## Después de instalar

1. **Configurar base de datos**  
   Edita `backend/.env` y pon:
   - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`

2. **Usuario de prueba (opcional)**  
   Para poder entrar al sistema:
   ```bash
   cd backend
   node src/scripts/inicializar-datos-basicos.js
   ```
   Credenciales: **admin@ferreteria.com** / **admin123**

3. **Arrancar el backend** (en una terminal):
   ```bash
   cd backend
   npm run dev
   ```

4. **Arrancar el frontend** (en otra terminal):
   ```bash
   cd frontend
   npm run dev
   ```

5. Abrir en el navegador: **http://localhost:5173**

---

## Instalación manual (sin script)

Si prefieres no usar el instalador:

```bash
# Backend
cd backend
npm install
copy .env.example .env   # Windows
# cp .env.example .env  # Linux/Mac
# Editar .env con MySQL
npm run init-folders

# Frontend (desde la raíz del proyecto)
cd frontend
npm install
copy .env.example .env   # Windows
# cp .env.example .env   # Linux/Mac
```

Luego configura los `.env`, crea el usuario de prueba si quieres y arranca backend y frontend como en la sección anterior.
