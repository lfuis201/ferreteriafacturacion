const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
 



/**
 * @swagger
 * components:
 *   schemas:
 *     DetalleNotaVenta:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID del detalle de la nota de venta
 *         notaVentaId:
 *           type: integer
 *           description: ID de la nota de venta
 *         productoId:
 *           type: integer
 *           description: ID del producto
 *         cantidad:
 *           type: number
 *           format: float
 *           description: Cantidad del producto
 *         precioUnitario:
 *           type: number
 *           format: float
 *           description: Precio unitario del producto
 *         subtotal:
 *           type: number
 *           format: float
 *           description: Subtotal del detalle
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de creación del registro
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de la última actualización del registro
 *       example:
 *         id: 1
 *         notaVentaId: 1
 *         productoId: 1
 *         cantidad: 2.5
 *         precioUnitario: 50.00
 *         subtotal: 125.00
 */



const DetalleNotaVenta = sequelize.define('DetalleNotaVenta', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  notaVentaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'NotaVentas',
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
  tableName: 'DetalleNotaVenta',
  freezeTableName: true
});

module.exports = DetalleNotaVenta;