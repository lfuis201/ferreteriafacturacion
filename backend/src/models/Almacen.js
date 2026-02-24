const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * @swagger
 * components:
 *   schemas:
 *     Almacen:
 *       type: object
 *       required:
 *         - nombre
 *         - sucursalId
 *       properties:
 *         id:
 *           type: integer
 *           description: ID autogenerado del almacén
 *         nombre:
 *           type: string
 *           description: Nombre del almacén (ej. Principal, Taller, Mostrador)
 *         descripcion:
 *           type: string
 *           description: Descripción del almacén
 *         ubicacion:
 *           type: string
 *           description: Ubicación física del almacén
 *         sucursalId:
 *           type: integer
 *           description: ID de la sucursal a la que pertenece
 *         estado:
 *           type: boolean
 *           description: Estado del almacén (activo/inactivo)
 *         tipo:
 *           type: string
 *           enum: ['PRINCIPAL', 'TALLER', 'MOSTRADOR', 'DEPOSITO', 'OTRO']
 *           description: Tipo de almacén
 *       example:
 *         nombre: Almacén Principal
 *         descripcion: Almacén principal de la sucursal
 *         ubicacion: Planta baja - Sector A
 *         sucursalId: 1
 *         estado: true
 *         tipo: PRINCIPAL
 */

const Almacen = sequelize.define('Almacen', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Nombre del almacén'
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Descripción detallada del almacén'
  },
  ubicacion: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Ubicación física del almacén'
  },
  sucursalId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Sucursal',
      key: 'id'
    },
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    comment: 'ID de la sucursal a la que pertenece'
  },
  estado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Estado del almacén (activo/inactivo)'
  },
  tipo: {
    type: DataTypes.ENUM('PRINCIPAL', 'TALLER', 'MOSTRADOR', 'DEPOSITO', 'OTRO'),
    allowNull: false,
    defaultValue: 'PRINCIPAL',
    comment: 'Tipo de almacén'
  }
}, {
  timestamps: true,
  tableName: 'almacenes',
  freezeTableName: true,
  indexes: [
    {
      unique: true,
      fields: ['nombre', 'sucursalId'],
      name: 'unique_almacen_por_sucursal'
    },
    {
      fields: ['sucursalId']
    },
    {
      fields: ['estado']
    },
    {
      fields: ['tipo']
    }
  ]
});

module.exports = Almacen;