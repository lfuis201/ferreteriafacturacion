const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * @swagger
 * components:
 *   schemas:
 *     ReferenciaInventario:
 *       type: object
 *       required:
 *         - codigo
 *         - descripcion
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la referencia
 *           example: 1
 *         codigo:
 *           type: string
 *           description: Código de la referencia
 *           example: "REF001"
 *         descripcion:
           type: string
           description: Descripción de la referencia
           example: "Tornillo hexagonal 1/4"
         createdAt:
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
         id: 1
         codigo: "REF001"
         descripcion: "Tornillo hexagonal 1/4"
 */
const ReferenciaInventario = sequelize.define('ReferenciaInventario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  codigo: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: 'Código único de la referencia'
  },
  descripcion: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Descripción detallada de la referencia'
  },

}, {
  timestamps: true,
  tableName: 'ReferenciasInventario',
  freezeTableName: true,
  indexes: [
    {
      unique: true,
      fields: ['codigo']
    }
  ]
});

module.exports = ReferenciaInventario;