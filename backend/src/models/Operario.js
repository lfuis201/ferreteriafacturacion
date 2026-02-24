const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Operario = sequelize.define('Operario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombres: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Los nombres son obligatorios'
      },
      len: {
        args: [2, 100],
        msg: 'Los nombres deben tener entre 2 y 100 caracteres'
      }
    }
  },
  apellidos: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Los apellidos son obligatorios'
      },
      len: {
        args: [2, 100],
        msg: 'Los apellidos deben tener entre 2 y 100 caracteres'
      }
    }
  },
  puesto: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El puesto es obligatorio'
      }
    }
  },
  especialidad: {
    type: DataTypes.STRING(150),
    allowNull: true,
    comment: 'Especialidad técnica del operario'
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      len: {
        args: [9, 20],
        msg: 'El teléfono debe tener entre 9 y 20 caracteres'
      }
    }
  },
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Estado del operario (activo/inactivo)'
  }
}, {
  timestamps: true,
  tableName: 'Operarios',
  freezeTableName: true,
  indexes: [
    {
      fields: ['activo']
    },
    {
      fields: ['puesto']
    }
  ]
});

module.exports = Operario;