const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

/**
 * @swagger
 * components:
 *   schemas:
 *     Vehiculo:
 *       type: object
 *       required:
 *         - nroPlacaId
 *       properties:
 *         id:
 *           type: integer
 *           description: ID del vehículo
 *         nroPlacaId:
 *           type: string
 *           description: Número de placa ID del vehículo
 *         tucId:
 *           type: string
 *           description: T.U.C ID del vehículo
 *         autorizacionMTCPlacaPrincipal:
 *           type: string
 *           description: Autorización MTC de Placa principal
 *         nroPlacaSecundariaId:
 *           type: string
 *           description: Número de placa secundaria ID
 *         tucPlacaSecundariaId:
 *           type: string
 *           description: T.U.C Placa secundaria ID
 *         autorizacionMTCPlacaSecundaria:
 *           type: string
 *           description: Autorización MTC de Placa secundaria
 *         modeloVehiculo:
 *           type: string
 *           description: Modelo del vehículo
 *         marcaVehiculo:
 *           type: string
 *           description: Marca del vehículo
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

const Vehiculo = sequelize.define(
  "Vehiculo",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nroPlacaId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        name: 'unique_placa_vehiculo',
        msg: 'Ya existe un vehículo con este número de placa'
      },
      validate: {
        notEmpty: {
          msg: 'El número de placa es requerido'
        }
      }
    },
    tucId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    autorizacionMTCPlacaPrincipal: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nroPlacaSecundariaId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tucPlacaSecundariaId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    autorizacionMTCPlacaSecundaria: {
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
    estado: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "vehiculos",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['nroPlacaId'],
        name: 'unique_placa_vehiculo_idx'
      },
      {
        fields: ['estado'],
        name: 'idx_vehiculo_estado'
      },
      {
        fields: ['marcaVehiculo'],
        name: 'idx_vehiculo_marca'
      }
    ],
    hooks: {
      beforeCreate: (vehiculo, options) => {
        if (vehiculo.nroPlacaId) {
          vehiculo.nroPlacaId = vehiculo.nroPlacaId.toUpperCase();
        }
      },
      beforeUpdate: (vehiculo, options) => {
        if (vehiculo.nroPlacaId) {
          vehiculo.nroPlacaId = vehiculo.nroPlacaId.toUpperCase();
        }
      }
    }
  }
);

// Métodos de instancia
Vehiculo.prototype.getDescripcionCompleta = function() {
  return `${this.marcaVehiculo} ${this.modeloVehiculo} - ${this.nroPlacaId}`;
};

Vehiculo.prototype.esActivo = function() {
  return this.estado === true;
};

// Métodos estáticos
Vehiculo.buscarPorPlaca = function(placa) {
  return this.findOne({
    where: {
      nroPlacaId: placa.toUpperCase()
    }
  });
};

module.exports = Vehiculo;