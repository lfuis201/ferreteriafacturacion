const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');




/**
 * @swagger
 * components:
 *   schemas:
 *     Caja:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la caja
 *           example: 1
 *         sucursalId:
 *           type: integer
 *           description: ID de la sucursal a la que pertenece la caja
 *           example: 1
 *         fechaApertura:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de apertura de la caja
 *           example: "2023-01-01T08:00:00.000Z"
 *         fechaCierre:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Fecha y hora de cierre de la caja (nulo si está abierta)
 *           example: "2023-01-01T20:00:00.000Z"
 *         saldoInicial:
 *           type: number
 *           format: float
 *           description: Saldo inicial de la caja al abrir
 *           example: 1000.00
 *         saldoFinal:
 *           type: number
 *           format: float
 *           nullable: true
 *           description: Saldo final de la caja al cerrar (nulo si está abierta)
 *           example: 1500.00
 *         usuarioId:
 *           type: integer
 *           description: ID del usuario que abrió la caja
 *           example: 1
 *         observaciones:
 *           type: string
 *           nullable: true
 *           description: Observaciones adicionales sobre la caja
 *           example: "Apertura de caja inicial del día"
 *         estado:
 *           type: string
 *           enum: [ABIERTA, CERRADA, EN_PROCESO_CIERRE]
 *           description: Estado actual de la caja
 *           example: "ABIERTA"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de creación del registro
 *           example: "2023-01-01T08:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de la última actualización del registro
 *           example: "2023-01-01T20:00:00.000Z"
 *         Sucursal:
 *           type: object
 *           description: Información de la sucursal asociada (incluida en relaciones)
 *           properties:
 *             id:
 *               type: integer
 *               example: 1
 *             nombre:
 *               type: string
 *               example: "Sucursal Principal"
 *         Usuario:
 *           type: object
 *           description: Información del usuario que abrió la caja (incluida en relaciones)
 *           properties:
 *             id:
 *               type: integer
 *               example: 1
 *             nombre:
 *               type: string
 *               example: "Juan"
 *             apellido:
 *               type: string
 *               example: "Pérez"
 *       required:
 *         - sucursalId
 *         - saldoInicial
 *         - usuarioId
 *         - estado
 */



const Caja = sequelize.define('Caja', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sucursalId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Sucursal',
      key: 'id'
    }, 
    onDelete: 'SET NULL',  
    onUpdate: 'CASCADE'    
  },
  fechaApertura: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  fechaCierre: {
    type: DataTypes.DATE,
    allowNull: true
  },
  saldoInicial: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  saldoFinal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
   usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Usuarios',
      key: 'id'
    }
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  estado: {
    type: DataTypes.ENUM('ABIERTA', 'CERRADA', 'EN_PROCESO_CIERRE'),
    allowNull: false,
    defaultValue: 'ABIERTA'
  }
}, {
  timestamps: true,
  tableName: 'Cajas',
  freezeTableName: true,
  indexes: [
    {
     
      fields: ['sucursalId', 'estado'],
      where: {
        estado: 'ABIERTA'
      },
      name: 'caja_abierta_por_sucursal'
    }
  ]
});

module.exports = Caja;