const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * @swagger
 * components:
 *   schemas:
 *     ConfiguracionWhatsapp:
 *       type: object
 *       required:
 *         - sucursalId
 *         - proveedor
 *       properties:
 *         id:
 *           type: integer
 *           description: ID autogenerado de la configuración
 *         sucursalId:
 *           type: integer
 *           description: ID de la sucursal
 *         proveedor:
 *           type: string
 *           enum: ['twilio', 'whatsapp_business', 'baileys', 'green_api']
 *           description: Proveedor de API de WhatsApp
 *         activo:
 *           type: boolean
 *           description: Indica si la configuración está activa
 *         apiKey:
 *           type: string
 *           description: Clave de API (encriptada)
 *         apiSecret:
 *           type: string
 *           description: Secreto de API (encriptado)
 *         numeroTelefono:
 *           type: string
 *           description: Número de teléfono de WhatsApp Business
 *         webhookUrl:
 *           type: string
 *           description: URL del webhook para recibir respuestas
 *         plantillaMensaje:
 *           type: text
 *           description: Plantilla del mensaje para envío de comprobantes
 *         envioAutomatico:
 *           type: boolean
 *           description: Envío automático de comprobantes
 *         tiposComprobante:
 *           type: string
 *           description: Tipos de comprobante a enviar (JSON array)
 */

const ConfiguracionWhatsapp = sequelize.define('ConfiguracionWhatsapp', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sucursalId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true, // Una configuración por sucursal
    references: {
      model: 'sucursales',
      key: 'id'
    }
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'id'
    },
    comment: 'Usuario que configuró WhatsApp'
  },
  proveedor: {
    type: DataTypes.ENUM('twilio', 'whatsapp_business', 'baileys', 'green_api'),
    allowNull: false,
    defaultValue: 'baileys',
    comment: 'Proveedor de API de WhatsApp'
  },
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Indica si la configuración está activa'
  },
  // Credenciales de API
  apiKey: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Clave de API del proveedor (encriptada)'
  },
  apiSecret: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Secreto de API del proveedor (encriptado)'
  },
  apiUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'URL base de la API del proveedor'
  },
  // Configuración de WhatsApp
  numeroTelefono: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Número de teléfono de WhatsApp Business'
  },
  nombreNegocio: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Nombre del negocio en WhatsApp Business'
  },
  webhookUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'URL del webhook para recibir respuestas'
  },
  // Configuración de mensajes
  plantillaMensaje: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: 'Hola {{cliente}}, adjunto encontrarás tu comprobante {{tipo}} {{numero}} por un total de S/ {{total}}. Gracias por tu compra en {{empresa}}.',
    comment: 'Plantilla del mensaje para envío de comprobantes'
  },
  mensajeSaludo: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '¡Hola! Gracias por tu compra.',
    comment: 'Mensaje de saludo personalizado'
  },
  mensajeDespedida: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: 'Gracias por elegirnos. ¡Que tengas un excelente día!',
    comment: 'Mensaje de despedida personalizado'
  },
  // Configuración de envío
  envioAutomatico: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Envío automático de comprobantes al generar venta'
  },
  tiposComprobante: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: ['factura', 'boleta'],
    comment: 'Tipos de comprobante a enviar automáticamente'
  },
  formatosEnvio: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: ['pdf'],
    comment: 'Formatos de archivo a enviar (pdf, xml, ambos)'
  },
  // Configuración de horarios
  horarioInicio: {
    type: DataTypes.TIME,
    allowNull: true,
    defaultValue: '08:00:00',
    comment: 'Hora de inicio para envío automático'
  },
  horarioFin: {
    type: DataTypes.TIME,
    allowNull: true,
    defaultValue: '20:00:00',
    comment: 'Hora de fin para envío automático'
  },
  diasHabiles: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [1, 2, 3, 4, 5, 6], // Lunes a Sábado
    comment: 'Días de la semana habilitados para envío (0=Domingo, 6=Sábado)'
  },
  // Estado y estadísticas
  ultimoEnvio: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha y hora del último envío exitoso'
  },
  totalEnviados: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Total de mensajes enviados'
  },
  totalFallidos: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Total de mensajes fallidos'
  },
  estadoConexion: {
    type: DataTypes.ENUM('conectado', 'desconectado', 'error', 'configurando'),
    allowNull: false,
    defaultValue: 'desconectado',
    comment: 'Estado actual de la conexión con WhatsApp'
  },
  // Configuración adicional
  limiteMensajesDia: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 1000,
    comment: 'Límite de mensajes por día'
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Observaciones o notas sobre la configuración'
  }
}, {
  timestamps: true,
  tableName: 'ConfiguracionesWhatsapp',
  freezeTableName: true,
  indexes: [
    {
      unique: true,
      fields: ['sucursalId']
    },
    {
      fields: ['proveedor']
    },
    {
      fields: ['activo']
    },
    {
      fields: ['estadoConexion']
    }
  ]
});

// Métodos del modelo
ConfiguracionWhatsapp.prototype.puedeEnviar = function() {
  if (!this.activo || this.estadoConexion !== 'conectado') {
    return false;
  }
  
  const ahora = new Date();
  const horaActual = ahora.toTimeString().slice(0, 8);
  const diaActual = ahora.getDay();
  
  // Verificar horario
  if (this.horarioInicio && this.horarioFin) {
    if (horaActual < this.horarioInicio || horaActual > this.horarioFin) {
      return false;
    }
  }
  
  // Verificar días hábiles
  if (this.diasHabiles && !this.diasHabiles.includes(diaActual)) {
    return false;
  }
  
  return true;
};

ConfiguracionWhatsapp.prototype.generarMensaje = function(datos) {
  let mensaje = this.plantillaMensaje || 'Adjunto tu comprobante {{numero}}';
  
  // Reemplazar variables en la plantilla
  const variables = {
    '{{cliente}}': datos.cliente || 'Cliente',
    '{{tipo}}': datos.tipoComprobante || 'comprobante',
    '{{numero}}': datos.numeroComprobante || '',
    '{{total}}': datos.total || '0.00',
    '{{empresa}}': datos.empresa || 'Nuestra empresa',
    '{{fecha}}': datos.fecha || new Date().toLocaleDateString('es-PE')
  };
  
  Object.keys(variables).forEach(variable => {
    mensaje = mensaje.replace(new RegExp(variable, 'g'), variables[variable]);
  });
  
  return mensaje;
};

ConfiguracionWhatsapp.prototype.registrarEnvio = async function(exitoso = true) {
  if (exitoso) {
    this.totalEnviados += 1;
    this.ultimoEnvio = new Date();
  } else {
    this.totalFallidos += 1;
  }
  
  await this.save();
};

ConfiguracionWhatsapp.prototype.validarLimites = function() {
  const hoy = new Date();
  const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  
  // Aquí se podría implementar lógica para contar envíos del día
  // Por simplicidad, asumimos que no se ha alcanzado el límite
  return this.totalEnviados < (this.limiteMensajesDia || 1000);
};

module.exports = ConfiguracionWhatsapp;