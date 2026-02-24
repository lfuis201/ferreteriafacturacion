// swagger.js
const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API del Sistema de Gestión de Ferretería',
    version: '1.0.0',
    description: 'Documentación de los endpoints del sistema de gestión de ferretería.',
  },
  servers: [
    {
      url: 'http://localhost:4000/api', // Puerto configurado en app.js
    },
  ],
  components: {
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          mensaje: {
            type: 'string',
            description: 'Mensaje de error',
            example: 'Error al abrir caja'
          },
          error: {
            type: 'string',
            description: 'Detalles del error',
            example: 'Cannot add or update a child row: a foreign key constraint fails'
          }
        }
      },
      Compra: {
        type: 'object',
        required: [
          'proveedorId',
          'sucursalId',
          'usuarioId',
          'tipoComprobante',
          'fechaCompra',
          'subtotal',
          'igv',
          'total'
        ],
        properties: {
          id: {
            type: 'integer',
            description: 'ID único de la compra',
            example: 1
          },
          proveedorId: {
            type: 'integer',
            description: 'ID del proveedor',
            example: 5
          },
          sucursalId: {
            type: 'integer',
            description: 'ID de la sucursal donde se realizó la compra',
            example: 1
          },
          usuarioId: {
            type: 'integer',
            description: 'ID del usuario que registró la compra',
            example: 95
          },
          tipoComprobante: {
            type: 'string',
            enum: ['FACTURA ELECTRÓNICA', 'BOLETA DE VENTA ELECTRONICA', 'NOTA DE CREDITO', 'NOTA DE DEBITO', 'GUÍA', 'NOTA DE VENTA', 'RECIBO POR HONORARIOS', 'SERVICIOS PÚBLICOS'],
            description: 'Tipo de comprobante de la compra',
            example: 'FACTURA ELECTRÓNICA'
          },
          serieComprobante: {
            type: 'string',
            description: 'Serie del comprobante (opcional)',
            example: 'F001'
          },
          numeroComprobante: {
            type: 'string',
            description: 'Número del comprobante (opcional)',
            example: '1234567'
          },
          fechaCompra: {
            type: 'string',
            format: 'date-time',
            description: 'Fecha y hora de la compra',
            example: '2023-01-01T00:00:00Z'
          },
          subtotal: {
            type: 'number',
            format: 'float',
            description: 'Subtotal de la compra (sin IGV)',
            example: 100.00
          },
          igv: {
            type: 'number',
            format: 'float',
            description: 'Impuesto al Valor Agregado (IGV)',
            example: 18.00
          },
          total: {
            type: 'number',
            format: 'float',
            description: 'Total de la compra (incluyendo IGV)',
            example: 118.00
          },
          estado: {
            type: 'string',
            enum: ['PENDIENTE', 'COMPLETADA', 'ANULADA'],
            description: 'Estado de la compra',
            example: 'COMPLETADA'
          },
          observacion: {
            type: 'string',
            description: 'Observaciones sobre la compra (opcional)',
            example: 'Compra de productos para stock inicial'
          },
          xmlOriginal: {
            type: 'string',
            description: 'XML original subido por el usuario (opcional)',
            example: "<?xml version='1.0' encoding='UTF-8'?>..."
          },
          cdrRespuesta: {
            type: 'string',
            description: 'CDR de respuesta de SUNAT (opcional)',
            example: "<?xml version='1.0' encoding='UTF-8'?>..."
          },
          pdfGenerado: {
            type: 'string',
            description: 'Ruta del archivo PDF generado (opcional)',
            example: '/files/compra-123.pdf'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Fecha y hora de creación del registro',
            example: '2023-01-01T00:00:00Z'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Fecha y hora de última actualización del registro',
            example: '2023-01-01T00:00:00Z'
          }
        },
        example: {
          id: 1,
          proveedorId: 5,
          sucursalId: 1,
          usuarioId: 95,
          tipoComprobante: 'FACTURA',
          serieComprobante: 'F001',
          numeroComprobante: '1234567',
          fechaCompra: '2023-01-01T00:00:00Z',
          subtotal: 100.00,
          igv: 18.00,
          total: 118.00,
          estado: 'COMPLETADA',
          observacion: 'Compra de productos para stock inicial',
          xmlOriginal: "<?xml version='1.0' encoding='UTF-8'?>...",
          cdrRespuesta: "<?xml version='1.0' encoding='UTF-8'?>...",
          pdfGenerado: '/files/compra-123.pdf'
        }
      }
    },
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.js', './src/models/*.js'], // Ajustado a la estructura del proyecto
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;