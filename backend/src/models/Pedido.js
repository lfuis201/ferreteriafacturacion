const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pedido = sequelize.define('Pedido', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  clienteId: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'Clientes', key: 'id' } },
  usuarioId: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'Usuarios', key: 'id' } },
  sucursalId: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'Sucursal', key: 'id' } },
  fechaEmision: { type: DataTypes.DATEONLY, allowNull: true },
  fechaVencimiento: { type: DataTypes.DATEONLY, allowNull: true },
  fechaEntrega: { type: DataTypes.DATEONLY, allowNull: true },
  direccionEnvio: { type: DataTypes.TEXT, allowNull: true },
  vendedor: { type: DataTypes.STRING(100), allowNull: true },
  condicionPago: { type: DataTypes.STRING(50), allowNull: true },
  observacion: { type: DataTypes.TEXT, allowNull: true },
  terminoPago: { type: DataTypes.STRING(100), allowNull: true, defaultValue: 'Contado' },
  moneda: { type: DataTypes.STRING(20), allowNull: true, defaultValue: 'Soles' },
  tipoCambio: { type: DataTypes.STRING(10), allowNull: true },
  empresaTransporte: { type: DataTypes.STRING(200), allowNull: true },
  numeroPedido: { type: DataTypes.STRING(50), allowNull: true, unique: true },
  comprobantes: { type: DataTypes.STRING(50), allowNull: true, defaultValue: '0' },
  notasDeVenta: { type: DataTypes.STRING(50), allowNull: true, defaultValue: '0' },
  cotizacion: { type: DataTypes.STRING(50), allowNull: true },
  guias: { type: DataTypes.STRING(50), allowNull: true, defaultValue: '0' },
  tExportacion: { type: DataTypes.DECIMAL(10, 2), allowNull: true, defaultValue: 0 },
  tInafecto: { type: DataTypes.DECIMAL(10, 2), allowNull: true, defaultValue: 0 },
  tExonerado: { type: DataTypes.DECIMAL(10, 2), allowNull: true, defaultValue: 0 },
  tGravado: { type: DataTypes.DECIMAL(10, 2), allowNull: true, defaultValue: 0 },
  tIgv: { type: DataTypes.DECIMAL(10, 2), allowNull: true, defaultValue: 0 },
  total: { type: DataTypes.DECIMAL(10, 2), allowNull: true, defaultValue: 0 },
  estado: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'PENDIENTE' },
  pdfUrl: { type: DataTypes.STRING, allowNull: true }
}, {
  timestamps: true,
  tableName: 'Pedidos',
  freezeTableName: true
});

module.exports = Pedido;