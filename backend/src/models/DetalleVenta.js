const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DetalleVenta = sequelize.define('DetalleVenta', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ventaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Ventas',
      key: 'id'
    }
  },
  productoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Productos',
      key: 'id'
    }
  },
  presentacionId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Presentaciones',
      key: 'id'
    }
  },
  cantidad: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  precioUnitario: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  timestamps: true, 
  
  tableName: 'DetalleVentas',
  freezeTableName: true
});

module.exports = DetalleVenta;