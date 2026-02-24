const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MetodoGastoDiverso = sequelize.define('MetodoGastoDiverso', {
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
  metodo: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  destino: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  referencia: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  glosa: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  monto: {
    type: DataTypes.DECIMAL(12,2),
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'MetodosGastosDiversos',
  freezeTableName: true,
  timestamps: true,
  indexes: [
    { fields: ['gastoDiversoId'] }
  ]
});

module.exports = MetodoGastoDiverso;