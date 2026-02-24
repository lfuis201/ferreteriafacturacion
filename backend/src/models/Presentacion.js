// Presentacion.js - Modelo corregido
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');




/**
 * @swagger
 * components:
 *   schemas:
 *     Presentacion:
 *       type: object
 *       required:
 *         - factor
 *         - productoId
 *       properties:
 *         id:
 *           type: integer
 *           description: ID autogenerado de la presentación
 *         descripcion:
 *           type: string
 *           description: Descripción detallada de la presentación
 *         factor:
 *           type: number
 *           format: float
 *           description: Factor de conversión respecto a la unidad base
 *           default: 1.0
 *         precio1:
 *           type: number
 *           format: float
 *           description: Primer precio de la presentación
 *         precio2:
 *           type: number
 *           format: float
 *           description: Segundo precio de la presentación
 *         precio3:
 *           type: number
 *           format: float
 *           description: Tercer precio de la presentación
 *         codigoBarras:
 *           type: string
 *           description: Código de barras único de la presentación
 *         unidadMedida:
 *           type: string
 *           description: Unidad de medida específica (unidad, paquete, caja, docena, etc.)
 *         productoId:
 *           type: integer
 *           description: ID del producto al que pertenece la presentación
 *         estado:
 *           type: boolean
 *           description: Estado de la presentación (activo/inactivo)
 *           default: true
 *       example:
 *         descripcion: Caja que contiene 12 unidades del producto
 *         factor: 12.0
 *         precio1: 120.00
 *         precio2: 115.00
 *         precio3: 110.00
 *         codigoBarras: "7501234567890"
 *         unidadMedida: "caja"
 *         productoId: 1
 */



const Presentacion = sequelize.define('Presentacion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  /*campo factor es un valor que se utiliza para convertir unidades de medida y permitir que la tienda muestre precios y cantidades en diferentes unidades. */
  factor: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 1.0,
    comment: 'Factor de conversión respecto a la unidad base'
  },
/*fin */

  // Campos de precios para diferentes niveles
  precio1: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Primer precio de la presentación'
  },
  precio2: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Segundo precio de la presentación'
  },
  precio3: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Tercer precio de la presentación'
  },

  // Código de barras único para cada presentación
  codigoBarras: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true,
    comment: 'Código de barras único de la presentación'
  },

  // Unidad de medida específica
  unidadMedida: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'unidad',
    comment: 'Unidad de medida específica (unidad, paquete, caja, docena, etc.)'
  },

  productoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Productos',
      key: 'id'
    }
  },
  
  // Campo para marcar si es la presentación por defecto del producto
  esDefecto: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Indica si esta es la presentación por defecto del producto'
  },
  
  estado: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
    timestamps: true,
  tableName: 'Presentaciones',
  freezeTableName: true
});

module.exports = Presentacion;