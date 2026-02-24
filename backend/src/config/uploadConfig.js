const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    // Crear la carpeta si no existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir); // Carpeta donde se guardarán las imágenes
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtro de archivos
const fileFilter = (req, file, cb) => {
  // Aceptar solo ciertos tipos de archivos
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no soportado'), false);
  }
};

// Configuración de Multer para manejar múltiples archivos con nombres específicos
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5 // Limitar el tamaño del archivo a 5MB
  },
  fileFilter: fileFilter
}).fields([
  { name: 'imagen1', maxCount: 1 },
  { name: 'imagen2', maxCount: 1 },
  { name: 'imagen3', maxCount: 1 }
]);

module.exports = upload;


/*
///para subir a cloudinary
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

// 📌 Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 📌 Configurar almacenamiento en Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "ferreteria",
    allowed_formats: ["jpg", "png", "gif", "jpeg"],
    transformation: [{ width: 500, height: 500, crop: "limit" }]
  }
});

// 📌 Configurar Multer
const upload = multer({ storage: storage });

module.exports = upload;


*/