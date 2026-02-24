const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * @swagger
 * components:
 *   schemas:
 *     ConfiguracionSunat:
 *       type: object
 *       required:
 *         - sucursalId
 *         - ambiente
 *       properties:
 *         id:
 *           type: integer
 *           description: ID autogenerado de la configuración
 *         sucursalId:
 *           type: integer
 *           description: ID de la sucursal
 *         ambiente:
 *           type: string
 *           enum: ['demo', 'produccion']
 *           description: Ambiente de SUNAT (demo o producción)
 *         certificadoPfx:
 *           type: string
 *           description: Ruta del archivo PFX del certificado digital
 *         passwordCertificado:
 *           type: string
 *           description: Contraseña del certificado digital (encriptada)
 *         usuarioSol:
 *           type: string
 *           description: Usuario SOL de SUNAT
 *         passwordSol:
 *           type: string
 *           description: Contraseña SOL de SUNAT (encriptada)
 *         urlEnvio:
 *           type: string
 *           description: URL de envío de comprobantes
 *         urlConsulta:
 *           type: string
 *           description: URL de consulta de comprobantes
 *         serieFactura:
 *           type: string
 *           description: 'Serie para facturas (ej: F001)'
 *         correlativoFactura:
 *           type: integer
 *           description: Correlativo actual para facturas
 *         serieBoleta:
 *           type: string
 *           description: 'Serie para boletas (ej: B001)'
 *         correlativoBoleta:
 *           type: integer
 *           description: Correlativo actual para boletas
 *         serieNotaCredito:
 *           type: string
 *           description: 'Serie para notas de crédito (ej: FC01)'
 *         correlativoNotaCredito:
 *           type: integer
 *           description: Correlativo actual para notas de crédito
 *         serieNotaDebito:
 *           type: string
 *           description: 'Serie para notas de débito (ej: FD01)'
 *         correlativoNotaDebito:
 *           type: integer
 *           description: Correlativo actual para notas de débito
 *         activo:
 *           type: boolean
 *           description: Indica si la configuración está activa
 *         fechaVinculacion:
 *           type: string
 *           format: date-time
 *           description: Fecha de vinculación con SUNAT
 *         ultimaConexion:
 *           type: string
 *           format: date-time
 *           description: Última conexión exitosa con SUNAT
 *         estadoConexion:
 *           type: string
 *           enum: ['conectado', 'desconectado', 'error']
 *           description: Estado actual de la conexión
 */

const ConfiguracionSunat = sequelize.define('ConfiguracionSunat', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sucursalId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true, // Una configuración por sucursal
    references: {
      model: 'sucursal',
      key: 'id'
    }
  },
  ambiente: {
    type: DataTypes.ENUM('demo', 'produccion'),
    allowNull: false,
    defaultValue: 'demo',
    comment: 'Ambiente de SUNAT: demo para pruebas, produccion para uso real'
  },
  // Certificado Digital
  certificadoPfx: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Ruta del archivo PFX del certificado digital'
  },
  passwordCertificado: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Contraseña del certificado digital (encriptada)'
  },
  
 
  // URLs de conexión
  urlEnvio: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'URL de envío de comprobantes a SUNAT'
  },
  urlConsulta: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'URL de consulta de comprobantes en SUNAT'
  },
  // Series y Correlativos - Facturas
  serieFactura: {
    type: DataTypes.STRING(4),
    allowNull: true,
    defaultValue: 'F001',
    comment: 'Serie para facturas (ej: F001)'
  },
  correlativoFactura: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: 'Correlativo actual para facturas'
  },
  // Series y Correlativos - Boletas
  serieBoleta: {
    type: DataTypes.STRING(4),
    allowNull: true,
    defaultValue: 'B001',
    comment: 'Serie para boletas (ej: B001)'
  },
  correlativoBoleta: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: 'Correlativo actual para boletas'
  },
  // Series y Correlativos - Notas de Crédito
  serieNotaCredito: {
    type: DataTypes.STRING(4),
    allowNull: true,
    defaultValue: 'FC01',
    comment: 'Serie para notas de crédito (ej: FC01)'
  },
  correlativoNotaCredito: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: 'Correlativo actual para notas de crédito'
  },
  // Series y Correlativos - Notas de Débito
  serieNotaDebito: {
    type: DataTypes.STRING(4),
    allowNull: true,
    defaultValue: 'FD01',
    comment: 'Serie para notas de débito (ej: FD01)'
  },
  correlativoNotaDebito: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: 'Correlativo actual para notas de débito'
  },
  // Estado y control
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Indica si la configuración está activa y lista para usar'
  },
  fechaVinculacion: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha de vinculación exitosa con SUNAT'
  },
  ultimaConexion: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Última conexión exitosa con SUNAT'
  },
  estadoConexion: {
    type: DataTypes.ENUM('conectado', 'desconectado', 'error'),
    allowNull: false,
    defaultValue: 'desconectado',
    comment: 'Estado actual de la conexión con SUNAT'
  },
  // Configuración adicional
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Observaciones o notas sobre la configuración'
  }
}, {
  timestamps: true,
  tableName: 'ConfiguracionesSunat',
  freezeTableName: true,
  indexes: [
    {
      unique: true,
      fields: ['sucursalId']
    },
    {
      fields: ['ambiente']
    },
    {
      fields: ['activo']
    },
    {
      fields: ['estadoConexion']
    }
  ]
});

