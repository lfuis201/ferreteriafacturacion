const fs = require('fs');
const path = require('path');

/**
 * Script para crear la estructura de carpetas necesaria para cPanel
 * Este script debe ejecutarse después del deploy en cPanel
 */

const createFolderStructure = () => {
  const folders = [
    path.join(__dirname, '../uploads'),
    path.join(__dirname, '../files'),
    path.join(__dirname, '../uploads/productos'),
    path.join(__dirname, '../uploads/temp')
  ];

  folders.forEach(folder => {
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
      console.log(`✅ Carpeta creada: ${folder}`);
    } else {
      console.log(`📁 Carpeta ya existe: ${folder}`);
    }
  });

  // Crear archivo .htaccess para la carpeta uploads (opcional para cPanel)
  const htaccessContent = `# Permitir acceso a imágenes
<FilesMatch "\\.(jpg|jpeg|png|gif|webp)$">
    Order allow,deny
    Allow from all
</FilesMatch>

# Denegar acceso a otros tipos de archivo
<FilesMatch "\\.(php|js|html|htm)$">
    Order deny,allow
    Deny from all
</FilesMatch>`;

  const htaccessPath = path.join(__dirname, '../uploads/.htaccess');
  if (!fs.existsSync(htaccessPath)) {
    fs.writeFileSync(htaccessPath, htaccessContent);
    console.log('✅ Archivo .htaccess creado en uploads/');
  }

  console.log('🎉 Estructura de carpetas inicializada correctamente');
};

// Ejecutar si se llama directamente
if (require.main === module) {
  createFolderStructure();
}

module.exports = createFolderStructure;