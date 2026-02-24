# 🚀 GUÍA COMPLETA: Configurar Ferretería en cPanel de HostGator

## 📋 **PASO 1: Preparación Previa**

### ✅ **Archivos ya preparados:**
- ✅ `.env.production` - Variables de entorno para producción
- ✅ `app.js` - Punto de entrada principal
- ✅ `.htaccess` - Configuración del servidor

### 🔧 **Lo que necesitas actualizar:**

1. **En `.env.production`**, cambia estos valores:
   ```
   DB_USER=tu_usuario_cpanel_ferreteria
   DB_PASSWORD=tu_password_bd
   DB_NAME=tu_usuario_cpanel_ferreteria
   BASE_URL=https://tudominio.com
   ```

---

## 📋 **PASO 2: Configuración en cPanel**

### 🗄️ **2.1 Crear Base de Datos MySQL**

1. **Accede a cPanel** → **Bases de datos MySQL**
2. **Crear nueva base de datos:**
   - Nombre: `ferreteria` (se creará como `tuusuario_ferreteria`)
3. **Crear usuario de base de datos:**
   - Usuario: `ferreteria`
   - Contraseña: (genera una segura)
4. **Asignar usuario a la base de datos** con todos los privilegios

### 🔧 **2.2 Configurar Node.js**

1. **Accede a cPanel** → **Node.js App**
2. **Crear nueva aplicación:**
   - **Versión Node.js:** 18.x o superior
   - **Modo de aplicación:** Producción
   - **Directorio de aplicación:** `public_html` (o subdirectorio si prefieres)
   - **Archivo de inicio:** `app.js`
   - **URL de aplicación:** tu dominio principal

---

## 📋 **PASO 3: Subir Archivos**

### 📁 **3.1 Estructura de archivos a subir:**

```
public_html/
├── app.js                    ← Punto de entrada
├── .env.production          ← Variables de entorno
├── .htaccess               ← Configuración servidor
├── package.json            ← Dependencias
├── src/                    ← Todo el código fuente
├── uploads/                ← Carpeta de imágenes
├── files/                  ← Archivos PDF/XML
├── scripts/                ← Scripts de inicialización
└── whatsapp_sessions/      ← Sesiones WhatsApp
```

### 📤 **3.2 Métodos de subida:**

**Opción A: File Manager de cPanel**
1. Comprime todo el contenido de `/backend/` en un ZIP
2. Sube el ZIP a `public_html/`
3. Extrae el archivo ZIP
4. Elimina el ZIP

**Opción B: FTP/SFTP**
1. Usa FileZilla o similar
2. Sube todos los archivos del backend a `public_html/`

---

## 📋 **PASO 4: Configuración Final**

### 🔧 **4.1 Instalar Dependencias**

1. **En cPanel** → **Node.js App** → **Tu aplicación**
2. **Terminal** → Ejecutar:
   ```bash
   npm install --production
   ```

### 🗄️ **4.2 Importar Base de Datos**

1. **Exporta tu BD local** a un archivo SQL
2. **En cPanel** → **phpMyAdmin**
3. **Selecciona tu base de datos** → **Importar**
4. **Sube el archivo SQL**

### ⚙️ **4.3 Actualizar Variables de Entorno**

1. **Edita `.env.production`** con los datos reales:
   ```env
   DB_HOST=localhost
   DB_USER=tuusuario_ferreteria
   DB_PASSWORD=tu_password_real
   DB_NAME=tuusuario_ferreteria
   BASE_URL=https://tudominio.com
   ```

### 🚀 **4.4 Iniciar Aplicación**

1. **En cPanel** → **Node.js App**
2. **Reiniciar aplicación**
3. **Verificar que esté corriendo**

---

## 📋 **PASO 5: Configurar Frontend**

### 🔧 **5.1 Actualizar URLs del Frontend**

En tu frontend, cambia todas las URLs de API:
```javascript
// Antes (desarrollo)
const API_URL = 'http://localhost:4000';

// Después (producción)
const API_URL = 'https://tudominio.com';
```

### 📤 **5.2 Subir Frontend**

**Si es React/Vue/Angular:**
1. **Construir para producción:**
   ```bash
   npm run build
   ```
2. **Subir carpeta `dist/` o `build/`** a `public_html/frontend/`

**Si es HTML/CSS/JS:**
1. **Subir directamente** a `public_html/frontend/`

---

## 📋 **PASO 6: Configuración de Dominios**

### 🌐 **6.1 Estructura de URLs:**

```
https://tudominio.com/          ← Frontend
https://tudominio.com/api/      ← Backend API
```

### 🔧 **6.2 Configurar Subdominios (Opcional):**

```
https://app.tudominio.com/      ← Frontend
https://api.tudominio.com/      ← Backend API
```

---

## 📋 **PASO 7: Pruebas y Verificación**

### ✅ **7.1 Verificar Backend:**
- Accede a: `https://tudominio.com/api/health`
- Debe responder con estado OK

### ✅ **7.2 Verificar Base de Datos:**
- Prueba login en el frontend
- Verifica que se guarden datos

### ✅ **7.3 Verificar Subida de Imágenes:**
- Sube una imagen de producto
- Verifica que se guarde en `/uploads/`

---

## 🔧 **CONFIGURACIONES ADICIONALES**

### 📧 **Email (Opcional):**
```env
EMAIL_HOST=mail.tudominio.com
EMAIL_PORT=587
EMAIL_USER=noreply@tudominio.com
EMAIL_PASS=tu_password_email
```

### 🔒 **SSL (Recomendado):**
1. **En cPanel** → **SSL/TLS**
2. **Activar Let's Encrypt** (gratuito)

### 📊 **Monitoreo:**
1. **En cPanel** → **Métricas** → **Uso de recursos**
2. **Configurar alertas** de uso

---

## 🚨 **SOLUCIÓN DE PROBLEMAS COMUNES**

### ❌ **Error: Cannot find module**
```bash
# En terminal de cPanel
npm install
```

### ❌ **Error de conexión a BD**
- Verifica credenciales en `.env.production`
- Asegúrate que el usuario tenga permisos

### ❌ **Error 500 Internal Server**
- Revisa logs en cPanel → **Logs de errores**
- Verifica permisos de archivos (755 para carpetas, 644 para archivos)

### ❌ **Imágenes no se suben**
- Verifica permisos de carpeta `uploads/` (755)
- Asegúrate que la carpeta exista

---

## 📞 **SOPORTE**

Si tienes problemas:
1. **Revisa logs** en cPanel → **Logs de errores**
2. **Contacta soporte** de HostGator
3. **Verifica documentación** de Node.js en cPanel

---

## ✅ **CHECKLIST FINAL**

- [ ] Base de datos creada y configurada
- [ ] Node.js App configurada
- [ ] Archivos subidos correctamente
- [ ] Dependencias instaladas
- [ ] Variables de entorno actualizadas
- [ ] Frontend configurado y subido
- [ ] SSL activado
- [ ] Pruebas realizadas
- [ ] Backup configurado

¡Tu aplicación de ferretería estará completamente funcional en cPanel! 🎉