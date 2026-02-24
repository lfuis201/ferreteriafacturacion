const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * @swagger
 * components:
 *   schemas:
 *     Cotizacion:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID de la cotización
 *         clienteId:
 *           type: integer
 *           description: ID del cliente
 *         usuarioId:
 *           type: integer
 *           description: ID del usuario que creó la cotización
 *         sucursalId:
 *           type: integer
 *           description: ID de la sucursal
 *         fecha:
 *           type: string
 *           format: date-time
 *           description: Fecha de la cotización
 *         fechaEntrega:
 *           type: string
 *           format: date
 *           description: Fecha de entrega estimada
 *         registradoPor:
 *           type: string
 *           description: Usuario que registró la cotización
 *         vendedor:
 *           type: string
 *           description: Vendedor asignado
 *         cliente:
 *           type: string
 *           description: Nombre del cliente
 *         numeroReferencia:
 *           type: string
 *           description: Número de referencia único de la cotización
 *         comprobantes:
 *           type: string
 *           description: Número de comprobantes asociados
 *         notasDeVenta:
 *           type: string
 *           description: Número de notas de venta
 *         pedido:
 *           type: string
 *           description: Número de pedido
 *         oportunidadVenta:
 *           type: string
 *           description: Oportunidad de venta
 *         infReferencial:
 *           type: string
 *           description: Información referencial
 *         contrato:
 *           type: string
 *           description: Número de contrato
 *         tipoCambio:
 *           type: string
 *           description: Tipo de cambio aplicado
 *         moneda:
 *           type: string
 *           description: Moneda de la cotización
 *         tExportacion:
 *           type: number
 *           format: float
 *           description: Total exportación
 *         tGratuito:
 *           type: number
 *           format: float
 *           description: Total gratuito
 *         tInafecta:
 *           type: number
 *           format: float
 *           description: Total inafecta
 *         tExonerado:
 *           type: number
 *           format: float
 *           description: Total exonerado
 *         tGravado:
 *           type: number
 *           format: float
 *           description: Total gravado
 *         subtotal:
 *           type: number
 *           format: float
 *           description: Subtotal de la cotización
 *         igv:
 *           type: number
 *           format: float
 *           description: IGV de la cotización
 *         total:
 *           type: number
 *           format: float
 *           description: Total de la cotización
 *         estado:
 *           type: string
 *           enum: [Activo, Pendiente, Rechazada, Aceptada]
 *           description: Estado de la cotización
 *         observacion:
 *           type: string
 *           description: Observaciones sobre la cotización
 *         validezDias:
 *           type: integer
 *           description: Días de validez de la cotización
 *         productos:
 *           type: array
 *           description: Lista de productos en formato JSON
 *         pagos:
 *           type: array
 *           description: Lista de métodos de pago en formato JSON
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de creación del registro
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de la última actualización del registro
 */

const Cotizacion = sequelize.define('Cotizacion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  clienteId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Clientes',
      key: 'id'
    }
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Usuarios',
      key: 'id'
    }
  },
  sucursalId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Sucursal',
      key: 'id'
    }
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  fechaEmision: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Fecha de emisión de la cotización'
  },
  fechaEntrega: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Fecha de entrega estimada'
  },
  tiempoValidez: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Tiempo de validez de la cotización'
  },
  tiempoEntrega: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Tiempo estimado de entrega'
  },
  direccionEnvio: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Dirección de envío'
  },
  terminoPago: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: 'Contado',
    comment: 'Término de pago'
  },
  numeroCuenta: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Número de cuenta para pagos'
  },
  registradoPor: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Usuario que registró la cotización'
  },
  vendedor: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Vendedor asignado'
  },
  cliente: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Nombre del cliente'
  },
  numeroReferencia: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  comprobantes: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: '0',
    comment: 'Número de comprobantes asociados'
  },
  notasDeVenta: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: '0',
    comment: 'Número de notas de venta'
  },
  pedido: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Número de pedido'
  },
  oportunidadVenta: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Oportunidad de venta'
  },
  infReferencial: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Información referencial'
  },
  contrato: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Número de contrato'
  },
  tipoCambio: {
    type: DataTypes.STRING(10),
    allowNull: true,
    defaultValue: '3.85',
    comment: 'Tipo de cambio aplicado'
  },
  moneda: {
    type: DataTypes.STRING(10),
    allowNull: false,
    defaultValue: 'SOL',
    comment: 'Moneda de la cotización'
  },
  tExportacion: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Total exportación'
  },
  tGratuito: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Total gratuito'
  },
  tInafecta: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Total inafecta'
  },
  tExonerado: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Total exonerado'
  },
  tGravado: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Total gravado'
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  igv: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('Activo', 'Pendiente', 'Rechazada', 'Aceptada'),
    allowNull: false,
    defaultValue: 'Activo'
  },
  observacion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  validezDias: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 15,
    comment: 'Días de validez de la cotización'
  },
  productos: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Lista de productos en formato JSON'
  },
  pagos: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Lista de métodos de pago en formato JSON'
  }
}, {
  timestamps: true,
  tableName: 'Cotizaciones',
  freezeTableName: true
});

module.exports = Cotizacion;