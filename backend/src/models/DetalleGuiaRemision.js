 
 
/**
 * @swagger
 * components:
 *   schemas:
 *     DetalleGuiaRemision:
 *       type: object
 *       required:
 *         - guiaId
 *         - productoId
 *         - cantidad
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del detalle de guía de remisión
 *           example: 1
 *         guiaId:
 *           type: integer
 *           description: ID de la guía de remisión asociada
 *           example: 1
 *         productoId:
 *           type: integer
 *           description: ID del producto
 *           example: 1
 *         presentacionId:
 *           type: integer
 *           description: ID de la presentación del producto (opcional)
 *           example: 1
 *         cantidad:
 *           type: number
 *           format: decimal
 *           description: Cantidad del producto
 *           example: 10.50
 *         descripcion:
 *           type: string
 *           description: Descripción adicional del producto
 *           example: "Producto en buen estado"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DetalleGuiaRemision = sequelize.define('DetalleGuiaRemision', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  guiaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'GuiaRemisions',
      key: 'id'
    }
  },
  productoId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Permitir null para productos sin ID específico
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
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true, 
  tableName: 'DetalleGuiaRemisions',
  freezeTableName: true
});

module.exports = DetalleGuiaRemision;

 