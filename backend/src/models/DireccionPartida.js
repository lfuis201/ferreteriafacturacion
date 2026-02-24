const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

// Modelo de Direcciones de Partida (para Guía de Remisión)
const DireccionPartida = sequelize.define(
  "DireccionPartida",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    direccion: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "Dirección base sin ubigeo",
    },
    direccionCompleta: {
      type: DataTypes.STRING(512),
      allowNull: false,
      comment: "Dirección completa con distrito, provincia, departamento",
    },
    departamento: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    provincia: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    distrito: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    ubigeo: {
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: "Código de ubigeo",
    },
    estado: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "DireccionesPartida",
    timestamps: true,
    indexes: [
      { fields: ["ubigeo"], name: "idx_direccion_partida_ubigeo" },
      { fields: ["direccion"], name: "idx_direccion_partida_direccion" },
    ],
  }
);

module.exports = DireccionPartida;