const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * @swagger
 * components:
 *   schemas:
 *     Proveedor:
 *       type: object
 *       required:
 *         - nombre
 *         - tipoDocumento
 *         - numeroDocumento
 *       properties:
 *         id:
 *           type: integer
 *           description: ID del proveedor
 *         nombre:
 *           type: string
 *           description: Nombre del proveedor
 *         tipoDocumento:
 *           type: string
 *           enum: ["Doc.trib.no.dom.sin.ruc", "DNI", "RUC", "CE", "PASAPORTE", "OTRO", "CARNE SOLIC REFUGIO", "C.IDENT.-RREE", "PTP", "DOC.ID.EXTR.", "CPP"]
 *           description: Tipo de documento del proveedor
 *         numeroDocumento:
 *           type: string
 *           description: Número de documento del proveedor
 *         direccion:
 *           type: string
 *           description: Dirección del proveedor
 *         telefono:
 *           type: string
 *           description: Teléfono del proveedor
 *         email:
 *           type: string
 *           format: email
 *           description: Email del proveedor
 *         contacto:
 *           type: string
 *           description: Nombre de la persona de contacto
 *         estado:
 *           type: boolean
 *           description: Estado del proveedor
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación del proveedor
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de actualización del proveedor
 *       example:
 *         id: 1
 *         nombre: Proveedor Ejemplo
 *         tipoDocumento: RUC
 *         numeroDocumento: 12345678901
 *         direccion: Av. Principal 123
 *         telefono: 987654321
 *         email: proveedor@example.com
 *         contacto: Juan Pérez
 *         estado: true
 */
const Proveedor = sequelize.define('Proveedor', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tipoDocumento: {
      type: DataTypes.ENUM(
        "Doc.trib.no.dom.sin.ruc",
        "DNI",
        "RUC",
        "CE",
        "PASAPORTE",
        "OTRO",
        "CARNE SOLIC REFUGIO",
        "C.IDENT.-RREE",
        "PTP",
        "DOC.ID.EXTR.",
        "CPP"
      ),
      allowNull: false,
    },
  numeroDocumento: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  direccion: {
    type: DataTypes.STRING,
    allowNull: true
  },
  telefono: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  contacto: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Nombre de la persona de contacto'
  },
  estado: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true,
  tableName: 'Proveedores',
  freezeTableName: true
});

module.exports = Proveedor;