const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');






/**
 * @swagger
 * components:
 *   schemas:
 *     Venta:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID de la venta
 *           example: 1
 *         clienteId:
 *           type: integer
 *           nullable: true
 *           description: ID del cliente (puede ser nulo para ventas sin cliente registrado)
 *           example: 1
 *         sucursalId:
 *           type: integer
 *           description: ID de la sucursal donde se realizó la venta
 *           example: 1
 *         usuarioId:
 *           type: integer
 *           description: ID del usuario que realizó la venta
 *           example: 1
 *         tipoComprobante:
 *           type: string
 *           enum: [FACTURA, BOLETA, NOTA_VENTA, COTIZACION, GUIA_REMISION]
 *           description: Tipo de comprobante (FACTURA, BOLETA, COTIZACION, etc.)
 *           example: FACTURA
 *         serieComprobante:
 *           type: string
 *           description: Serie del comprobante
 *           example: F001
 *         numeroComprobante:
 *           type: string
 *           description: Número del comprobante
 *           example: 000001
 *         fechaVenta:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de la venta
 *           example: 2023-01-01T00:00:00Z
 *         fechaVencimiento:
 *           type: string
 *           format: date
 *           nullable: true
 *           description: Fecha de vencimiento para pagos a crédito
 *           example: 2025-02-21
 *         subtotal:
 *           type: number
 *           format: float
 *           description: Subtotal de la venta
 *           example: 100.00
 *         igv:
 *           type: number
 *           format: float
 *           description: IGV de la venta
 *           example: 18.00
 *         total:
 *           type: number
 *           format: float
 *           description: Total de la venta
 *           example: 118.00
 *         estado:
 *           type: string
 *           enum: [COMPLETADA, ANULADA, PENDIENTE]
 *           description: Estado de la venta (PENDIENTE, COMPLETADA, ANULADA, etc.)
 *           example: COMPLETADA
 *         motivoAnulacion:
 *           type: string
 *           nullable: true
 *           description: Motivo de anulación (solo si la venta fue anulada)
 *           example: "Cliente solicitó anulación"
 *         usuarioAnulacionId:
 *           type: integer
 *           nullable: true
 *           description: ID del usuario que anuló la venta
 *           example: 2
 *         fechaAnulacion:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Fecha y hora de la anulación
 *           example: 2023-01-02T12:00:00Z
 *         observacion:
 *           type: string
 *           nullable: true
 *           description: Observaciones sobre la venta
 *           example: Venta completada con éxito
 *         metodoPago:
 *           type: string
 *           enum: [EFECTIVO, TARJETA, TRANSFERENCIA, YAPE, PLIN]
 *           description: Método de pago utilizado
 *           example: EFECTIVO
 *         formaPago:
*           type: string
*           enum: ['CONTADO', 'CREDITO']
*           description: Forma de pago
*         tipoOperacion:
*           type: string
*           enum: [Venta interna, Exportación de Bienes, Ventas no domiciliados que no califican como exportación, Operación Sujeta a Detracción, Operación Sujeta a Detracción - Servicios de Transporte Carga, Operación Sujeta a Percepción, Compra interna]
*           description: Tipo de operación de la venta
*         codigoVin:
*           type: string
*           description: Código VIN del vehículo (si aplica)
 *           example: CONTADO
 *         moneda:
 *           type: string
 *           enum: ['PEN', 'USD']
 *           description: Moneda utilizada en la venta
 *           example: PEN
 *         xmlUrl:
 *           type: string
 *           nullable: true
 *           format: uri
 *           description: URL del archivo XML firmado generado por SUNAT
 *           example: "https://facturaciondirecta.com/XML/1234567.xml"
 *         cdrUrl:
 *           type: string
 *           nullable: true
 *           format: uri
 *           description: URL del archivo CDR (Constancia de Recepción) de SUNAT
 *           example: "https://facturaciondirecta.com/CDR/1234567.cdr"
 *         pdfUrl:
           type: string
           nullable: true
           format: uri
           description: URL del archivo PDF del comprobante
           example: "https://facturaciondirecta.com/PDF/1234567.pdf"
         ticketUrl:
           type: string
           nullable: true
           format: uri
           description: URL del archivo PDF del ticket (formato 80mm)
           example: "http://localhost:4000/files/B001-1-ticket.pdf"
         codigoHash:
 *           type: string
 *           nullable: true
 *           description: Código hash del comprobante electrónico
 *           example: "abc123xyz456"
 *         xmlBase64:
 *           type: string
 *           nullable: true
 *           description: Contenido del XML en Base64
 *         cdrBase64:
 *           type: string
 *           nullable: true
 *           description: Contenido del CDR en Base64
 *         estadoSunat:
 *           type: string
 *           enum: [PENDIENTE, ENVIADO, ACEPTADO, RECHAZADO, ERROR]
 *           description: Estado del envío a SUNAT
 *           example: PENDIENTE
 *         sunatError:
 *           type: string
 *           nullable: true
 *           description: Mensaje de error recibido de SUNAT si aplica
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de creación del registro
 *           example: 2023-01-01T10:30:00Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de la última actualización del registro
 *           example: 2023-01-01T10:30:00Z
 *       required:
 *         - sucursalId
 *         - usuarioId
 *         - tipoComprobante
 *         - serieComprobante
 *         - numeroComprobante
 *         - fechaVenta
 *         - subtotal
 *         - igv
 *         - total
 *         - estado
 *         - metodoPago
 *         - formaPago
 *         - moneda
 */


