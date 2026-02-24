const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

/**
 * @swagger
 * components:
 *   schemas:
 *     Conductor:
 *       type: object
 *       required:
 *         - tipoDocumento
 *         - numeroDocumento
 *         - nombre
 *         - modoTraslado
 *       properties:
 *         id:
 *           type: integer
 *           description: ID del conductor
 *         tipoDocumento:
 *           type: string
 *           enum: ['Doc.trib.no.dom.sin.ruc','DNI','RUC','CE','PASAPORTE','OTRO','CARNE SOLIC REFUGIO','C.IDENT.-RREE','PTP','DOC.ID.EXTR.','CPP']
 *           description: Tipo de documento de identidad
 *         numeroDocumento:
 *           type: string
 *           description: Número de documento
 *         nombre:
 *           type: string
 *           description: Nombre completo
 *         direccionFiscal:
 *           type: string
 *           description: Dirección fiscal (solo transporte público)
 *         mtc:
 *           type: string
 *           description: Número MTC (solo transporte público)
 *         telefono:
 *           type: string
 *           description: Teléfono (solo transporte privado)
 *         licencia:
 *           type: string
 *           description: Número de licencia de conducir
 *         modoTraslado:
 *           type: string
 *           enum: ['Transporte privado', 'Transporte público']
 *           description: Modo de traslado
 *         nroPlaca:
 *           type: string
 *           description: Número de placa del vehículo
 *         tuc:
 *           type: string
 *           description: T.U.C del vehículo
 *         autorizacionMTC:
 *           type: string
 *           description: Autorización MTC de placa principal
 *         nroPlacaSecundaria:
 *           type: string
 *           description: Número de placa secundaria
 *         tucSecundaria:
 *           type: string
 *           description: T.U.C de placa secundaria
 *         autorizacionMTCSecundaria:
 *           type: string
 *           description: Autorización MTC de placa secundaria
 *         modeloVehiculo:
 *           type: string
 *           description: Modelo del vehículo
 *         marcaVehiculo:
 *           type: string
 *           description: Marca del vehículo
 *         configuracion:
 *           type: string
 *           description: Configuración del vehículo
 *         estado:
 *           type: boolean
 *           description: Estado del conductor
 *         apellidoPaterno:
 *           type: string
 *           description: Apellido paterno (datos RENIEC)
 *         apellidoMaterno:
 *           type: string
 *           description: Apellido materno (datos RENIEC)
 *         nombres:
 *           type: string
 *           description: Nombres (datos RENIEC)
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
 *         tipoDocumento: "DNI"
 *         numeroDocumento: "71496588"
 *         nombre: "Juan Carlos García López"
 *         modoTraslado: "Transporte privado"
 *         telefono: "987654321"
 *         licencia: "Q12345678"
 *         nroPlaca: "ABC-123"
 *         modeloVehiculo: "Hilux"
 *         marcaVehiculo: "Toyota"
 *         estado: true
 */
