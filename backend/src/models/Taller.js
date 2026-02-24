const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); 





/**
 * @swagger
 * components:
 *   schemas:
 *     Taller:
 *       type: object
 *       required:
 *         - clienteId
 *         - nombreCliente
 *         - telefonoCliente
 *         - descripcion
 *         - motivoIngreso
 *         - estado
 *         - numeroSerie
 *         - marca
 *         - equipo
 *         - modelo
 *         - placa
 *         - quilometraje
 *         - operarioId
 *         - categoria
 *       properties:
 *         id:
 *           type: integer
 *           description: ID autogenerado del taller
 *         clienteId:
 *           type: integer
 *           description: ID del cliente
 *         nombreCliente:
 *           type: string
 *           description: Nombre del cliente
 *         telefonoCliente:
 *           type: string
 *           description: Teléfono del cliente
 *         descripcion:
 *           type: string
 *           description: Descripción detallada del taller
 *         motivoIngreso:
 *           type: string
 *           description: Motivo de ingreso del vehículo
 *         estado:
 *           type: string
 *           enum: ['Pendiente', 'En Proceso', 'Finalizado', 'Cancelado']
 *           description: Estado del taller
 *         numeroSerie:
 *           type: string
 *           description: Número de serie del vehículo
 *         marca:
 *           type: string
 *           description: Marca del vehículo
 *         equipo:
 *           type: string
 *           description: Equipo del vehículo
 *         modelo:
 *           type: string
 *           description: Modelo del vehículo
 *         placa:
 *           type: string
 *           description: Placa del vehículo
 *         quilometraje:
 *           type: integer
 *           description: Quilometraje del vehículo
 *         operarioId:
 *           type: integer
 *           description: ID del operario responsable del taller
 *         nombreOperario:
 *           type: string
 *           description: Nombre completo del operario (generado automáticamente)
 *         puestoOperario:
 *           type: string
 *           description: Puesto del operario (generado automáticamente)
 *         especialidadOperario:
 *           type: string
 *           description: Especialidad del operario (generado automáticamente)
 *         categoria:
 *           type: string
 *           enum: ['Garantía', 'Reparación', 'Mantenimiento', 'Diagnóstico', 'Mantenimiento Preventivo', 'Mantenimiento Correctivo', 'Planchado y Pintura', 'Equipamiento']
 *           description: Categoría del taller
 *         imagen:
 *           type: string
 *           description: URLs de las imágenes del taller separadas por comas
 *         usuarioId:
 *           type: integer
 *           description: ID del usuario que crea el taller
 *         checklist:
 *           type: object
 *           description: Checklist del taller
 *         precioMantenimiento:
 *           type: number
 *           format: float
 *           description: Precio del mantenimiento
 *         placaChecklist:
 *           type: string
 *           description: Placa del vehículo en el checklist
 *         colorChecklist:
 *           type: string
 *           description: Color del vehículo en el checklist
 *         chasisChecklist:
 *           type: string
 *           description: Chasis del vehículo en el checklist
 *         numeroFlotaChecklist:
 *           type: string
 *           description: Número de flota del vehículo en el checklist
 *         kilometrajeChecklist:
 *           type: integer
 *           description: Kilometraje del vehículo en el checklist
 *         añoChecklist:
 *           type: integer
 *           description: Año del vehículo en el checklist
 *         vencimientoSoatChecklist:
 *           type: string
 *           format: date
 *           description: Vencimiento del SOAT en el checklist
 *         vencimientoRevisionTecChecklist:
 *           type: string
 *           format: date
 *           description: Vencimiento de la revisión técnica en el checklist
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación del taller
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de actualización del taller
 *       example:
 *         id: 1
 *         clienteId: 1
 *         nombreCliente: Juan Pérez
 *         telefonoCliente: 1234567890
 *         descripcion: Problema con el motor
 *         motivoIngreso: Reparación
 *         estado: Pendiente
 *         numeroSerie: 123456789
 *         marca: Toyota
 *         equipo: Corolla
 *         modelo: 2020
 *         placa: ABC123
 *         quilometraje: 50000
 *         operarioId: 1
 *         nombreOperario: Carlos López
 *         puestoOperario: Mecánico Senior
 *         especialidadOperario: Motor y Transmisión
 *         categoria: Reparación
 *         imagen: http://localhost:3000/uploads/imagen1.jpg,http://localhost:3000/uploads/imagen2.jpg
 *         usuarioId: 1
 *         checklist: { "item1": "ok", "item2": "pendiente" }
 *         precioMantenimiento: 1500.00
 *         placaChecklist: ABC123
 *         colorChecklist: Rojo
 *         chasisChecklist: 123456789
 *         numeroFlotaChecklist: 123456
 *         kilometrajeChecklist: 50000
 *         añoChecklist: 2020
 *         vencimientoSoatChecklist: 2023-12-31
 *         vencimientoRevisionTecChecklist: 2023-12-31
 *         createdAt: 2023-01-01T00:00:00Z
 *         updatedAt: 2023-01-01T00:00:00Z
 */

const Taller = sequelize.define('Taller', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  clienteId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Clientes',
      key: 'id'
    }
  },
  nombreCliente: {
    type: DataTypes.STRING,
    allowNull: false
  },
  telefonoCliente: {
    type: DataTypes.STRING,
    allowNull: true
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  motivoIngreso: {
    type: DataTypes.STRING,
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('Pendiente', 'En Proceso', 'Finalizado', 'Cancelado'),
    allowNull: false,
    defaultValue: 'Pendiente'
  },
  numeroSerie: {
    type: DataTypes.STRING,
    allowNull: false
  },
  marca: {
    type: DataTypes.STRING,
    allowNull: false
  },
  equipo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  modelo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  placa: {
    type: DataTypes.STRING,
    allowNull: false
  },
  quilometraje: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  categoria: {
    type: DataTypes.ENUM('Garantía', 'Reparación', 'Mantenimiento', 'Diagnóstico', 'Mantenimiento Preventivo', 'Mantenimiento Correctivo', 'Planchado y Pintura', 'Equipamiento'),
    allowNull: false
  },
  imagen: {
    type: DataTypes.STRING,
    allowNull: true
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Usuarios',
      key: 'id'
    }
  },
  checklist: {
    type: DataTypes.JSON,
    allowNull: true
  },
  precioMantenimiento: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  placaChecklist: {
    type: DataTypes.STRING,
    allowNull: true
  },
  colorChecklist: {
    type: DataTypes.STRING,
    allowNull: true
  },
  chasisChecklist: {
    type: DataTypes.STRING,
    allowNull: true
  },

/* NO SE USA AUN
  ventaId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Ventas',
      key: 'id'
    },
    comment: 'ID de la venta asociada al taller'
  },
*/


  numeroFlotaChecklist: {
    type: DataTypes.STRING,
    allowNull: true
  },
  kilometrajeChecklist: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  añoChecklist: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  vencimientoSoatChecklist: {
    type: DataTypes.DATE,
    allowNull: true
  },
  vencimientoRevisionTecChecklist: {
    type: DataTypes.DATE,
    allowNull: true
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Observaciones adicionales del taller'
  },
  operarioId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Operarios',
      key: 'id'
    },
    comment: 'ID del operario asignado al taller'
  }
}, {
  timestamps: true,
  tableName: 'Talleres',
  freezeTableName: true
});

module.exports = Taller;