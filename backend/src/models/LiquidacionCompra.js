const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Modelo: Liquidación de Compras
const LiquidacionCompra = sequelize.define('LiquidacionCompra', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tipoComprobante: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'LIQUIDACIÓN DE COMPRA'
  },
  serie: {
    type: DataTypes.STRING,
    allowNull: true
  },
  numero: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Número del documento (opcional)'
  },
  fechaEmision: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  proveedorId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'Proveedores', key: 'id' }
  },
  vendedor: {
    type: DataTypes.STRING,
    allowNull: true
  },
  moneda: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'PEN'
  },
  tipoCambio: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: true
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  condicionPago: {
    type: DataTypes.STRING,
    allowNull: true
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'PENDIENTE'
  },
  tInafecto: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    defaultValue: 0
  },
  tExonerado: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    defaultValue: 0
  },
  tGravado: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    defaultValue: 0
  },
  tIgv: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    defaultValue: 0
  },
  total: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    defaultValue: 0
  }
}, {
  timestamps: true,
  tableName: 'LiquidacionesCompra',
  freezeTableName: true,
  indexes: [
    { fields: ['numero'] },
    { fields: ['fechaEmision'] },
    { fields: ['proveedorId'] }
  ]
});

module.exports = LiquidacionCompra;