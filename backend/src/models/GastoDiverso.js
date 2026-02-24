const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Modelo principal para Gastos Diversos
const GastoDiverso = sequelize.define('GastoDiverso', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sucursalId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Sucursales', key: 'id' },
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Usuarios', key: 'id' },
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
  },
  proveedorId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'Proveedores', key: 'id' },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  },
  tipoComprobante: {
    type: DataTypes.STRING(80),
    allowNull: false
  },
  numero: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  moneda: {
    type: DataTypes.ENUM('PEN', 'USD'),
    allowNull: false,
    defaultValue: 'PEN'
  },
  tipoCambio: {
    type: DataTypes.DECIMAL(8,4),
    allowNull: true
  },
  fechaEmision: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  motivo: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  periodo: {
    type: DataTypes.STRING(40),
    allowNull: true
  },
  total: {
    type: DataTypes.DECIMAL(12,2),
    allowNull: false,
    defaultValue: 0
  },
  estado: {
    type: DataTypes.STRING(30),
    allowNull: false,
    defaultValue: 'REGISTRADO'
  }
}, {
  tableName: 'GastosDiversos',
  freezeTableName: true,
  timestamps: true,
  indexes: [
    { fields: ['sucursalId'] },
    { fields: ['usuarioId'] },
    { fields: ['proveedorId'] },
    { fields: ['fechaEmision'] },
    { fields: ['estado'] }
  ]
});

module.exports = GastoDiverso;