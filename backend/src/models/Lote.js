const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Modelo de Lote: control de lotes por producto y almacén
const Lote = sequelize.define('Lote', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  lote: {
    type: DataTypes.STRING,
    allowNull: false
  },
  productoId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  almacenId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fechaIngreso: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  vencimiento: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Activo'
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'Lotes',
  freezeTableName: true
});

module.exports = Lote;