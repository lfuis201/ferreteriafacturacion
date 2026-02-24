const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

/**
 * @swagger
 * components:
 *   schemas:
 *     PagadorFlete:
 *       type: object
 *       required:
 *         - tipoDocumento
 *         - numeroDocumento
 *         - nombre
 *       properties:
 *         id:
 *           type: integer
 *           description: ID del pagador de flete
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
 *         nombre: "EMPRESA TRANSPORTES SAC"
 *         telefono: "987654321"
 *         direccion: "Av. Principal 123, Lima, Lima, Lima"
 *         departamento: "LIMA"
 *         provincia: "LIMA"
 *         distrito: "LIMA"
 *         ubigeo: "150101"
 *         estado: true
 */
const PagadorFlete = sequelize.define(
  "PagadorFlete",
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
    },
    numeroDocumento: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        name: 'unique_documento_pagador_flete',
        msg: 'Ya existe un pagador de flete con este número de documento'
      },
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    telefono: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    direccion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Campos de ubigeo
    departamento: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    provincia: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    distrito: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ubigeo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    estado: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    // Campos adicionales para datos de RENIEC/SUNAT
    apellidoPaterno: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    apellidoMaterno: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nombres: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    razonSocial: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nombreComercial: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "PagadoresFlete",
    freezeTableName: true,
    indexes: [
      {
        unique: true,
        fields: ["tipoDocumento", "numeroDocumento"],
        name: "idx_pagador_flete_documento",
      },
      {
        fields: ["estado"],
        name: "idx_pagador_flete_estado",
      },
      {
        fields: ["nombre"],
        name: "idx_pagador_flete_nombre",
      },
    ],
  }
);

module.exports = PagadorFlete;