const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * @swagger
 * components:
 *   schemas:
 *     CuentasPorCobrar:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la cuenta por cobrar
 *           example: 1
 *         clienteId:
 *           type: integer
 *           description: ID del cliente
 *           example: 1
 *         ventaId:
 *           type: integer
 *           description: ID de la venta que origina la deuda
 *           example: 1
 *         numeroDocumento:
 *           type: string
 *           description: Número del documento (factura, boleta)
 *           example: "F001-001"
 *         tipoDocumento:
 *           type: string
 *           enum: [FACTURA, BOLETA, NOTA_CREDITO, NOTA_DEBITO]
 *           description: Tipo de documento
 *           example: "FACTURA"
 *         fechaEmision:
 *           type: string
 *           format: date
 *           description: Fecha de emisión del documento
 *           example: "2024-01-15"
 *         fechaVencimiento:
 *           type: string
 *           format: date
 *           description: Fecha de vencimiento de la deuda
 *           example: "2024-02-15"
 *         montoOriginal:
 *           type: number
 *           format: float
 *           description: Monto original de la deuda
 *           example: 118.00
 *         montoPagado:
 *           type: number
 *           format: float
 *           description: Monto ya pagado
 *           example: 50.00
 *         montoPendiente:
 *           type: number
 *           format: float
 *           description: Monto pendiente de pago
 *           example: 68.00
 *         estado:
 *           type: string
 *           enum: [PENDIENTE, PAGADO_PARCIAL, PAGADO_TOTAL, VENCIDO]
 *           description: Estado de la cuenta por cobrar
 *           example: "PENDIENTE"
 *         diasVencido:
 *           type: integer
 *           description: Días de vencimiento (calculado)
 *           example: 0
 *         moneda:
 *           type: string
 *           enum: ['PEN', 'USD']
 *           description: Moneda de la deuda
 *           example: "PEN"
 *         observaciones:
 *           type: string
 *           nullable: true
 *           description: Observaciones adicionales
 *           example: "Cliente con historial de pagos puntuales"
 *         sucursalId:
 *           type: integer
 *           description: ID de la sucursal
 *           example: 1
 */

const CuentasPorCobrar = sequelize.define('CuentasPorCobrar', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  clienteId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Clientes',
      key: 'id'
    },
    comment: 'ID del cliente'
  },
  ventaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Ventas',
      key: 'id'
    },
    comment: 'ID de la venta que origina la deuda'
  },
  numeroDocumento: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'Número del documento'
  },
  tipoDocumento: {
    type: DataTypes.ENUM('FACTURA', 'BOLETA', 'NOTA_CREDITO', 'NOTA_DEBITO'),
    allowNull: false,
    comment: 'Tipo de documento'
  },
  fechaEmision: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Fecha de emisión del documento'
  },
  fechaVencimiento: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Fecha de vencimiento de la deuda'
  },
  montoOriginal: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    comment: 'Monto original de la deuda'
  },
  montoPagado: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Monto ya pagado'
  },
  montoPendiente: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    comment: 'Monto pendiente de pago'
  },
  estado: {
    type: DataTypes.ENUM('PENDIENTE', 'PAGADO_PARCIAL', 'PAGADO_TOTAL', 'VENCIDO'),
    allowNull: false,
    defaultValue: 'PENDIENTE',
    comment: 'Estado de la cuenta por cobrar'
  },
  diasVencido: {
    type: DataTypes.VIRTUAL,
    get() {
      const hoy = new Date();
      const fechaVenc = new Date(this.fechaVencimiento);
      const diferencia = Math.floor((hoy - fechaVenc) / (1000 * 60 * 60 * 24));
      return diferencia > 0 ? diferencia : 0;
    }
  },
  moneda: {
    type: DataTypes.ENUM('PEN', 'USD'),
    allowNull: false,
    defaultValue: 'PEN',
    comment: 'Moneda de la deuda'
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Observaciones adicionales'
  },
  sucursalId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Sucursal',
      key: 'id'
    },
    comment: 'ID de la sucursal'
  }
}, {
  timestamps: true,
  tableName: 'CuentasPorCobrar',
  freezeTableName: true,
  hooks: {
    beforeSave: (cuentaPorCobrar) => {
      // Actualizar estado basado en montos
      if (cuentaPorCobrar.montoPagado >= cuentaPorCobrar.montoOriginal) {
        cuentaPorCobrar.estado = 'PAGADO_TOTAL';
        cuentaPorCobrar.montoPendiente = 0;
      } else if (cuentaPorCobrar.montoPagado > 0) {
        cuentaPorCobrar.estado = 'PAGADO_PARCIAL';
        cuentaPorCobrar.montoPendiente = cuentaPorCobrar.montoOriginal - cuentaPorCobrar.montoPagado;
      } else {
        cuentaPorCobrar.montoPendiente = cuentaPorCobrar.montoOriginal;
        // Verificar si está vencido
        const hoy = new Date();
        const fechaVenc = new Date(cuentaPorCobrar.fechaVencimiento);
        if (hoy > fechaVenc) {
          cuentaPorCobrar.estado = 'VENCIDO';
        } else {
          cuentaPorCobrar.estado = 'PENDIENTE';
        }
      }
    }
  }
});

module.exports = CuentasPorCobrar;