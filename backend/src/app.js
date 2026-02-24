const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const path = require('path');
const fs = require('fs');
const app = express();
const rutas = require("./routes");
require("dotenv").config();

// Swagger
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger/swagger");
const sequelize = require('./config/database');

// Configuración del middleware
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: {
    status: 429,
    error: "Demasiadas solicitudes. Inténtalo de nuevo más tarde dentro de un minuto.",
  },
});

// CORS: permitir frontend. CORS_ORIGIN = URL(s) separadas por coma. Si no está definido, acepta cualquier origen.
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean)
  : [];
const corsOptions = {
  origin:
    corsOrigins.length > 0
      ? (origin, callback) => {
          if (!origin) return callback(null, true);
          const allowed = corsOrigins.some((allowedUrl) => origin === allowedUrl);
          callback(null, allowed);
        }
      : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
// Aumentar límites del cuerpo para permitir cargas más grandes (ej. imágenes Base64)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ¡IMPORTANTE! Corregir la ruta de uploads y files
// Como tu app.js está en src/, necesitas subir un nivel para llegar a uploads y files
const uploadsPath = path.join(__dirname, '..', 'uploads'); // Subir un nivel desde src/
const filesPath = path.join(__dirname, '..', 'files'); // Subir un nivel desde src/

// Verificar y crear carpetas necesarias
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

if (!fs.existsSync(filesPath)) {
  fs.mkdirSync(filesPath, { recursive: true });
}

// Middleware básico

app.use(limiter);

// Middleware específico para PDFs con headers correctos
app.use('/files', (req, res, next) => {
  if (req.path.endsWith('.pdf')) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="' + path.basename(req.path) + '"');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Accept-Ranges', 'bytes');
  }
  next();
});

// Configurar archivos estáticos
app.use('/uploads', express.static(uploadsPath));
app.use('/files', express.static(filesPath));

// Rutas de la API
app.use("/api", rutas);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Inicialización de base de datos
async function inicializarBaseDatos() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida.');
    require('./models');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await sequelize.sync({ force: false });
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log("📦 Tablas sincronizadas exitosamente.");
    
    const { inicializarConfiguracionesPorDefecto } = require('./controllers/configuracion.controller');
    await inicializarConfiguracionesPorDefecto();
    console.log('✅ Configuraciones inicializadas correctamente.');
  } catch (error) {
    console.error("❌ Error al sincronizar:", error);
    try {
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    } catch (e) {
      console.error("❌ Error reactivando restricciones:", e.message);
    }
    process.exit(1);
  }
}

// Inicializar base de datos
inicializarBaseDatos();

// Servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor iniciado en http://localhost:${PORT}`);
});