const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); 









/**
 * @swagger
 * components:
 *   schemas:
 *     NotaVenta:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID de la nota de venta
 *         clienteId:
 *           type: integer
 *           description: ID del cliente
 *         usuarioId:
 *           type: integer
 *           description: ID del usuario que creó la nota de venta
 *         sucursalId:
 *           type: integer
 *           description: ID de la sucursal
 *         serieComprobante:
 *           type: string
 *           description: Serie del comprobante
 *         numeroComprobante:
 *           type: string
 *           description: Número del comprobante
 *         fecha:
 *           type: string
 *           format: date-time
 *           description: Fecha de la nota de venta
 *         subtotal:
 *           type: number
 *           format: float
 *           description: Subtotal de la nota de venta
 *         igv:
 *           type: number
 *           format: float
 *           description: IGV de la nota de venta
 *         total:
 *           type: number
 *           format: float
 *           description: Total de la nota de venta
 *         estado:
 *           type: string
 *           enum: ['emitida', 'anulada']
 *           description: Estado de la nota de venta
 *         motivoAnulacion:
 *           type: string
 *           description: Motivo de la anulación
 *         usuarioAnulacionId:
 *           type: integer
 *           description: ID del usuario que anuló la nota de venta
 *         fechaAnulacion:
 *           type: string
 *           format: date-time
 *           description: Fecha de anulación
 *         observacion:
 *           type: string
 *           description: Observaciones sobre la nota de venta
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de creación del registro
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de la última actualización del registro
 *       example:
 *         id: 1
 *         clienteId: 1
 *         usuarioId: 1
 *         sucursalId: 1
 *         serieComprobante: NV-001
 *         numeroComprobante: 00000001
 *         fecha: 2023-01-01T00:00:00Z
 *         subtotal: 100.00
 *         igv: 18.00
 *         total: 118.00
 *         estado: emitida
 *         observacion: Nota de venta de prueba
 */




const NotaVenta = sequelize.define('NotaVenta', {
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
  serieComprobante: {
    type: DataTypes.STRING,
    allowNull: false
  },
  numeroComprobante: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
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
    type: DataTypes.ENUM('emitida', 'anulada'),
    allowNull: false,
    defaultValue: 'emitida'
  },
  motivoAnulacion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  usuarioAnulacionId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Usuarios',
      key: 'id'
    }
  },
  fechaAnulacion: {
    type: DataTypes.DATE,
    allowNull: true
  },
  observacion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Campos adicionales del formulario
  direccionCliente: {
    type: DataTypes.STRING,
    allowNull: true
  },
  establecimiento: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Oficina Principal'
  },
  moneda: {
    type: DataTypes.ENUM('soles', 'dolares'),
    allowNull: false,
    defaultValue: 'soles'
  },
  tipoCambio: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: true,
    defaultValue: 3.848
  },
  placa: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ordenCompra: {
    type: DataTypes.STRING,
    allowNull: true
  },
  vendedor: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Administrador'
  },
  fechaVencimiento: {
    type: DataTypes.DATE,
    allowNull: true
  },
  direccionEnvio: {
    type: DataTypes.STRING,
    allowNull: true
  },
  tipoPeriodo: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true, 
  tableName: 'NotaVentas',
  freezeTableName: true
});

module.exports = NotaVenta;