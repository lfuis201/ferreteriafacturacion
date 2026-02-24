//const { DataTypes } = require('sequelize');
//const sequelize = require('../config/database');

/**
 * @swagger
 * components:
 *   schemas:
 *     ActivoFijo:
 *       type: object
 *       required:
 *         - nombre
 *         - codigo
 *         - valorCompra
 *         - fechaCompra
 *         - categoria
 *         - vidaUtilAnos
 *       properties:
 *         id:
 *           type: integer
 *           description: ID autogenerado del activo fijo
 *         nombre:
 *           type: string
 *           description: Nombre del activo fijo
 *         codigo:
 *           type: string
 *           description: Código único del activo fijo
 *         descripcion:
 *           type: string
 *           description: Descripción detallada del activo fijo
 *         categoria:
 *           type: string
 *           enum: ['Maquinaria', 'Equipos', 'Vehículos', 'Muebles', 'Inmuebles', 'Tecnología', 'Herramientas', 'Otros']
 *           description: Categoría del activo fijo
 *         valorCompra:
 *           type: number
 *           format: float
 *           description: Valor de compra del activo fijo
 *         valorActual:
 *           type: number
 *           format: float
 *           description: Valor actual del activo fijo después de depreciación
 *         fechaCompra:
 *           type: string
 *           format: date
 *           description: Fecha de compra del activo fijo
 *         fechaInicioDepreciacion:
 *           type: string
 *           format: date
 *           description: Fecha de inicio de la depreciación
 *         vidaUtilAnos:
 *           type: integer
 *           description: Vida útil en años del activo fijo
 *         metodoDepreciacion:
 *           type: string
 *           enum: ['Lineal', 'Acelerada', 'Unidades de Producción']
 *           description: Método de depreciación aplicado
 *         depreciacionAcumulada:
 *           type: number
 *           format: float
 *           description: Depreciación acumulada hasta la fecha
 *         depreciacionAnual:
 *           type: number
 *           format: float
 *           description: Depreciación anual calculada
 *         ubicacion:
 *           type: string
 *           description: Ubicación física del activo fijo
 *         responsable:
 *           type: string
 *           description: Persona responsable del activo fijo
 *         numeroSerie:
 *           type: string
 *           description: Número de serie del activo fijo
 *         marca:
 *           type: string
 *           description: Marca del activo fijo
 *         modelo:
 *           type: string
 *           description: Modelo del activo fijo
 *         proveedor:
 *           type: string
 *           description: Proveedor del activo fijo
 *         numeroFactura:
 *           type: string
 *           description: Número de factura de compra
 *         estado:
 *           type: string
 *           enum: ['Activo', 'Inactivo', 'En Mantenimiento', 'Dado de Baja', 'Vendido']
 *           description: Estado actual del activo fijo
 *         observaciones:
 *           type: string
 *           description: Observaciones adicionales
 *         sucursalId:
 *           type: integer
 *           description: ID de la sucursal donde se encuentra el activo
 *       example:
 *         nombre: Computadora Dell OptiPlex
 *         codigo: ACT-001
 *         descripcion: Computadora de escritorio para oficina
 *         categoria: Tecnología
 *         valorCompra: 2500.00
 *         valorActual: 1875.00
 *         fechaCompra: 2023-01-15
 *         fechaInicioDepreciacion: 2023-02-01
 *         vidaUtilAnos: 4
 *         metodoDepreciacion: Lineal
 *         depreciacionAcumulada: 625.00
 *         depreciacionAnual: 625.00
 *         ubicacion: Oficina Principal - Piso 2
 *         responsable: Juan Pérez
 *         numeroSerie: DL123456789
 *         marca: Dell
 *         modelo: OptiPlex 3080
 *         proveedor: Distribuidora Tech SAC
 *         numeroFactura: F001-00001234
 *         estado: Activo
 *         observaciones: Equipo en buen estado
 *         sucursalId: 1
 */
 


/*
const ActivoFijo = sequelize.define('ActivoFijo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Nombre del activo fijo'
  },
  codigo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: 'Código único del activo fijo'
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Descripción detallada del activo fijo'
  },
  categoria: {
    type: DataTypes.ENUM('Maquinaria', 'Equipos', 'Vehículos', 'Muebles', 'Inmuebles', 'Tecnología', 'Herramientas', 'Otros'),
    allowNull: false,
    comment: 'Categoría del activo fijo'
  },
  valorCompra: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    comment: 'Valor de compra del activo fijo'
  },
  valorActual: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    comment: 'Valor actual del activo fijo después de depreciación'
  },
  fechaCompra: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Fecha de compra del activo fijo'
  },
  fechaInicioDepreciacion: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Fecha de inicio de la depreciación'
  },
  vidaUtilAnos: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Vida útil en años del activo fijo'
  },
  metodoDepreciacion: {
    type: DataTypes.ENUM('Lineal', 'Acelerada', 'Unidades de Producción'),
    allowNull: false,
    defaultValue: 'Lineal',
    comment: 'Método de depreciación aplicado'
  },
  depreciacionAcumulada: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Depreciación acumulada hasta la fecha'
  },
  depreciacionAnual: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    comment: 'Depreciación anual calculada'
  },
  ubicacion: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Ubicación física del activo fijo'
  },
  responsable: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Persona responsable del activo fijo'
  },
  numeroSerie: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Número de serie del activo fijo'
  },
  marca: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Marca del activo fijo'
  },
  modelo: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Modelo del activo fijo'
  },
  proveedor: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Proveedor del activo fijo'
  },
  numeroFactura: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Número de factura de compra'
  },
  estado: {
    type: DataTypes.ENUM('Activo', 'Inactivo', 'En Mantenimiento', 'Dado de Baja', 'Vendido'),
    allowNull: false,
    defaultValue: 'Activo',
    comment: 'Estado actual del activo fijo'
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Observaciones adicionales'
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
    comment: 'Sucursal donde se encuentra el activo'
  }
}, {
  timestamps: true,
  tableName: 'ActivosFijos',
  freezeTableName: true,
  hooks: {
    beforeCreate: (activoFijo) => {
      // Calcular depreciación anual si no está definida
      if (!activoFijo.depreciacionAnual && activoFijo.valorCompra && activoFijo.vidaUtilAnos) {
        activoFijo.depreciacionAnual = activoFijo.valorCompra / activoFijo.vidaUtilAnos;
      }
      
      // Establecer valor actual inicial
      if (!activoFijo.valorActual) {
        activoFijo.valorActual = activoFijo.valorCompra;
      }
      
      // Establecer fecha de inicio de depreciación si no está definida
      if (!activoFijo.fechaInicioDepreciacion) {
        activoFijo.fechaInicioDepreciacion = activoFijo.fechaCompra;
      }
    },
    beforeUpdate: (activoFijo) => {
      // Recalcular depreciación anual si cambió el valor de compra o vida útil
      if (activoFijo.changed('valorCompra') || activoFijo.changed('vidaUtilAnos')) {
        activoFijo.depreciacionAnual = activoFijo.valorCompra / activoFijo.vidaUtilAnos;
      }
    }
  }
});

module.exports = ActivoFijo; */