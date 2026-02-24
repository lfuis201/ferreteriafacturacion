 
/**
 * @swagger
 * components:
 *   schemas:
 *     GuiaRemision:
 *       type: object
 *       required:
 *         - usuarioId
 *         - sucursalId
 *         - serieComprobante
 *         - numeroComprobante
 *         - fechaSalida
 *         - puntoPartida
 *         - puntoLlegada
 *         - motivoTraslado
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la guía de remisión
 *           example: 1
 *         clienteId:
 *           type: integer
 *           description: ID del cliente (opcional)
 *           example: 1
 *         usuarioId:
 *           type: integer
 *           description: ID del usuario que crea la guía
 *           example: 1
 *         sucursalId:
 *           type: integer
 *           description: ID de la sucursal
 *           example: 1
 *         serieComprobante:
 *           type: string
 *           description: Serie del comprobante
 *           example: "GR-1"
 *         numeroComprobante:
 *           type: string
 *           description: Número del comprobante
 *           example: "000001"
 *         fechaSalida:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de salida
 *           example: "2024-01-15T10:30:00Z"
 *         puntoPartida:
 *           type: string
 *           description: Punto de partida del traslado
 *           example: "Almacén Central - Lima"
 *         puntoLlegada:
 *           type: string
 *           description: Punto de llegada del traslado
 *           example: "Cliente - Callao"
 *         motivoTraslado:
 *           type: string
 *           description: Motivo del traslado
 *           example: "Venta"
 *         nroPlaca:
 *           type: string
 *           description: Número de placa del vehículo
 *           example: "ABC-123"
 *         conductor:
 *           type: string
 *           description: Nombre del conductor
 *           example: "Juan Pérez"
 *         dniConductor:
 *           type: string
 *           description: DNI del conductor
 *           example: "12345678"
 *         estado:
           type: string
           enum: [Pendiente, En tránsito, Entregado, Anulado]
           description: Estado de la guía de remisión
           example: "Pendiente"
 *         ventaId:
 *           type: integer
 *           description: ID de la venta relacionada (opcional)
 *           example: 1
 *         observacion:
 *           type: string
 *           description: Observaciones adicionales
 *           example: "Entrega en horario de oficina"
 *         tipoTransporte:
 *           type: string
 *           enum: [privado, publico]
 *           description: Tipo de transporte utilizado
 *           example: "privado"
 *         marca:
 *           type: string
 *           description: Marca del vehículo (para transporte privado)
 *           example: "Toyota"
 *         modelo:
 *           type: string
 *           description: Modelo del vehículo (para transporte privado)
 *           example: "Hilux"
 *         rutaVehiculo:
 *           type: string
 *           description: Ruta autorizada del vehículo (para transporte público)
 *           example: "Lima-Callao"
 *         direccionFiscal:
 *           type: string
 *           description: Dirección fiscal del transportista (para transporte público)
 *           example: "Av. Principal 123, Lima"
 *         codigoMTC:
 *           type: string
 *           description: Código MTC del transportista (para transporte público)
 *           example: "MTC-12345"
 *         vehiculoM1L:
 *           type: boolean
 *           description: Indica si el vehículo es de categoría M1 o L
 *           example: false
 *         rucTransportista:
 *           type: string
 *           description: RUC del transportista (obligatorio para transporte público)
 *           example: "20123456789"
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

const GuiaRemision = sequelize.define('GuiaRemision', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  clienteId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Clientes',
      key: 'id'
    }
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Usuarios',
      key: 'id'
    }
  },
  sucursalId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Sucursal',
      key: 'id'
    }
  },
  serieComprobante: {
    type: DataTypes.STRING,
    allowNull: false
  },
  numeroComprobante: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fechaSalida: {
    type: DataTypes.DATE,
    allowNull: false
  },
  puntoPartida: {
    type: DataTypes.STRING,
    allowNull: false
  },
  codigoUbigeoPartida: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Código de ubigeo del punto de partida'
  },
  puntoLlegada: {
    type: DataTypes.STRING,
    allowNull: false
  },
  codigoUbigeoLlegada: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Código de ubigeo del punto de llegada'
  },
  motivoTraslado: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nroPlaca: {
    type: DataTypes.STRING,
    allowNull: true
  },
  conductor: {
    type: DataTypes.STRING,
    allowNull: true
  },
  dniConductor: {
    type: DataTypes.STRING,
    allowNull: true
  },
  estado: {
    type: DataTypes.ENUM('Pendiente', 'En tránsito', 'Entregado', 'Anulado', 'emitida'),
    allowNull: false,
    defaultValue: 'Pendiente'
  },
  ventaId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Ventas',
      key: 'id'
    },
    comment: 'Referencia a la venta relacionada (si existe)'
  },
  observacion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tipoTransporte: {
    type: DataTypes.ENUM('privado', 'publico'),
    allowNull: true,
    defaultValue: 'privado'
  },
  marca: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Marca del vehículo (para transporte privado)'
  },
  modelo: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Modelo del vehículo (para transporte privado)'
  },
  rutaVehiculo: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Ruta autorizada del vehículo (para transporte público)'
  },
  direccionFiscal: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Dirección fiscal del transportista (para transporte público)'
  },
  codigoMTC: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Código MTC del transportista (para transporte público)'
  },
  vehiculoM1L: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
    comment: 'Indica si el vehículo es de categoría M1 o L (permite omitir conductor y placa en transporte privado)'
  },
  rucTransportista: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'RUC del transportista (obligatorio para transporte público)'
  }
}, {
  timestamps: true, 
  tableName: 'GuiaRemisions',
  freezeTableName: true
});

module.exports = GuiaRemision;