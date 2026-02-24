const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * @swagger
 * components:
 *   schemas:
 *     Inventario:
 *       type: object
 *       required:
 *         - productoId
 *         - sucursalId
 *         - stock
 *         - stockMinimo
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del inventario
 *           example: 1
 *         productoId:
 *           type: integer
 *           description: ID del producto
 *           example: 5
 *         sucursalId:
 *           type: integer
 *           description: ID de la sucursal
 *           example: 1
 *         stock:
 *           type: integer
 *           description: Cantidad en stock (entero)
 *           example: 100
 *         stockMinimo:
 *           type: integer
 *           description: Stock mínimo permitido (entero)
 *           example: 10
 *         precioVenta:
 *           type: number
 *           format: float
 *           description: Precio de venta
 *           example: 15.99
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de creación
 *           example: 2023-01-01T00:00:00Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de última actualización
 *           example: 2023-01-01T00:00:00Z
 *       example:
 *         id: 1
 *         productoId: 5
 *         sucursalId: 1
 *         stock: 100
 *         stockMinimo: 10
 *         precioVenta: 15.99
 */
const Inventario = sequelize.define('Inventario', {
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
    }
  },
  sucursalId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Sucursal', // Corregido para que coincida con el tableName del modelo Sucursal
      key: 'id'
    }
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  stockMinimo: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5
  },
  precioVenta: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Precio específico para esta sucursal (opcional)'
  }
}, {
  timestamps: true,
  tableName: 'Inventarios',
  freezeTableName: true
});

module.exports = Inventario;