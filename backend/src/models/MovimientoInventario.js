const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');










/**
 * @swagger
 * components:
 *   schemas:
 *     MovimientoInventario:
 *       type: object
 *       required:
 *         - productoId
 *         - sucursalOrigenId
 *         - tipoMovimiento
 *         - cantidad
 *         - usuarioId
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del movimiento de inventario
 *           example: 1
 *         productoId:
 *           type: integer
 *           description: ID del producto afectado
 *           example: 5
 *         sucursalOrigenId:
 *           type: integer
 *           description: ID de la sucursal de origen (para salidas o traslados)
 *           example: 1
 *         sucursalDestinoId:
 *           type: integer
 *           description: ID de la sucursal de destino (solo para traslados)
 *           example: 2
 *         tipoMovimiento:
 *           type: string
 *           enum: [ENTRADA, SALIDA, TRASLADO, AJUSTE]
 *           description: Tipo de movimiento de inventario
 *           example: ENTRADA
 *         cantidad:
           type: integer
           description: Cantidad de productos afectados
           example: 10
         stock:
           type: integer
           description: Stock actual después del movimiento
           example: 55
         precioUnitario:
 *           type: number
 *           format: float
 *           description: Precio unitario en el momento del movimiento
 *           example: 15.99
 *         documentoRelacionadoTipo:
 *           type: string
 *           description: Tipo de documento relacionado (COMPRA, VENTA, TRASLADO, AJUSTE)
 *           example: COMPRA
 *         documentoRelacionadoId:
 *           type: integer
 *           description: ID del documento relacionado
 *           example: 123
 *         usuarioId:
 *           type: integer
 *           description: ID del usuario que realizó el movimiento
 *           example: 95
 *         observacion:
 *           type: string
 *           description: Observaciones adicionales sobre el movimiento
 *           example: Ajuste manual de inventario
 *         comentarios:
 *           type: string
 *           description: Comentarios adicionales sobre el movimiento
 *           example: Producto dañado durante transporte
 *         fechaRegistro:
 *           type: string
 *           format: date-time
 *           description: Fecha específica de registro del movimiento
 *           example: 2023-01-15T10:30:00Z
 *         referenciaId:
 *           type: integer
 *           description: ID de la referencia de inventario asociada
 *           example: 5
 *         autorizado:
 *           type: boolean
 *           description: Indica si el movimiento fue autorizado (para traslados)
 *           example: true
 *         autorizadoPorId:
 *           type: integer
 *           description: ID del usuario que autorizó el movimiento
 *           example: 1
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de creación del registro
 *           example: 2023-01-01T00:00:00Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de última actualización del registro
 *           example: 2023-01-01T00:00:00Z
 *       example:
 *         id: 1
 *         productoId: 5
 *         sucursalOrigenId: 1
 *         sucursalDestinoId: null
 *         tipoMovimiento: ENTRADA
 *         cantidad: 10
 *         
 *         precioUnitario: 15.99
 *         documentoRelacionadoTipo: COMPRA
 *         documentoRelacionadoId: 123
 *         usuarioId: 95
 *         observacion: Ajuste manual de inventario
 *         comentarios: Producto dañado durante transporte
 *         fechaRegistro: 2023-01-15T10:30:00Z
 *         referenciaId: 5
 *         autorizado: true
 *         autorizadoPorId: 1
 *         createdAt: 2023-01-01T00:00:00Z
 *         updatedAt: 2023-01-01T00:00:00Z
 */







const MovimientoInventario = sequelize.define('MovimientoInventario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  productoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Productos',
      key: 'id'
    }
  },
  sucursalOrigenId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Sucursal',
      key: 'id'
    }
  },
  sucursalDestinoId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Cambiado de false a true para permitir null en movimientos que no son traslados
    references: {
      model: 'Sucursal',
      key: 'id'
    },
    comment: 'ID de la sucursal de destino (solo requerido para traslados)'
  },
  tipoMovimiento: {
    type: DataTypes.ENUM('ENTRADA', 'SALIDA', 'TRASLADO', 'AJUSTE'),
    allowNull: false
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Stock actual después del movimiento'
  },
  precioUnitario: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  documentoRelacionadoTipo: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Tipo de documento: COMPRA, VENTA, TRASLADO, AJUSTE'
  },
  documentoRelacionadoId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID del documento relacionado'
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Usuarios',
      key: 'id'
    }
  },
  observacion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  comentarios: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Comentarios adicionales sobre el movimiento'
  },
  fechaRegistro: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha específica de registro del movimiento'
  },
  referenciaId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'ReferenciasInventario',
      key: 'id'
    },
    comment: 'Referencia de inventario asociada al movimiento'
  },
  autorizado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Indica si el movimiento fue autorizado (para traslados)'
  },
  autorizadoPorId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Usuarios',
      key: 'id'
    }
  }
}, {
  timestamps: true,
  tableName: 'MovimientoInventarios',
  freezeTableName: true
});

module.exports = MovimientoInventario;