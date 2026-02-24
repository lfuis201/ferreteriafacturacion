const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Ítems que componen un Producto Compuesto (cada uno referencia a Producto)
const ProductoCompuestoItem = sequelize.define('ProductoCompuestoItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  productoCompuestoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'ProductosCompuestos', key: 'id' },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  productoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Productos', key: 'id' },
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
  },
  cantidad: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 1
  }
}, {
  timestamps: true,
  tableName: 'ProductosCompuestosItems',
  freezeTableName: true,
  indexes: [
    { fields: ['productoCompuestoId'] },
    { fields: ['productoId'] }
  ]
});

module.exports = ProductoCompuestoItem;