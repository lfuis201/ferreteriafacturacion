const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modelo Servicio para separar la gestión de servicios de los productos.
 * No maneja inventario ni presentaciones.
 */
const Servicio = sequelize.define('Servicio', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  codigo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  precioVenta: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  unidadMedida: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'ZZ',
    comment: 'Unidad de servicio (ZZ según SUNAT)'
  },
  tieneIgv: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  tipodeAfectacion: {
    type: DataTypes.ENUM(
      'Gravado_Operación_Onerosa',
      'Gravado_Retiro_por_premio',
      'Gravado_Retiro_por_donación',
      'Gravado_Retiro',
      'Gravado_Retiro_por_publicidad',
      'Gravado_Bonificaciones',
      'Gravado_Retiro_por_entrega_a_trabajadores',
      'Exonerado_Operación_Onerosa',
      'Exonerado_Retiro',
      'Inafecto_Operación_Onerosa',
      'Inafecto_Retiro_por_Bonificación',
      'Inafecto_Retiro',
      'Exonerado_Transferencia_Gratuita'
    ),
    allowNull: true
  },
  codigosunat: {
    type: DataTypes.STRING,
    allowNull: true
  },
  modelo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  marca: {
    type: DataTypes.STRING,
    allowNull: true
  },
  categoriaId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  sucursalId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Sucursal donde se ofrece el servicio'
  },
  estado: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true,
  tableName: 'Servicios',
  freezeTableName: true
});

module.exports = Servicio;