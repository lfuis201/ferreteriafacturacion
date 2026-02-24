const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

/**
 * @swagger
 * components:
 *   schemas:
 *     Transportista:
 *       type: object
 *       required:
 *         - tipoDocumento
 *         - numeroDocumento
 *         - razonSocial
 *       properties:
 *         id:
 *           type: integer
 *           description: ID del transportista
 *         tipoDocumento:
 *           type: string
 *           enum: ['Doc.trib.no.dom.sin.ruc','DNI','RUC','CE','PASAPORTE','OTRO','CARNE SOLIC REFUGIO','C.IDENT.-RREE','PTP','DOC.ID.EXTR.','CPP']
 *           description: Tipo de documento de identidad
 *         numeroDocumento:
 *           type: string
 *           description: Número de documento
 *         razonSocial:
 *           type: string
 *           description: Razón social o nombre comercial
 *         nombreComercial:
 *           type: string
 *           description: Nombre comercial
 *         direccionFiscal:
 *           type: string
 *           description: Dirección fiscal
 *         telefono:
 *           type: string
 *           description: Teléfono de contacto
 *         email:
 *           type: string
 *           description: Correo electrónico
 *         mtc:
 *           type: string
 *           description: Número MTC
 *         autorizacionMTC:
 *           type: string
 *           description: Autorización MTC
 *         tipoTransportista:
 *           type: string
 *           enum: ['Empresa de transporte', 'Transportista independiente']
 *           description: Tipo de transportista
 *         estado:
 *           type: boolean
 *           description: Estado activo/inactivo
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de actualización
 */

const Transportista = sequelize.define(
  "Transportista",
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
        name: 'unique_documento_transportista',
        msg: 'Ya existe un transportista con este número de documento'
      },
    },
    razonSocial: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'La razón social es requerida'
        }
      }
    },
    nombreComercial: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    direccionFiscal: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    telefono: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: {
          msg: 'Debe ser un email válido'
        }
      }
    },
    mtc: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    autorizacionMTC: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tipoTransportista: {
      type: DataTypes.ENUM(
        'Empresa de transporte',
        'Transportista independiente'
      ),
      allowNull: false,
      defaultValue: 'Empresa de transporte'
    },
    estado: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "transportistas",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['tipoDocumento', 'numeroDocumento'],
        name: 'unique_tipo_numero_documento_transportista'
      },
      {
        fields: ['estado'],
        name: 'idx_transportista_estado'
      },
      {
        fields: ['razonSocial'],
        name: 'idx_transportista_razon_social'
      },
      {
        fields: ['tipoTransportista'],
        name: 'idx_transportista_tipo'
      }
    ],
    validate: {
      // Validación para RUC
      rucValido() {
        if (this.tipoDocumento === 'RUC' && this.numeroDocumento) {
          if (!/^\d{11}$/.test(this.numeroDocumento)) {
            throw new Error('El RUC debe tener 11 dígitos');
          }
        }
      },
      // Validación para DNI
      dniValido() {
        if (this.tipoDocumento === 'DNI' && this.numeroDocumento) {
          if (!/^\d{8}$/.test(this.numeroDocumento)) {
            throw new Error('El DNI debe tener 8 dígitos');
          }
        }
      },
    },
    hooks: {
      beforeCreate: (transportista, options) => {
        if (transportista.numeroDocumento) {
          transportista.numeroDocumento = transportista.numeroDocumento.trim();
        }
        if (transportista.razonSocial) {
          transportista.razonSocial = transportista.razonSocial.trim();
        }
        if (transportista.nombreComercial) {
          transportista.nombreComercial = transportista.nombreComercial.trim();
        }
        if (transportista.email) {
          transportista.email = transportista.email.toLowerCase().trim();
        }
      },
      beforeUpdate: (transportista, options) => {
        if (transportista.numeroDocumento) {
          transportista.numeroDocumento = transportista.numeroDocumento.trim();
        }
        if (transportista.razonSocial) {
          transportista.razonSocial = transportista.razonSocial.trim();
        }
        if (transportista.nombreComercial) {
          transportista.nombreComercial = transportista.nombreComercial.trim();
        }
        if (transportista.email) {
          transportista.email = transportista.email.toLowerCase().trim();
        }
      }
    }
  }
);

// Métodos de instancia
Transportista.prototype.getNombreCompleto = function() {
  return this.nombreComercial || this.razonSocial;
};

Transportista.prototype.esEmpresa = function() {
  return this.tipoTransportista === 'Empresa de transporte';
};

Transportista.prototype.esIndependiente = function() {
  return this.tipoTransportista === 'Transportista independiente';
};

// Métodos estáticos
Transportista.buscarPorTipo = function(tipo) {
  return this.findAll({
    where: {
      tipoTransportista: tipo,
      estado: true
    },
    order: [['razonSocial', 'ASC']]
  });
};

Transportista.buscarPorDocumento = function(tipoDocumento, numeroDocumento) {
  return this.findOne({
    where: {
      tipoDocumento: tipoDocumento,
      numeroDocumento: numeroDocumento,
      estado: true
    }
  });
};

module.exports = Transportista;