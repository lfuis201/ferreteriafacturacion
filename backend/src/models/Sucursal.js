const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); 











/**
 * @swagger
 * components:
 *   schemas:
 *     Sucursal:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           format: int32
 *           description: Identificador único de la sucursal
 *           example: 1
 *         nombre:
 *           type: string
 *           description: Nombre de la sucursal
 *           example: "Sucursal Principal"
 *         ubicacion:
 *           type: string
 *           description: Dirección física de la sucursal
 *           example: "Av. Principal 123"
 *         telefono:
 *           type: string
 *           description: Número de teléfono de la sucursal
 *           example: "987654321"
 *         email:
 *           type: string
 *           format: email
 *           description: Correo electrónico de la sucursal
 *           example: "sucursal@empresa.com"
 *         estado:
 *           type: boolean
 *           description: Estado de la sucursal (activo/inactivo)
 *           example: true
 *         ruc:
 *           type: string
 *           pattern: '^[0-9]{11}$'
 *           description: RUC de la sucursal (11 dígitos)
 *           example: "20604051984"
 *         razonSocial:
 *           type: string
 *           description: Razón social de la empresa
 *           example: "FACTURACION ELECTRONICA MONSTRUO E.I.R.L."
 *         nombreComercial:
 *           type: string
 *           description: Nombre comercial de la empresa
 *           example: "Monstruo Facturación"
 *         direccion:
 *           type: string
 *           description: Dirección completa de la empresa
 *           example: "Av. Principal 123"
 *         ubigeo:
 *           type: string
 *           pattern: '^[0-9]{6}$'
 *           description: Código UBIGEO (6 dígitos)
 *           example: "150114"
 *         urbanizacion:
 *           type: string
 *           description: Nombre de la urbanización
 *           example: "Urbanización Principal"
 *         distrito:
 *           type: string
 *           description: Distrito de la sucursal
 *           example: "LA MOLINA"
 *         provincia:
 *           type: string
 *           description: Provincia de la sucursal
 *           example: "LIMA"
 *         departamento:
 *           type: string
 *           description: Departamento de la sucursal
 *           example: "LIMA"
 *       required:
 *         - nombre
 *         - ubicacion
 *         - razonSocial
 *         - nombreComercial
 *         - direccion
 *         - ubigeo
 *         - urbanizacion
 *         - distrito
 *         - provincia
 *         - departamento
 */






const Sucursal = sequelize.define('Sucursal', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ubicacion: {
    type: DataTypes.STRING,
    allowNull: false
  },
  telefono: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  estado: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  // Campos adicionales para SUNAT
  ruc: {
    type: DataTypes.STRING(11),
    allowNull: true,
    validate: {
      isValidRuc(value) {
        if (value !== null && value !== undefined && value !== '') {
          if (!/^[0-9]{11}$/.test(value)) {
            throw new Error('El RUC debe tener exactamente 11 dígitos numéricos');
          }
        }
      }
    }
  },
  razonSocial: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nombreComercial: {
    type: DataTypes.STRING,
    allowNull: false
  },
  direccion: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ubigeo: {
    type: DataTypes.STRING(6),
    allowNull: false,
    validate: {
      is: /^[0-9]{6}$/i // Validación para código UBIGEO (6 dígitos)
    }
  },
  urbanizacion: {
    type: DataTypes.STRING,
    allowNull: false
  },
  distrito: {
    type: DataTypes.STRING,
    allowNull: false
  },
  provincia: {
    type: DataTypes.STRING,
    allowNull: false
  },
  departamento: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: true,
  tableName: 'Sucursales',
  freezeTableName: true
});

module.exports = Sucursal;