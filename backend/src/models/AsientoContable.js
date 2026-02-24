const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * @swagger
 * components:
 *   schemas:
 *     AsientoContable:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del asiento contable
 *           example: 1
 *         numero:
 *           type: string
 *           description: Número correlativo del asiento
 *           example: "ASI-001"
 *         fecha:
 *           type: string
 *           format: date
 *           description: Fecha del asiento contable
 *           example: "2024-01-15"
 *         glosa:
 *           type: string
 *           description: Descripción del asiento contable
 *           example: "Venta de mercadería según factura F001-001"
 *         tipoOperacion:
 *           type: string
 *           enum: [VENTA, COMPRA, CAJA, INVENTARIO, AJUSTE, OTRO]
 *           description: Tipo de operación que origina el asiento
 *           example: "VENTA"
 *         documentoReferencia:
 *           type: string
 *           nullable: true
 *           description: Documento que origina el asiento (factura, boleta, etc.)
 *           example: "F001-001"
 *         ventaId:
 *           type: integer
 *           nullable: true
 *           description: ID de la venta relacionada (si aplica)
 *           example: 1
 *         compraId:
 *           type: integer
 *           nullable: true
 *           description: ID de la compra relacionada (si aplica)
 *           example: null
 *         cajaId:
 *           type: integer
 *           nullable: true
 *           description: ID de la caja relacionada (si aplica)
 *           example: null
 *         sucursalId:
 *           type: integer
 *           description: ID de la sucursal donde se registra el asiento
 *           example: 1
 *         usuarioId:
 *           type: integer
 *           description: ID del usuario que registra el asiento
 *           example: 1
 *         estado:
 *           type: string
 *           enum: [BORRADOR, CONFIRMADO, ANULADO]
 *           description: Estado del asiento contable
 *           example: "CONFIRMADO"
 *         totalDebe:
 *           type: number
 *           format: float
 *           description: Total del debe (suma de todos los débitos)
 *           example: 118.00
 *         totalHaber:
 *           type: number
 *           format: float
 *           description: Total del haber (suma de todos los créditos)
 *           example: 118.00
 *         diferencia:
 *           type: number
 *           format: float
 *           description: Diferencia entre debe y haber (debe ser 0)
 *           example: 0.00
 *         observaciones:
 *           type: string
 *           nullable: true
 *           description: Observaciones adicionales
 *           example: "Asiento generado automáticamente"
 *         esAutomatico:
 *           type: boolean
 *           description: Indica si el asiento fue generado automáticamente
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 */

const AsientoContable = sequelize.define('AsientoContable', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  numero: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: 'Número correlativo del asiento'
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Fecha del asiento contable'
  },
  glosa: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Descripción del asiento contable'
  },
  tipoOperacion: {
    type: DataTypes.ENUM('VENTA', 'COMPRA', 'CAJA', 'INVENTARIO', 'AJUSTE', 'OTRO'),
    allowNull: false,
    comment: 'Tipo de operación que origina el asiento'
  },
  documentoReferencia: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Documento que origina el asiento'
  },
  ventaId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Ventas',
      key: 'id'
    },
    comment: 'ID de la venta relacionada'
  },
  compraId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'compra',
      key: 'id'
    },
    comment: 'ID de la compra relacionada'
  },
  cajaId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Cajas',
      key: 'id'
    },
    comment: 'ID de la caja relacionada'
  },
  sucursalId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Sucursal',
      key: 'id'
    },
    comment: 'ID de la sucursal'
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Usuarios',
      key: 'id'
    },
    comment: 'ID del usuario que registra el asiento'
  },
  estado: {
    type: DataTypes.ENUM('BORRADOR', 'CONFIRMADO', 'ANULADO'),
    allowNull: false,
    defaultValue: 'BORRADOR',
    comment: 'Estado del asiento contable'
  },
  totalDebe: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Total del debe'
  },
  totalHaber: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Total del haber'
  },
  diferencia: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Diferencia entre debe y haber'
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Observaciones adicionales'
  },
  esAutomatico: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Indica si el asiento fue generado automáticamente'
  }
}, {
  timestamps: true,
  tableName: 'AsientosContables',
  freezeTableName: true,
  indexes: [
    {
      fields: ['numero'],
      unique: true
    },
    {
      fields: ['fecha']
    },
    {
      fields: ['tipoOperacion']
    },
    {
      fields: ['estado']
    },
    {
      fields: ['sucursalId']
    },
    {
      fields: ['ventaId']
    },
    {
      fields: ['compraId']
    }
  ]
});

module.exports = AsientoContable;