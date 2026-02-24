const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * @swagger
 * components:
 *   schemas:
 *     InventarioAlmacen:
 *       type: object
 *       required:
 *         - productoId
 *         - almacenId
 *       properties:
 *         id:
 *           type: integer
 *           description: ID autogenerado del inventario
 *         productoId:
 *           type: integer
 *           description: ID del producto
 *         almacenId:
 *           type: integer
 *           description: ID del almacén
 *         stock:
 *           type: integer
 *           description: Cantidad en stock
 *         stockMinimo:
 *           type: integer
 *           description: Stock mínimo requerido
 *         stockMaximo:
 *           type: integer
 *           description: Stock máximo permitido
 *         precioVenta:
 *           type: number
 *           format: decimal
 *           description: Precio de venta específico para este almacén
 *         ubicacionFisica:
 *           type: string
 *           description: Ubicación física específica dentro del almacén
 *         estado:
 *           type: boolean
 *           description: Estado del registro (activo/inactivo)
 *       example:
 *         productoId: 1
 *         almacenId: 1
 *         stock: 100
 *         stockMinimo: 10
 *         stockMaximo: 500
 *         precioVenta: 25.99
 *         ubicacionFisica: Estante A-1-3
 *         estado: true
 */

const InventarioAlmacen = sequelize.define('InventarioAlmacen', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  productoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Productos',
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    comment: 'ID del producto'
  },
  almacenId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'almacenes',
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    comment: 'ID del almacén'
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Cantidad en stock'
  },
  stockMinimo: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5,
    comment: 'Stock mínimo requerido'
  },
  stockMaximo: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Stock máximo permitido'
  },
  precioVenta: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Precio de venta específico para este almacén'
  },
  ubicacionFisica: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Ubicación física específica dentro del almacén (ej: Estante A-1-3)'
  },
  estado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Estado del registro (activo/inactivo)'
  }
}, {
  timestamps: true,
  tableName: 'inventario_almacenes',
  freezeTableName: true,
  indexes: [
    {
      unique: true,
      fields: ['productoId', 'almacenId'],
      name: 'unique_producto_almacen'
    },
    {
      fields: ['almacenId']
    },
    {
      fields: ['productoId']
    },
    {
      fields: ['stock']
    },
    {
      fields: ['estado']
    }
  ]
});

module.exports = InventarioAlmacen;