// Métodos del modelo
ConfiguracionSunat.prototype.obtenerProximoCorrelativo = function(tipoComprobante) {
  const correlativos = {
    'factura': this.correlativoFactura,
    'boleta': this.correlativoBoleta,
    'nota_credito': this.correlativoNotaCredito,
    'nota_debito': this.correlativoNotaDebito
  };
  
  return correlativos[tipoComprobante] || 1;
};

ConfiguracionSunat.prototype.obtenerSerie = function(tipoComprobante) {
  const series = {
    'factura': this.serieFactura,
    'boleta': this.serieBoleta,
    'nota_credito': this.serieNotaCredito,
    'nota_debito': this.serieNotaDebito
  };
  
  return series[tipoComprobante] || 'F001';
};

ConfiguracionSunat.prototype.incrementarCorrelativo = async function(tipoComprobante) {
  const campos = {
    'factura': 'correlativoFactura',
    'boleta': 'correlativoBoleta',
    'nota_credito': 'correlativoNotaCredito',
    'nota_debito': 'correlativoNotaDebito'
  };
  
  const campo = campos[tipoComprobante];
  if (campo) {
    this[campo] = this[campo] + 1;
    await this.save();
    return this[campo];
  }
  
  throw new Error(`Tipo de comprobante no válido: ${tipoComprobante}`);
};

ConfiguracionSunat.prototype.obtenerUrlsAmbiente = function() {
  if (this.ambiente === 'demo') {
    return {
      envio: 'https://e-beta.sunat.gob.pe/ol-ti-itcpfegem-beta/billService',
      consulta: 'https://e-beta.sunat.gob.pe/ol-ti-itcpfegem-beta/billConsultService'
    };
  } else {
    return {
      envio: 'https://e-factura.sunat.gob.pe/ol-ti-itcpfegem/billService',
      consulta: 'https://e-factura.sunat.gob.pe/ol-ti-itcpfegem/billConsultService'
    };
  }
};

// Método para obtener siguiente correlativo
ConfiguracionSunat.prototype.obtenerSiguienteCorrelativo = function(tipoDocumento) {
  // Mapeo de tipos de documento de API a formato interno
  const mapeoTipos = {
    'FACTURA': 'factura',
    'BOLETA': 'boleta', 
    'NOTA_CREDITO': 'nota_credito',
    'NOTA_DEBITO': 'nota_debito',
    'factura': 'factura',
    'boleta': 'boleta',
    'nota_credito': 'nota_credito',
    'nota_debito': 'nota_debito'
  };
  
  const tipoNormalizado = mapeoTipos[tipoDocumento];
  if (!tipoNormalizado) {
    throw new Error(`Tipo de documento no válido: ${tipoDocumento}`);
  }
  
  const correlativos = {
    'factura': this.correlativoFactura,
    'boleta': this.correlativoBoleta,
    'nota_credito': this.correlativoNotaCredito,
    'nota_debito': this.correlativoNotaDebito
  };
  
  return correlativos[tipoNormalizado] || 1;
};

// Método para actualizar correlativo
ConfiguracionSunat.prototype.actualizarCorrelativo = async function(tipoDocumento, nuevoCorrelativo) {
  // Mapeo de tipos de documento de API a formato interno
  const mapeoTipos = {
    'FACTURA': 'factura',
    'BOLETA': 'boleta', 
    'NOTA_CREDITO': 'nota_credito',
    'NOTA_DEBITO': 'nota_debito',
    'factura': 'factura',
    'boleta': 'boleta',
    'nota_credito': 'nota_credito',
    'nota_debito': 'nota_debito'
  };
  
  const tipoNormalizado = mapeoTipos[tipoDocumento];
  if (!tipoNormalizado) {
    throw new Error(`Tipo de documento no válido: ${tipoDocumento}`);
  }
  
  const campos = {
    'factura': 'correlativoFactura',
    'boleta': 'correlativoBoleta',
    'nota_credito': 'correlativoNotaCredito',
    'nota_debito': 'correlativoNotaDebito'
  };
  
  const campo = campos[tipoNormalizado];
  if (campo) {
    this[campo] = nuevoCorrelativo;
    await this.save();
    return this[campo];
  }
  
  throw new Error(`Tipo de documento no válido: ${tipoDocumento}`);
};

// Método para obtener URL de conexión
ConfiguracionSunat.prototype.obtenerUrlConexion = function() {
  const urls = this.obtenerUrlsAmbiente();
  return urls.envio;
};

module.exports = ConfiguracionSunat;