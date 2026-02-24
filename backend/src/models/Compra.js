const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); 






/**
 * @swagger
 * components:
 *   schemas:
 *     Compra:
 *       type: object
 *       required:
 *         - proveedorId
 *         - sucursalId
 *         - usuarioId
 *         - tipoComprobante
 *         - fechaCompra
 *         - subtotal
 *         - igv
 *         - total
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la compra
 *           example: 1
 *         proveedorId:
 *           type: integer
 *           description: ID del proveedor
 *           example: 5
 *         sucursalId:
 *           type: integer
 *           description: ID de la sucursal donde se realizó la compra
 *           example: 1
 *         usuarioId:
 *           type: integer
 *           description: ID del usuario que registró la compra
 *           example: 95
 *         tipoComprobante:
           type: string
           enum: ['FACTURA ELECTRÓNICA', 'BOLETA DE VENTA ELECTRONICA', 'NOTA DE CREDITO', 'NOTA DE DEBITO', 'GUÍA', 'NOTA DE VENTA', 'RECIBO POR HONORARIOS', 'SERVICIOS PÚBLICOS']
           description: Tipo de comprobante de la compra
           example: 'FACTURA ELECTRÓNICA'
 *         serieComprobante:
 *           type: string
 *           description: Serie del comprobante (opcional)
 *           example: F001
 *         numeroComprobante:
 *           type: string
 *           description: Número del comprobante (opcional)
 *           example: 1234567
 *         fechaCompra:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de la compra
 *           example: 2023-01-01T00:00:00Z
 *         subtotal:
 *           type: number
 *           format: float
 *           description: Subtotal de la compra (sin IGV)
 *           example: 100.00
 *         igv:
 *           type: number
 *           format: float
 *           description: Impuesto al Valor Agregado (IGV)
 *           example: 18.00
 *         total:
 *           type: number
 *           format: float
 *           description: Total de la compra (incluyendo IGV)
 *           example: 118.00
 *         estado:
           type: string
           enum: ['PENDIENTE', 'COMPLETADA', 'ANULADA', 'PROCESADA']
           description: Estado de la compra
           example: 'PENDIENTE'
 *         observacion:
 *           type: string
 *           description: Observaciones sobre la compra (opcional)
 *           example: Compra de productos para stock inicial
 *         xmlOriginal:
 *           type: string
 *           description: XML original subido por el usuario (opcional)
 *           example: "<?xml version='1.0' encoding='UTF-8'?>..."
 *         cdrRespuesta:
 *           type: string
 *           description: CDR de respuesta de SUNAT (opcional)
 *           example: "<?xml version='1.0' encoding='UTF-8'?>..."
 *         pdfGenerado:
 *           type: string
 *           description: Ruta del archivo PDF generado (opcional)
 *           example: "/files/compra-123.pdf"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de creación del registro
 *           example: 2023-01-01T00:00:00Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de última actualización del registro
 *           example: 2023-01-01T00:00:00Z
 *       example:
 *         id: 1
 *         proveedorId: 5
 *         sucursalId: 1
 *         usuarioId: 95
 *         tipoComprobante: 'FACTURA ELECTRÓNICA'
 *         serieComprobante: F001
 *         numeroComprobante: 1234567
 *         fechaCompra: 2023-01-01T00:00:00Z
 *         subtotal: 100.00
 *         igv: 18.00
 *         total: 118.00
 *         estado: 'PENDIENTE'
 *         observacion: Compra de productos para stock inicial
 */



const Compra = sequelize.define('Compra', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  proveedorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Proveedores',
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
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Usuarios',
      key: 'id'
    }
  },
  tipoComprobante: {
    type: DataTypes.ENUM('FACTURA ELECTRÓNICA', 'BOLETA DE VENTA ELECTRONICA', 'NOTA DE CREDITO', 'NOTA DE DEBITO', 'GUÍA',  'NOTA DE VENTA', 'RECIBO POR HONORARIOS', 'SERVICIOS PÚBLICOS'),
    allowNull: false, 
    comment: 'Tipo de comprobante de la compra'
  },


 



  serieComprobante: {
    type: DataTypes.STRING,
    allowNull: true
  },
  numeroComprobante: {
    type: DataTypes.STRING,
    allowNull: true
  },
  fechaCompra: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  fechaVencimiento: {
    type: DataTypes.DATE,
    allowNull: true
  },
  moneda: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Soles'
  },
  tipoCambio: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: true,
    defaultValue: 1.000
  },
  ordenCompra: {
    type: DataTypes.STRING,
    allowNull: true
  },
  constDetraccion: {
    type: DataTypes.STRING,
    allowNull: true
  },
  fechaDetraccion: {
    type: DataTypes.DATE,
    allowNull: true
  },
  porcentajeDetraccion: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  periodoCompra: {
    type: DataTypes.STRING,
    allowNull: true
  },
  condicionPago: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Contado'
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
    type: DataTypes.ENUM('PENDIENTE', 'COMPLETADA', 'ANULADA', 'PROCESADA'),
    allowNull: false,
    defaultValue: 'PENDIENTE'
  },
  observacion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  xmlOriginal: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'XML original subido por el usuario'
  },
  cdrRespuesta: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'CDR de respuesta de SUNAT'
  },
  pdfGenerado: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Ruta del archivo PDF generado'
  }
}, {
  timestamps: true,
  tableName: 'compra', 
  freezeTableName: true
})

module.exports = Compra;