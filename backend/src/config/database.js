const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
    timezone: '-05:00', // Zona horaria de Perú (UTC-5)
    pool: {
      max: 10,          // Máximo número de conexiones en el pool
      min: 0,           // Mínimo número de conexiones en el pool
      acquire: 60000,   // Tiempo máximo para obtener una conexión (60 segundos)
      idle: 10000,      // Tiempo máximo que una conexión puede estar inactiva (10 segundos)
      evict: 1000       // Intervalo para verificar conexiones inactivas (1 segundo)
    },
    dialectOptions: {
      dateStrings: true,
      typeCast: true,
      // Eliminar acquireTimeout y timeout
      connectTimeout: 60000   // Timeout para conectar
    },
    retry: {
      match: [
        /ETIMEDOUT/,
        /EHOSTUNREACH/,
        /ECONNRESET/,
        /ECONNREFUSED/,
        /TIMEOUT/,
        /ESOCKETTIMEDOUT/,
        /EHOSTUNREACH/,
        /EPIPE/,
        /EAI_AGAIN/,
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/
      ],
      max: 3
    }
  }
);

module.exports = sequelize;
