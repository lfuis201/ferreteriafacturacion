# Configuración para cPanel - Subida de Archivos

## 📋 Resumen de Cambios Realizados

Hemos configurado tu aplicación para usar **almacenamiento local** en lugar de Cloudinary, lo que es perfecto para cPanel.

### ✅ Cambios Implementados:

1. **uploadConfig.js** - Configurado para almacenamiento local únicamente
2. **producto.controller.js** - URLs de imágenes adaptadas para cPanel
3. **package.json** - Scripts de inicialización agregados
4. **init-folders.js** - Script para crear estructura de carpetas

## 🚀 Configuración en cPanel

### Paso 1: Subir Archivos
1. Sube tu proyecto backend a la carpeta `public_html` de tu cPanel
2. La estructura debe quedar así:
```
public_html/
├── src/
├── uploads/          (se creará automáticamente)
├── files/           (se creará automáticamente)
├── package.json
├── scripts/
└── node_modules/
```

### Paso 2: Variables de Entorno
Crea un archivo `.env` en la raíz de tu proyecto con:

```env
# Base de datos
DATABASE_URL=postgresql://usuario:password@host:puerto/database

# JWT
JWT_SECRET=tu_jwt_secret_muy_seguro

# URL de tu dominio en cPanel
BASE_URL=https://tudominio.com

# Entorno
NODE_ENV=production

# Puerto (opcional, cPanel lo asigna automáticamente)
PORT=3000
```

### Paso 3: Instalar Dependencias
En el terminal de cPanel o File Manager:
```bash
npm install
```

### Paso 4: Inicializar Carpetas
```bash
npm run init-folders
```

### Paso 5: Iniciar la Aplicación
```bash
npm start
```

## 🧪 Cómo Probar la Creación de Productos

### Opción 1: Usando Postman/Thunder Client

**Endpoint:** `POST https://tudominio.com/api/productos`

**Headers:**
```
Authorization: Bearer tu_token_jwt
Content-Type: multipart/form-data
```

**Body (form-data):**
```
nombre: "Producto de Prueba"
codigo: "PROD001"
descripcion: "Descripción del producto"
precioCompra: 10.50
precioVenta: 15.00
categoriaId: 1
imagen1: [archivo de imagen]
imagen2: [archivo de imagen] (opcional)
imagen3: [archivo de imagen] (opcional)
```

### Opción 2: Usando tu Frontend

1. Asegúrate de que tu frontend esté configurado para apuntar a tu dominio de cPanel
2. Inicia sesión en tu aplicación
3. Ve a la sección de productos
4. Crea un nuevo producto con imágenes

### ✅ Resultado Esperado

Si todo está configurado correctamente:

1. **El producto se crea exitosamente** en la base de datos
2. **Las imágenes se suben** a la carpeta `uploads/` en tu servidor
3. **Las URLs de las imágenes** serán como: `https://tudominio.com/uploads/imagen1-1234567890-123456789.jpg`
4. **Las imágenes son accesibles** desde el navegador

### 🔍 Verificación

**Verifica que las carpetas existen:**
```
public_html/uploads/     ✅ Debe existir
public_html/files/       ✅ Debe existir
```

**Verifica que las imágenes se suben:**
- Después de crear un producto, revisa la carpeta `uploads/`
- Deberías ver archivos como: `imagen1-1640995200000-123456789.jpg`

**Verifica que las URLs funcionan:**
- Copia la URL de una imagen desde la respuesta del API
- Pégala en el navegador
- La imagen debe mostrarse correctamente

## 🚨 Solución de Problemas

### Error: "Cannot create directory"
- **Causa:** Permisos insuficientes
- **Solución:** Asegúrate de que la carpeta `public_html` tenga permisos de escritura (755 o 775)

### Error: "File not found" al acceder a imágenes
- **Causa:** Middleware de archivos estáticos no configurado
- **Solución:** Verifica que `app.js` tenga: `app.use('/uploads', express.static(uploadsPath))`

### Error: "BASE_URL undefined"
- **Causa:** Variable de entorno no configurada
- **Solución:** Agrega `BASE_URL=https://tudominio.com` a tu archivo `.env`

### Las imágenes no se muestran en el frontend
- **Causa:** CORS o URLs incorrectas
- **Solución:** Verifica que las URLs generadas sean accesibles públicamente

## 📝 Notas Importantes

1. **Permisos:** La carpeta `uploads/` debe tener permisos de escritura
2. **Tamaño:** Las imágenes están limitadas a 5MB por defecto
3. **Formatos:** Solo se permiten JPG, PNG y GIF
4. **Seguridad:** El archivo `.htaccess` en `uploads/` previene la ejecución de scripts

## 🔄 Mantenimiento

- **Backup:** Respalda regularmente la carpeta `uploads/`
- **Limpieza:** Considera implementar limpieza automática de imágenes huérfanas
- **Monitoreo:** Revisa el espacio en disco periódicamente