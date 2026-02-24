const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DetallePedido = sequelize.define('DetallePedido', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  pedidoId: { 
    type: DataTypes.INTEGER, 
    allowNull: false, 
    references: { model: 'Pedidos', key: 'id' }
  },
  productoId: { 
    type: DataTypes.INTEGER, 
    allowNull: true, 
    references: { model: 'Productos', key: 'id' }
  },
  descripcion: { type: DataTypes.TEXT, allowNull: true },
  unidad: { type: DataTypes.STRING(20), allowNull: true },
  cantidad: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  precioUnitario: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  total: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
}, {
  timestamps: true,
  tableName: 'DetallePedidos',
  freezeTableName: true
});

module.exports = DetallePedido;