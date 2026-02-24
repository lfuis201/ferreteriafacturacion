const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Configuracion = sequelize.define('Configuracion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  clave: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: 'Clave única de la configuración'
  },
  valor: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Valor de la configuración'
  },
  tipo: {
    type: DataTypes.ENUM('STRING', 'NUMBER', 'BOOLEAN', 'JSON'),
    allowNull: false,
    defaultValue: 'STRING',
    comment: 'Tipo de dato del valor'
  },
  descripcion: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Descripción de la configuración'
  },
  categoria: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Categoría de la configuración'
  },
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Indica si la configuración está activa'
  }
}, {
  tableName: 'configuraciones',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['clave']
    },
    {
      fields: ['categoria']
    },
    {
      fields: ['activo']
    }
  ]
});

// Métodos estáticos para facilitar el uso
Configuracion.obtenerValor = async function(clave, valorPorDefecto = null) {
  try {
    const config = await this.findOne({
      where: { clave, activo: true }
    });
    
    if (!config) {
      return valorPorDefecto;
    }
    
    // Convertir el valor según el tipo
    switch (config.tipo) {
      case 'BOOLEAN':
        return config.valor === 'true' || config.valor === '1';
      case 'NUMBER':
        return parseFloat(config.valor);
      case 'JSON':
        return JSON.parse(config.valor);
      default:
        return config.valor;
    }
  } catch (error) {
    console.error('Error al obtener configuración:', error);
    return valorPorDefecto;
  }
};

Configuracion.establecerValor = async function(clave, valor, tipo = 'STRING', descripcion = null, categoria = null) {
  try {
    // Convertir el valor a string según el tipo
    let valorString;
    switch (tipo) {
      case 'BOOLEAN':
        valorString = valor ? 'true' : 'false';
        break;
      case 'NUMBER':
        valorString = valor.toString();
        break;
      case 'JSON':
        valorString = JSON.stringify(valor);
        break;
      default:
        valorString = valor.toString();
    }
    
    const [config, created] = await this.findOrCreate({
      where: { clave },
      defaults: {
        clave,
        valor: valorString,
        tipo,
        descripcion,
        categoria,
        activo: true
      }
    });
    
    if (!created) {
      await config.update({
        valor: valorString,
        tipo,
        descripcion: descripcion || config.descripcion,
        categoria: categoria || config.categoria
      });
    }
    
    return config;
  } catch (error) {
    console.error('Error al establecer configuración:', error);
    throw error;
  }
};

module.exports = Configuracion;