const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Modelo de Marca para gestionar marcas de productos
const Marca = sequelize.define('Marca', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  imagen: {
    type: DataTypes.STRING,
    allowNull: true
  },
  estado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  timestamps: true,
  tableName: 'Marcas',
  freezeTableName: true
});

module.exports = Marca;