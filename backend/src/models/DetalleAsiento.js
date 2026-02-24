const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * @swagger
 * components:
 *   schemas:
 *     DetalleAsiento:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del detalle del asiento
 *           example: 1
 *         asientoContableId:
 *           type: integer
 *           description: ID del asiento contable al que pertenece
 *           example: 1
 *         planCuentasId:
 *           type: integer
 *           description: ID de la cuenta contable
 *           example: 1
 *         orden:
 *           type: integer
 *           description: Orden del detalle dentro del asiento
 *           example: 1
 *         glosa:
 *           type: string
 *           description: Descripción específica del movimiento
 *           example: "Venta de mercadería"
 *         debe:
 *           type: number
 *           format: float
 *           description: Monto del debe (débito)
 *           example: 118.00
 *         haber:
 *           type: number
 *           format: float
 *           description: Monto del haber (crédito)
 *           example: 0.00
 *         centroCosto:
 *           type: string
 *           nullable: true
 *           description: Centro de costo (si aplica)
 *           example: "VENTAS"
 *         documentoReferencia:
 *           type: string
 *           nullable: true
 *           description: Documento de referencia específico
 *           example: "F001-001"
 *         fechaVencimiento:
 *           type: string
 *           format: date
 *           nullable: true
 *           description: Fecha de vencimiento (para cuentas por cobrar/pagar)
 *           example: "2024-02-15"
 *         clienteId:
 *           type: integer
 *           nullable: true
 *           description: ID del cliente (para cuentas por cobrar)
 *           example: 1
 *         proveedorId:
 *           type: integer
 *           nullable: true
 *           description: ID del proveedor (para cuentas por pagar)
 *           example: null
 *         moneda:
 *           type: string
 *           enum: ['PEN', 'USD']
 *           description: Moneda del movimiento
 *           example: "PEN"
 *         tipoCambio:
 *           type: number
 *           format: float
 *           nullable: true
 *           description: Tipo de cambio (si la moneda es diferente a PEN)
 *           example: null
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 */

const DetalleAsiento = sequelize.define('DetalleAsiento', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  asientoContableId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'AsientosContables',
      key: 'id'
    },
    comment: 'ID del asiento contable'
  },
  planCuentasId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'PlanCuentas',
      key: 'id'
    },
    comment: 'ID de la cuenta contable'
  },
  orden: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Orden del detalle dentro del asiento'
  },
  glosa: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Descripción específica del movimiento'
  },
  debe: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Monto del debe (débito)'
  },
  haber: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Monto del haber (crédito)'
  },
  centroCosto: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Centro de costo'
  },
  documentoReferencia: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Documento de referencia específico'
  },
  fechaVencimiento: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Fecha de vencimiento para cuentas por cobrar/pagar'
  },
  clienteId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Clientes',
      key: 'id'
    },
    comment: 'ID del cliente para cuentas por cobrar'
  },
  proveedorId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Proveedores',
      key: 'id'
    },
    comment: 'ID del proveedor para cuentas por pagar'
  },
  moneda: {
    type: DataTypes.ENUM('PEN', 'USD'),
    allowNull: false,
    defaultValue: 'PEN',
    comment: 'Moneda del movimiento'
  },
  tipoCambio: {
    type: DataTypes.DECIMAL(8, 4),
    allowNull: true,
    comment: 'Tipo de cambio si la moneda es diferente a PEN'
  }
}, {
  timestamps: true,
  tableName: 'DetallesAsientos',
  freezeTableName: true,
  indexes: [
    {
      fields: ['asientoContableId']
    },
    {
      fields: ['planCuentasId']
    },
    {
      fields: ['clienteId']
    },
    {
      fields: ['proveedorId']
    },
    {
      fields: ['fechaVencimiento']
    }
  ],
  validate: {
    // Validación para asegurar que no se registre tanto debe como haber en la misma línea
    debeOHaber() {
      if (this.debe > 0 && this.haber > 0) {
        throw new Error('No se puede registrar tanto debe como haber en la misma línea');
      }
      if (this.debe === 0 && this.haber === 0) {
        throw new Error('Debe registrar un monto en debe o haber');
      }
    }
  }
});

module.exports = DetalleAsiento;