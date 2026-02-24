const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcrypt');

/**
 * @swagger
 * components:
 *   schemas:
 *     Usuario:
 *       type: object
 *       required:
 *         - nombre
 *         - apellido
 *         - correo
 *         - password
 *         - rol
 *       properties:
 *         id:
 *           type: integer
 *           description: ID autogenerado del usuario
 *         nombre:
 *           type: string
 *           description: Nombre del usuario
 *         apellido:
 *           type: string
 *           description: Apellido del usuario
 *         correo:
 *           type: string
 *           format: email
 *           description: Correo electrónico del usuario (único)
 *         password:
 *           type: string
 *           format: password
 *           description: Contraseña del usuario (se almacena encriptada)
 *         rol:
 *           type: string
 *           enum: [SuperAdmin, Admin, Cajero, Almacenero]
 *           description: Rol del usuario en el sistema
 *         sucursalId:
 *           type: integer
 *           description: ID de la sucursal a la que pertenece el usuario
 *         estado:
 *           type: boolean
 *           description: Estado del usuario (activo/inactivo)
 */
const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  apellido: {
    type: DataTypes.STRING,
    allowNull: false
  },
  correo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  rol: {
    type: DataTypes.ENUM('SuperAdmin', 'Admin', 'Cajero', 'Almacenero', 'Trabajador'),
    allowNull: false
  },
  sucursalId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Sucursales',
      key: 'id'
    }, 
    onDelete: 'SET NULL',  
    onUpdate: 'CASCADE'    
  },
  
  estado: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true,
  tableName: 'Usuarios',
  freezeTableName: true
});

// Hook para encriptar la contraseña antes de guardar el usuario
Usuario.beforeCreate(async (usuario) => {
  const hashedPassword = await bcrypt.hash(usuario.password, 10);
  usuario.password = hashedPassword;
});

// Hook para encriptar la contraseña cuando se actualiza
Usuario.beforeUpdate(async (usuario) => {
  if (usuario.changed('password')) {
    const hashedPassword = await bcrypt.hash(usuario.password, 10);
    usuario.password = hashedPassword;
  }
});

// Método para validar la contraseña
Usuario.prototype.validarPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};



module.exports = Usuario;
