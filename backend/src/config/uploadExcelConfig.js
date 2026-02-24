const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración de almacenamiento en memoria para archivos Excel
// Usamos memoryStorage para que el archivo esté disponible en req.file.buffer
const storage = multer.memoryStorage();

// Filtro de archivos para Excel
const fileFilter = (req, file, cb) => {
  // Aceptar solo archivos Excel
  const allowedMimeTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'application/octet-stream' // Fallback para algunos navegadores
  ];
  
  const allowedExtensions = ['.xlsx', '.xls'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no soportado. Solo se permiten archivos Excel (.xlsx, .xls)'), false);
  }
};

// Configuración de Multer para archivos Excel
const uploadExcel = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 10 // Limitar el tamaño del archivo a 10MB
  },
  fileFilter: fileFilter
}).single('archivo'); // Campo 'archivo' para el archivo Excel

module.exports = uploadExcel;