const Conductor = sequelize.define(
  "Conductor",
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
        name: 'unique_documento_conductor',
        msg: 'Ya existe un conductor con este número de documento'
      },
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // Campos específicos para transporte público
    direccionFiscal: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    mtc: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Campos específicos para transporte privado
    telefono: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    licencia: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Campo común para ambos tipos
    modoTraslado: {
      type: DataTypes.ENUM(
        'Transporte privado',
        'Transporte público'
      ),
      allowNull: false,
    },
    // Campos de datos del vehículo (para ambos tipos)
    nroPlaca: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tuc: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    autorizacionMTC: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nroPlacaSecundaria: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tucSecundaria: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    autorizacionMTCSecundaria: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    modeloVehiculo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    marcaVehiculo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    configuracion: {
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
  },
  {
    tableName: "conductores",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['tipoDocumento', 'numeroDocumento'],
        name: 'unique_tipo_numero_documento_conductor'
      },
      {
        fields: ['estado'],
        name: 'idx_conductor_estado'
      },
      {
        fields: ['nombre'],
        name: 'idx_conductor_nombre'
      },
      {
        fields: ['modoTraslado'],
        name: 'idx_conductor_modo_traslado'
      },
      {
        fields: ['nroPlaca'],
        name: 'idx_conductor_placa'
      }
    ],
    validate: {
      // Validar campos requeridos según modo de traslado
      camposSegunModo() {
        if (this.modoTraslado === 'Transporte público') {
          if (!this.direccionFiscal) {
            throw new Error('La dirección fiscal es requerida para transporte público');
          }
          if (!this.mtc) {
            throw new Error('El número MTC es requerido para transporte público');
          }
        } else if (this.modoTraslado === 'Transporte privado') {
          // No se requieren campos adicionales para transporte privado
        }
      },
      // Validar formato de DNI
      dniValido() {
        if (this.tipoDocumento === 'DNI' && this.numeroDocumento) {
          if (!/^\d{8}$/.test(this.numeroDocumento)) {
            throw new Error('El DNI debe tener exactamente 8 dígitos');
          }
        }
      },
      // Validar formato de RUC
      rucValido() {
        if (this.tipoDocumento === 'RUC' && this.numeroDocumento) {
          if (!/^\d{11}$/.test(this.numeroDocumento)) {
            throw new Error('El RUC debe tener exactamente 11 dígitos');
          }
        }
      },

    },
    hooks: {
      beforeCreate: (conductor, options) => {
        // Convertir placas a mayúsculas
        if (conductor.nroPlaca) {
          conductor.nroPlaca = conductor.nroPlaca.toUpperCase();
        }
        if (conductor.nroPlacaSecundaria) {
          conductor.nroPlacaSecundaria = conductor.nroPlacaSecundaria.toUpperCase();
        }
        // Convertir nombres a mayúsculas para consistencia con RENIEC/SUNAT
        if (conductor.nombres) {
          conductor.nombres = conductor.nombres.toUpperCase();
        }
        if (conductor.apellidoPaterno) {
          conductor.apellidoPaterno = conductor.apellidoPaterno.toUpperCase();
        }
        if (conductor.apellidoMaterno) {
          conductor.apellidoMaterno = conductor.apellidoMaterno.toUpperCase();
        }
      },
      beforeUpdate: (conductor, options) => {
        // Convertir placas a mayúsculas
        if (conductor.nroPlaca) {
          conductor.nroPlaca = conductor.nroPlaca.toUpperCase();
        }
        if (conductor.nroPlacaSecundaria) {
          conductor.nroPlacaSecundaria = conductor.nroPlacaSecundaria.toUpperCase();
        }
        // Convertir nombres a mayúsculas para consistencia con RENIEC/SUNAT
        if (conductor.nombres) {
          conductor.nombres = conductor.nombres.toUpperCase();
        }
        if (conductor.apellidoPaterno) {
          conductor.apellidoPaterno = conductor.apellidoPaterno.toUpperCase();
        }
        if (conductor.apellidoMaterno) {
          conductor.apellidoMaterno = conductor.apellidoMaterno.toUpperCase();
        }
      }
    }
  }
);

// Método de instancia para obtener el nombre completo
Conductor.prototype.getNombreCompleto = function() {
  if (this.nombres && this.apellidoPaterno) {
    return `${this.nombres} ${this.apellidoPaterno} ${this.apellidoMaterno || ''}`.trim();
  }
  return this.nombre || 'Sin nombre';
};

// Método de instancia para verificar si es transporte público
Conductor.prototype.esTransportePublico = function() {
  return this.modoTraslado === 'Transporte público';
};

// Método de instancia para verificar si es transporte privado
Conductor.prototype.esTransportePrivado = function() {
  return this.modoTraslado === 'Transporte privado';
};

// Método de clase para buscar conductores por modo de traslado
Conductor.buscarPorModoTraslado = function(modoTraslado) {
  return this.findAll({
    where: {
      estado: true,
      modoTraslado: modoTraslado
    },
    order: [['createdAt', 'DESC']]
  });
};

// Método de clase para buscar conductores por placa
Conductor.buscarPorPlaca = function(placa) {
  const { Op } = require('sequelize');
  return this.findAll({
    where: {
      estado: true,
      [Op.or]: [
        { nroPlaca: { [Op.like]: `%${placa}%` } },
        { nroPlacaSecundaria: { [Op.like]: `%${placa}%` } }
      ]
    }
  });
};

module.exports = Conductor;