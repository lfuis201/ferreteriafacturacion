const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Modelo de Serie: número de serie asociado a un producto
const Serie = sequelize.define('Serie', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  serie: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  productoId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Activo'
  },
  vendido: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'Series',
  freezeTableName: true
});

module.exports = Serie;