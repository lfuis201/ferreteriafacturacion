const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * @swagger
 * components:
 *   schemas:
 *     PlanCuentas:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la cuenta
 *           example: 1
 *         codigo:
 *           type: string
 *           description: Código de la cuenta contable (ej. 10, 12, 60, etc.)
 *           example: "10"
 *         nombre:
 *           type: string
 *           description: Nombre de la cuenta contable
 *           example: "EFECTIVO Y EQUIVALENTES DE EFECTIVO"
 *         descripcion:
 *           type: string
 *           description: Descripción detallada de la cuenta
 *           example: "Comprende los fondos en caja y en instituciones financieras"
 *         nivel:
 *           type: integer
 *           description: Nivel de la cuenta (1=Elemento, 2=Divisionaria, 3=Subdivisionaria, etc.)
 *           example: 1
 *         cuentaPadreId:
 *           type: integer
 *           nullable: true
 *           description: ID de la cuenta padre (para cuentas de nivel superior a 1)
 *           example: null
 *         naturaleza:
 *           type: string
 *           enum: ['DEUDORA', 'ACREEDORA']
 *           description: Naturaleza de la cuenta
 *           example: "DEUDORA"
 *         tipo:
 *           type: string
 *           enum: [ACTIVO, PASIVO, PATRIMONIO, INGRESO, GASTO, RESULTADO]
 *           description: Tipo de cuenta según su clasificación
 *           example: "ACTIVO"
 *         esMovimiento:
 *           type: boolean
 *           description: Indica si la cuenta permite movimientos directos
 *           example: false
 *         estado:
 *           type: string
 *           enum: ['ACTIVO', 'INACTIVO']
 *           description: Estado de la cuenta
 *           example: "ACTIVO"
 *         codigoSunat:
 *           type: string
 *           nullable: true
 *           description: Código SUNAT para reportes electrónicos
 *           example: "10"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 */

const PlanCuentas = sequelize.define('PlanCuentas', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  codigo: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    comment: 'Código de la cuenta contable'
  },
  nombre: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: 'Nombre de la cuenta contable'
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Descripción detallada de la cuenta'
  },
  nivel: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Nivel de la cuenta (1=Elemento, 2=Divisionaria, etc.)'
  },
  cuentaPadreId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'PlanCuentas',
      key: 'id'
    },
    comment: 'ID de la cuenta padre'
  },
  naturaleza: {
    type: DataTypes.ENUM('DEUDORA', 'ACREEDORA'),
    allowNull: false,
    comment: 'Naturaleza de la cuenta'
  },
  tipo: {
    type: DataTypes.ENUM('ACTIVO', 'PASIVO', 'PATRIMONIO', 'INGRESO', 'GASTO', 'RESULTADO'),
    allowNull: false,
    comment: 'Tipo de cuenta según clasificación'
  },
  esMovimiento: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Indica si la cuenta permite movimientos directos'
  },
  estado: {
    type: DataTypes.ENUM('ACTIVO', 'INACTIVO'),
    allowNull: false,
    defaultValue: 'ACTIVO',
    comment: 'Estado de la cuenta'
  },
  codigoSunat: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Código SUNAT para reportes electrónicos'
  }
}, {
  timestamps: true,
  tableName: 'PlanCuentas',
  freezeTableName: true,
  indexes: [
    {
      fields: ['codigo'],
      unique: true
    },
    {
      fields: ['cuentaPadreId']
    },
    {
      fields: ['tipo']
    },
    {
      fields: ['estado']
    }
  ]
});

module.exports = PlanCuentas;