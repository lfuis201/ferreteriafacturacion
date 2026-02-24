const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');







/**
 * @swagger
 * components:
 *   schemas:
 *     DetalleCotizacion:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID del detalle de cotización
 *         cotizacionId:
 *           type: integer
 *           description: ID de la cotización
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
 *         descripcion:
 *           type: string
 *           description: Descripción del detalle
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
 *         cotizacionId: 1
 *         productoId: 1
 *         cantidad: 10.5
 *         precioUnitario: 10.50
 *         subtotal: 105.00
 *         descripcion: Detalle de cotización de prueba
 *         createdAt: 2023-01-01T00:00:00Z
 *         updatedAt: 2023-01-01T00:00:00Z
 */




const DetalleCotizacion = sequelize.define('DetalleCotizacion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  cotizacionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Cotizaciones',
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
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true, 
  tableName: 'DetalleCotizaciones',
  freezeTableName: true
});

module.exports = DetalleCotizacion;