const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

/**
 * @swagger
 * components:
 *   schemas:
 *     Remitente:
 *       type: object
 *       required:
 *         - tipoDocumento
 *         - numeroDocumento
 *         - nombre
 *       properties:
 *         id:
 *           type: integer
 *           description: ID del remitente
 *         tipoDocumento:
 *           type: string
 *           enum: ['Doc.trib.no.dom.sin.ruc','DNI','RUC','CE','PASAPORTE','OTRO','CARNE SOLIC REFUGIO','C.IDENT.-RREE','PTP','DOC.ID.EXTR.','CPP']
 *           description: Tipo de documento de identidad
 *         numeroDocumento:
 *           type: string
 *           description: Número de documento
 *         nombre:
 *           type: string
 *           description: Nombre completo o razón social
 *         telefono:
 *           type: string
 *           description: Teléfono de contacto
 *         direccion:
 *           type: string
 *           description: Dirección completa
 *         departamento:
 *           type: string
 *           description: Departamento del ubigeo
 *         provincia:
 *           type: string
 *           description: Provincia del ubigeo
 *         distrito:
 *           type: string
 *           description: Distrito del ubigeo
 *         ubigeo:
 *           type: string
 *           description: Código de ubigeo
 *         estado:
 *           type: boolean
 *           description: Estado activo/inactivo
 *         apellidoPaterno:
 *           type: string
 *           description: Apellido paterno (para DNI)
 *         apellidoMaterno:
 *           type: string
 *           description: Apellido materno (para DNI)
 *         nombres:
 *           type: string
 *           description: Nombres (para DNI)
 *         razonSocial:
 *           type: string
 *           description: Razón social (para RUC)
 *         nombreComercial:
 *           type: string
 *           description: Nombre comercial (para RUC)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de actualización
 *       example:
 *         id: 1
 *         tipoDocumento: "RUC"
 *         numeroDocumento: "20123456789"
 *         nombre: "EMPRESA REMITENTE SAC"
 *         telefono: "987654321"
 *         direccion: "Av. Principal 123, Lima, Lima, Lima"
 *         departamento: "LIMA"
 *         provincia: "LIMA"
 *         distrito: "LIMA"
 *         ubigeo: "150101"
 *         estado: true
 */
const Remitente = sequelize.define(
  "Remitente",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tipoDocumento: {
      type: DataTypes.ENUM(
        'Doc.trib.no.dom.sin.ruc',
        'DNI',
        'RUC',
        'CE',
        'PASAPORTE',
        'OTRO',
        'CARNE SOLIC REFUGIO',
        'C.IDENT.-RREE',
        'PTP',
        'DOC.ID.EXTR.',
        'CPP'
      ),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "El tipo de documento es requerido",
        },
      },
    },
    numeroDocumento: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "El número de documento es requerido",
        },
        len: {
          args: [1, 20],
          msg: "El número de documento debe tener entre 1 y 20 caracteres",
        },
      },
    },
    nombre: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "El nombre es requerido",
        },
        len: {
          args: [1, 255],
          msg: "El nombre debe tener entre 1 y 255 caracteres",
        },
      },
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        len: {
          args: [0, 20],
          msg: "El teléfono debe tener máximo 20 caracteres",
        },
      },
    },
    direccion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    departamento: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    provincia: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    distrito: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    ubigeo: {
      type: DataTypes.STRING(6),
      allowNull: true,
      validate: {
        len: {
          args: [0, 6],
          msg: "El ubigeo debe tener máximo 6 caracteres",
        },
      },
    },
    estado: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    // Campos adicionales para datos de RENIEC (DNI)
    apellidoPaterno: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    apellidoMaterno: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    nombres: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    // Campos adicionales para datos de SUNAT (RUC)
    razonSocial: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    nombreComercial: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: "remitentes",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["tipoDocumento", "numeroDocumento"],
        name: "unique_remitente_documento",
      },
      {
        fields: ["nombre"],
        name: "idx_remitente_nombre",
      },
      {
        fields: ["estado"],
        name: "idx_remitente_estado",
      },
    ],
  }
);

module.exports = Remitente;