const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');



/**
 * @swagger
 * components:
 *   schemas:
 *     DetalleCompra:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID del detalle de compra
 *         compraId:
 *           type: integer
 *           description: ID de la compra
 *         productoId:
 *           type: integer
 *           description: ID del producto
 *         cantidad:
 *           type: integer
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
 *         compraId: 1
 *         productoId: 1
 *         cantidad: 10
 *         precioUnitario: 10.50
 *         subtotal: 105.00
 *         createdAt: 2023-01-01T00:00:00Z
 *         updatedAt: 2023-01-01T00:00:00Z
 */

const DetalleCompra = sequelize.define('DetalleCompra', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
 compraId: {
  type: DataTypes.INTEGER,
  allowNull: false,
  references: {
    model: 'Compra',
    key: 'id'
  }
},
  productoId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Productos',
      key: 'id'
    }, 
    onDelete: 'SET NULL',  
    onUpdate: 'CASCADE' 
  }, 

 
  cantidad: {
    type: DataTypes.INTEGER,
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
  tableName: 'DetalleCompra',
  freezeTableName: true
  
});

module.exports = DetalleCompra;