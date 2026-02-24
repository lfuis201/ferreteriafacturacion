const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Modelo de Producto Compuesto (Pack/Promoción)
const ProductoCompuesto = sequelize.define('ProductoCompuesto', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nombreSecundario: {
    type: DataTypes.STRING,
    allowNull: true
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  modelo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  unidad: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Unidad'
  },
  moneda: {
    type: DataTypes.ENUM('Soles', 'Dólares'),
    allowNull: false,
    defaultValue: 'Soles'
  },
  precioUnitarioVenta: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0
  },
  plataforma: {
    type: DataTypes.STRING,
    allowNull: true
  },
  almacen: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Texto descriptivo de sucursal/almacén seleccionado desde UI'
  },
  imagen: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Base64 o URL de imagen'
  },
  tipoAfectacion: {
    type: DataTypes.STRING,
    allowNull: true
  },
  codigoSunat: {
    type: DataTypes.STRING,
    allowNull: true
  },
  codigoInterno: {
    type: DataTypes.STRING,
    allowNull: true
  },
  totalPCompra: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    defaultValue: 0
  },
  precioUnitarioCompra: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0
  },
  categoriaId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'Categorias', key: 'id' },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  },
  marca: {
    type: DataTypes.STRING,
    allowNull: true
  },
  sucursalId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'Sucursales', key: 'id' },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  },
  estado: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true,
  tableName: 'ProductosCompuestos',
  freezeTableName: true
});

module.exports = ProductoCompuesto;