const Venta = sequelize.define('Venta', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  clienteId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Clientes',
      key: 'id'
    },
    comment: 'Puede ser nulo para ventas sin cliente registrado'
  },
  sucursalId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Sucursal',
      key: 'id'
    }
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Usuarios',
      key: 'id'
    }
  },
  tipoComprobante: {
    type: DataTypes.ENUM('FACTURA', 'BOLETA', 'NOTA_VENTA', 'COTIZACION', 'GUIA_REMISION'),
    allowNull: false
  },
  serieComprobante: {
    type: DataTypes.STRING,
    allowNull: false
  },
  numeroComprobante: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fechaVenta: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  fechaVencimiento: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha de vencimiento para pagos a crédito'
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  igv: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('COMPLETADA', 'ANULADA', 'PENDIENTE'),
    allowNull: false,
    defaultValue: 'COMPLETADA'
  },
  motivoAnulacion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  usuarioAnulacionId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Usuarios',
      key: 'id'
    }
  },
  fechaAnulacion: {
    type: DataTypes.DATE,
    allowNull: true
  },
  observacion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  metodoPago: {
    type: DataTypes.ENUM('EFECTIVO', 'TARJETA_DEBITO', 'TARJETA_CREDITO', 'TRANSFERENCIA', 'YAPE', 'PLIN','CONTRAENTREGA' ),
    allowNull: false
  },
  formaPago: {
    type: DataTypes.ENUM('CONTADO', 'CREDITO'),
    allowNull: false
  },
  moneda: {
    type: DataTypes.ENUM('PEN', 'USD'),
    allowNull: false
  },
  tipoOperacion: {
    type: DataTypes.ENUM('Venta interna', 'Exportación de Bienes', 'Ventas no domiciliados que no califican como exportación', 'Operación Sujeta a Detracción', 'Operación Sujeta a Detracción - Servicios de Transporte Carga', 'Operación Sujeta a Percepción', 'Compra interna'),
    allowNull: false,
    defaultValue: 'Venta interna',
    comment: 'Tipo de operación de la venta'
  },
  codigoVin: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Código VIN del vehículo (si aplica)'
  },
  tallerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Talleres',
      key: 'id'
    },
    comment: 'ID del taller asociado (si la venta proviene de un servicio de taller)'
  },


  // Campos para integración con SUNAT
  xmlUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'URL del XML firmado de SUNAT'
  },
   cdrUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'URL del CDR (Constancia de Recepción) de SUNAT'
  },
 pdfUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'URL del PDF del comprobante generado'
  },
  ticketUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'URL del PDF del ticket (formato 80mm)'
  },
  codigoHash: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Código hash del comprobante'
  },
  xmlBase64: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'XML en base64 del comprobante'
  },
  cdrBase64: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'CDR en base64 de SUNAT'
  },
  estadoSunat: {
    type: DataTypes.ENUM('PENDIENTE', 'ENVIANDO', 'ACEPTADO', 'RECHAZADO', 'ERROR'),
    allowNull: false,
    defaultValue: 'PENDIENTE',
    comment: 'Estado del envío a SUNAT'
  },
  sunatError: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Error devuelto por SUNAT si aplica'
  }
}, {
  timestamps: true,
  tableName: 'Ventas',
  freezeTableName: true
});

module.exports = Venta;