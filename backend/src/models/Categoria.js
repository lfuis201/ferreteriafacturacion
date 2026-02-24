const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');





/**
 * @swagger
 * components:
 *   schemas:
 *     Categoria:
 *       type: object
 *       required:
 *         - nombre
 *       properties:
 *         id:
 *           type: integer
 *           description: ID autogenerado de la categoría
 *         nombre:
 *           type: string
 *           description: Nombre de la categoría (debe ser único)
 *         descripcion:
 *           type: string
 *           description: Descripción de la categoría
 *         estado:
 *           type: boolean
 *           description: Estado de la categoría (activo/inactivo)
 *       example:
 *         nombre: Herramientas
 *         descripcion: Herramientas manuales y eléctricas
 *         estado: true
 */


const Categoria = sequelize.define('Categoria', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  estado: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  } 
  
}, {
  timestamps: true,
  tableName: 'Categorias',
  freezeTableName: true
});

module.exports = Categoria;