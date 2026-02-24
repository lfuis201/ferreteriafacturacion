const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * @swagger
 * components:
 *   schemas:
 *     PagoCompra:
 *       type: object
 *       required:
 *         - compraId
 *         - formaPago
 *         - monto
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del pago de compra
 *           example: 1
 *         compraId:
 *           type: integer
 *           description: ID de la compra asociada
 *           example: 1
 *         formaPago:
 *           type: string
 *           description: Forma de pago utilizada
 *           example: "Efectivo"
 *         desde:
 *           type: string
 *           description: Origen del pago
 *           example: "CAJA GENERAL - Administracion"
 *         referencia:
 *           type: string
 *           description: Referencia del pago
 *           example: "TRF-001234"
 *         glosa:
 *           type: string
 *           description: Descripción o glosa del pago
 *           example: "Pago por compra de productos"
 *         monto:
 *           type: number
 *           format: float
 *           description: Monto del pago
 *           example: 100.00
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
 */

const PagoCompra = sequelize.define('PagoCompra', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  compraId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Compra',
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  formaPago: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Forma de pago utilizada (Efectivo, Transferencia, etc.)'
  },
  desde: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Origen del pago (cuenta, caja, etc.)'
  },
  referencia: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Referencia del pago (número de transferencia, cheque, etc.)'
  },
  glosa: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Descripción o glosa del pago'
  },
  monto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Monto del pago'
  }
}, {
  timestamps: true,
  tableName: 'PagosCompra',
  freezeTableName: true
});

module.exports = PagoCompra;