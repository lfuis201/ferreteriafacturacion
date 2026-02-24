# Despliegue del backend en Render

## Variables de entorno en Render

En el panel de Render → tu servicio **Web Service** → **Environment** agrega estas variables.

### Obligatorias

| Variable        | Ejemplo / descripción |
|----------------|------------------------|
| `PORT`         | Render asigna uno automáticamente; si tu app lo usa, déjalo o usa `PORT` que Render inyecta. |
| `NODE_ENV`     | `production` |
| `BASE_URL`     | URL pública del backend en Render, ej: `https://ferreteriafcturacion.onrender.com` |
| `JWT_SECRET`   | El mismo valor largo y seguro que en local (o uno nuevo solo para producción). |
| `SECRET_KEY`   | Igual que en local, para cifrado. |
| `DB_HOST`      | Host de MySQL (Railway, cPanel, etc.). |
| `DB_USER`      | Usuario de la base de datos. |
| `DB_PASSWORD`  | Contraseña de la base de datos. |
| `DB_NAME`      | Nombre de la base de datos. |
| `DB_PORT`      | Puerto (ej: `3306` o el que use tu proveedor). |

### CORS (conectar tu frontend)

| Variable        | Ejemplo | Descripción |
|----------------|---------|-------------|
| `CORS_ORIGIN`  | `https://tu-frontend.onrender.com` | URL exacta de tu frontend. Varias URLs separadas por coma: `https://app1.com,https://app2.com` |

Sin `CORS_ORIGIN` el backend acepta **cualquier** origen. En producción es recomendable definirlo.

### Opcionales (SUNAT, WhatsApp, etc.)

- `SUNAT_USER`, `SUNAT_PASSWORD`, `SUNAT_MODE`, `SUNAT_MODO_SIMULACION`
- `EMPRESA_RUC`, `EMPRESA_RAZON_SOCIAL`, etc.
- `LUCODE_TOKEN`
- `WHATSAPP_*`

---

## Qué cambiar respecto a tu .env local

- **BASE_URL**: poner la URL del backend en Render, ej: `https://ferreteriafcturacion.onrender.com`.
- **DB_***: si en producción usas otra base (ej. cPanel), usa esos datos; si sigues con Railway, los mismos.
- **NODE_ENV**: `production`.
- **CORS_ORIGIN**: URL(s) de tu frontend para que el navegador permita llamadas al backend.

---

## En el frontend

Configura la URL base de la API con la URL del backend en Render, por ejemplo:

- `https://ferreteriafcturacion.onrender.com`  
o la variable de entorno que use tu frontend (ej. `VITE_API_URL`, `REACT_APP_API_URL`).

---

## Resumen rápido

1. En Render → Environment: agregar todas las variables (sobre todo `BASE_URL`, `DB_*`, `JWT_SECRET`, `CORS_ORIGIN`).
2. `CORS_ORIGIN` = URL exacta del frontend (una o varias separadas por coma).
3. En el frontend, apuntar la API a la URL del backend en Render.
