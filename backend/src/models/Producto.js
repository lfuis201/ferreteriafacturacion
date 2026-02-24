const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); 


/**
* @swagger
* components:
*   schemas:
*     Producto:
*       type: object
*       required:
*         - nombre
*         - codigo
*         - precioCompra
*         - precioVenta
*         - unidadMedida
*       properties:
*         id:
*           type: integer
*           description: ID autogenerado del producto
*         nombre:
*           type: string
*           description: Nombre del producto
*         codigo:
*           type: string
*           description: Código único del producto
*         descripcion:
*           type: string
*           description: Descripción detallada del producto
*         precioCompra:
*           type: number
*           format: float
*           description: Precio de compra del producto
*         precioVenta:
*           type: number
*           format: float
*           description: Precio de venta del producto
*         productosRelacionados:
*           type: string
*           description: Productos relacionados
*         codigoTipoMoneda:
*           type: string
*           description: Código del tipo de moneda
*         codigoTipoAfectacionIgvVenta:
*           type: string
*           description: Código del tipo de afectación del IGV para venta
*         tieneIgv:
*           type: boolean
*           description: Indica si el producto tiene IGV
*         codigoTipoAfectacionIgvCompra:
*           type: string
*           description: Código del tipo de afectación del IGV para compra
*         stock:
*           type: integer
*           description: Stock actual del producto
*         stockMinimo:
*           type: integer
*           description: Stock mínimo del producto
*         unidadMedida:
*           type: string
*           description: Unidad de medida base del producto (kg, unidad, litro, etc.)
*         imagen:
*           type: string
*           description: URL de la imagen del producto
*         codigoBarras:
*           type: string
*           description: Código de barras del producto
*         tipodeAfectacion:
*           type: string
*           enum: ['Gravado_Operación_Onerosa', 'Gravado_Retiro_por_premio', 'Gravado_Retiro_por_donación', 'Gravado_Retiro', 'Gravado_Retiro_por_publicidad', 'Gravado_Bonificaciones', 'Gravado_Retiro_por_entrega_a_trabajadores', 'Exonerado_Operación_Onerosa', 'Exonerado_Retiro', 'Inafecto_Operación_Onerosa', 'Inafecto_Retiro_por_Bonificación', 'Inafecto_Retiro', 'Exonerado_Transferencia_Gratuita']
*           description: Tipo de afectación del producto
*         modelo:
*           type: string
*           description: Modelo del producto
*         marca:
*           type: string
*           description: Marca del producto
*         origen:
*           type: string
*           description: Origen del producto
*         codigosunat:
*           type: string
*           description: Código SUNAT del producto
*         codigoprovedorOEM:
*           type: string
*           description: Código del proveedor OEM
*         codigoCompetencia:
*           type: string
*           description: Código de competencia
*         rangoAnos:
*           type: string
*           format: date
*           description: Rango de años del producto
*         observaciones:
*           type: string
*           description: Observaciones sobre el producto
*         categoriaId:
*           type: integer
*           description: ID de la categoría a la que pertenece el producto
*         estado:
*           type: boolean
*           description: Estado del producto (activo/inactivo)
*         iscActivo:
*           type: boolean
*           description: Indica si el producto tiene ISC activo
*         tipoAplicacionISC:
*           type: string
*           enum: ['Aplicación del Monto Fijo', 'Sistema al valor', 'Sistema de Precios de Venta al Público']
*           description: Tipo de aplicación del ISC
*         sujetoDetraccion:
*           type: boolean
*           description: Indica si el producto está sujeto a detracción
*       example:
*         nombre: Martillo Stanley
*         codigo: MART-001
*         descripcion: Martillo de carpintero con mango ergonómico
*         precioCompra: 15.50
*         precioVenta: 25.99
*         productosRelacionados: Clavos, Tornillos
*         codigoTipoMoneda: PEN
*         codigoTipoAfectacionIgvVenta: 10
*         tieneIgv: true
*         codigoTipoAfectacionIgvCompra: 10
*         stock: 50
*         stockMinimo: 10
*         unidadMedida: unidad
*         codigoBarras: 7501234567890
*         tipodeAfectacion: Gravado_Operación_Onerosa
*         modelo: Modelo 1
*         marca: Stanley
*         origen: Nacional
*         codigosunat: SUNAT-001
*         codigoprovedorOEM: OEM-001
*         codigoCompetencia: COMP-001
*         rangoAnos: 2023-01-01
*         observaciones: Producto de alta calidad
*         categoriaId: 1
*         iscActivo: false
*         tipoAplicacionISC: null
*         sujetoDetraccion: false
*/

const Producto = sequelize.define('Producto', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  codigo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  precioCompra: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  precioVenta: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  productosRelacionados: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Productos relacionados'
  },
  codigoTipoMoneda: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Código del tipo de moneda'
  },
  codigoTipoAfectacionIgvVenta: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Código del tipo de afectación del IGV para venta'
  },
  tieneIgv: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Indica si el producto tiene IGV'
  },
  codigoTipoAfectacionIgvCompra: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Código del tipo de afectación del IGV para compra'
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Stock actual del producto'
  },
  stockMinimo: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Stock mínimo del producto'
  },
  unidadMedida: {
    type: DataTypes.STRING,
    allowNull: false
  },
  imagen: {
    type: DataTypes.STRING,
    allowNull: true
  },
  codigoBarras: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },  


   tipodeAfectacion: {
    type: DataTypes.ENUM('Gravado_Operación_Onerosa', 'Gravado_Retiro_por_premio', 'Gravado_Retiro_por_donación', 'Gravado_Retiro', 'Gravado_Retiro_por_publicidad', 'Gravado_Bonificaciones', 'Gravado_Retiro_por_entrega_a_trabajadores', 'Exonerado_Operación_Onerosa', 'Exonerado_Retiro', 'Inafecto_Operación_Onerosa', 'Inafecto_Retiro_por_Bonificación', 'Inafecto_Retiro', 'Exonerado_Transferencia_Gratuita' ),
    allowNull: true
  },

  modelo: {
    type: DataTypes.STRING,
    allowNull: true
  }, 

  marca: {
    type: DataTypes.STRING,
    allowNull: true
  }, 

  origen: {
    type: DataTypes.STRING,
    allowNull: true
  },


  codigosunat: {
    type: DataTypes.STRING,
    allowNull: true

  } ,

  codigoprovedorOEM : {
    type: DataTypes.STRING,
    allowNull: true
  }, 

  codigoCompetencia: {
    type: DataTypes.STRING,
    allowNull: true
  },
 
  rangoAnos: {
    type: DataTypes.STRING,
    allowNull: true
  }, 

  observaciones : {
    type: DataTypes.STRING,
    allowNull: true
  },

  categoriaId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'categorias',
      key: 'id'
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  },
  sucursalId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'sucursal',
      key: 'id'
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    comment: 'Sucursal donde está asignado el producto'
  },
  estado: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  iscActivo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Indica si el producto tiene ISC activo'
  },
  tipoAplicacionISC: {
    type: DataTypes.ENUM('Aplicación del Monto Fijo', 'Sistema al valor', 'Sistema de Precios de Venta al Público'),
    allowNull: true,
    comment: 'Tipo de aplicación del ISC (solo si iscActivo es true)'
  },
  sujetoDetraccion: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Indica si el producto está sujeto a detracción'
  }
}, 
{
  timestamps: true,
  tableName: 'Productos',
  freezeTableName: true
});

module.exports = Producto;
