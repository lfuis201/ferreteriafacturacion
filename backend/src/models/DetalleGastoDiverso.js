const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DetalleGastoDiverso = sequelize.define('DetalleGastoDiverso', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  gastoDiversoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'GastosDiversos', key: 'id' }
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  total: {
    type: DataTypes.DECIMAL(12,2),
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'DetallesGastosDiversos',
  freezeTableName: true,
  timestamps: true,
  indexes: [
    { fields: ['gastoDiversoId'] }
  ]
});

module.exports = DetalleGastoDiverso;