const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');



/**
 * @swagger
 * components:
 *   schemas:
 *     Trabajador:
 *       type: object
 *       required:
 *         - nombres
 *         - apellidos
 *         - puesto
 *         - edad
 *         - sexo
 *         - fechaIngreso
 *         - sueldo
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del trabajador
 *         nombres:
 *           type: string
 *           description: Nombres del trabajador
 *           example: "Juan Carlos"
 *         apellidos:
 *           type: string
 *           description: Apellidos del trabajador
 *           example: "Pérez García"
 *         puesto:
 *           type: string
 *           description: Puesto de trabajo
 *           example: "Mecánico"
 *         edad:
 *           type: integer
 *           minimum: 18
 *           maximum: 70
 *           description: Edad del trabajador
 *           example: 35
 *         sexo:
 *           type: string
 *           enum: ['M', 'F']
 *           description: Sexo del trabajador
 *           example: "M"
 *         fechaIngreso:
 *           type: string
 *           format: date
 *           description: Fecha de ingreso a la empresa
 *           example: "2023-01-15"
 *         sueldo:
 *           type: number
 *           format: decimal
 *           minimum: 0
 *           description: Sueldo base del trabajador
 *           example: 1500.00
 *         adelantoSueldo:
 *           type: number
 *           format: decimal
 *           minimum: 0
 *           description: Adelanto de sueldo otorgado
 *           example: 300.00
 *         observaciones:
 *           type: string
 *           description: Observaciones adicionales
 *           example: "Trabajador destacado"
 *         activo:
 *           type: boolean
 *           description: Estado del trabajador
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */




const Planilla = sequelize.define('Planilla', {
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
        msg: 'El puesto laboral es obligatorio'
      }
    }
  },
  edad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: 18,
        msg: 'La edad mínima es 18 años'
      },
      max: {
        args: 70,
        msg: 'La edad máxima es 70 años'
      }
    }
  },
  sexo: {
    type: DataTypes.ENUM('Masculino', 'Femenino', 'Otro'),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El sexo es obligatorio'
      }
    }
  },
  fechaIngreso: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'La fecha de ingreso es obligatoria'
      },
      isDate: {
        msg: 'Debe ser una fecha válida'
      }
    }
  },
  sueldo: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: {
        args: [0.01],
        msg: 'El sueldo debe ser mayor a 0'
      },
      isDecimal: {
        msg: 'El sueldo debe ser un número válido'
      }
    }
  },
  adelantoSueldo: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0.00,
    validate: {
      min: {
        args: [0],
        msg: 'El adelanto de sueldo no puede ser negativo'
      },
      isDecimal: {
        msg: 'El adelanto debe ser un número válido'
      },
      // Validación personalizada para asegurar que el adelanto no sea mayor al sueldo
      notGreaterThanSueldo(value) {
        if (value && this.sueldo && parseFloat(value) > parseFloat(this.sueldo)) {
          throw new Error('El adelanto no puede ser mayor al sueldo base');
        }
      }
    }
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Observaciones adicionales del trabajador'
  },
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Estado del trabajador (activo/inactivo)'
  }
}, {
  timestamps: true,
  tableName: 'Planillas',
  freezeTableName: true,
  indexes: [
    {
      fields: ['activo']
    },
    {
      fields: ['puesto']
    },
    {
      fields: ['fechaIngreso']
    }
  ]
});

module.exports = Planilla;