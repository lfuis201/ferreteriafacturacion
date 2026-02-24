const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * @swagger
 * components:
 *   schemas:
 *     LibroMayor:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del registro del libro mayor
 *           example: 1
 *         planCuentasId:
 *           type: integer
 *           description: ID de la cuenta contable
 *           example: 1
 *         periodo:
 *           type: string
 *           description: Período contable (YYYY-MM)
 *           example: "2024-01"
 *         sucursalId:
 *           type: integer
 *           description: ID de la sucursal
 *           example: 1
 *         saldoInicialDebe:
 *           type: number
 *           format: float
 *           description: Saldo inicial del debe
 *           example: 0.00
 *         saldoInicialHaber:
 *           type: number
 *           format: float
 *           description: Saldo inicial del haber
 *           example: 0.00
 *         movimientosDebe:
 *           type: number
 *           format: float
 *           description: Total de movimientos del debe en el período
 *           example: 1500.00
 *         movimientosHaber:
 *           type: number
 *           format: float
 *           description: Total de movimientos del haber en el período
 *           example: 800.00
 *         saldoFinalDebe:
 *           type: number
 *           format: float
 *           description: Saldo final del debe
 *           example: 700.00
 *         saldoFinalHaber:
 *           type: number
 *           format: float
 *           description: Saldo final del haber
 *           example: 0.00
 *         saldoDeudor:
 *           type: number
 *           format: float
 *           description: Saldo deudor neto
 *           example: 700.00
 *         saldoAcreedor:
 *           type: number
 *           format: float
 *           description: Saldo acreedor neto
 *           example: 0.00
 *         estado:
 *           type: string
 *           enum: ['ABIERTO', 'CERRADO']
 *           description: Estado del período
 *           example: "ABIERTO"
 *         fechaCierre:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Fecha de cierre del período
 *           example: null
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 */

const LibroMayor = sequelize.define('LibroMayor', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  planCuentasId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'PlanCuentas',
      key: 'id'
    },
    comment: 'ID de la cuenta contable'
  },
  periodo: {
    type: DataTypes.STRING(7), // YYYY-MM
    allowNull: false,
    comment: 'Período contable (YYYY-MM)'
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
  saldoInicialDebe: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Saldo inicial del debe'
  },
  saldoInicialHaber: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Saldo inicial del haber'
  },
  movimientosDebe: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Total de movimientos del debe en el período'
  },
  movimientosHaber: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Total de movimientos del haber en el período'
  },
  saldoFinalDebe: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Saldo final del debe'
  },
  saldoFinalHaber: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Saldo final del haber'
  },
  saldoDeudor: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Saldo deudor neto'
  },
  saldoAcreedor: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Saldo acreedor neto'
  },
  estado: {
    type: DataTypes.ENUM('ABIERTO', 'CERRADO'),
    allowNull: false,
    defaultValue: 'ABIERTO',
    comment: 'Estado del período'
  },
  fechaCierre: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha de cierre del período'
  }
}, {
  timestamps: true,
  tableName: 'LibroMayor',
  freezeTableName: true,
  indexes: [
    {
      fields: ['planCuentasId', 'periodo', 'sucursalId'],
      unique: true,
      name: 'unique_cuenta_periodo_sucursal'
    },
    {
      fields: ['periodo']
    },
    {
      fields: ['sucursalId']
    },
    {
      fields: ['estado']
    }
  ]
});

module.exports = LibroMayor;