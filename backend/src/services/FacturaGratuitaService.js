/**
 * Servicio para manejar facturas gratuitas según ejemplo de greenter.dev
 */
const SUNATService = require('./SUNATService');

class FacturaGratuitaService {
  /**
   * Prepara los datos para una factura gratuita
   * @param {Object} datosEmpresa - Datos de la empresa
   * @param {Object} datosCliente - Datos del cliente
   * @param {Object} datosVenta - Datos básicos de la venta
   * @param {Array} items - Items de la factura
   * @returns {Object} - Datos formateados para enviar a la API de SUNAT
   */
  prepararFacturaGratuita(datosEmpresa, datosCliente, datosVenta, items) {
    // Calcular totales para operaciones gratuitas
    const totalOperacionesGratuitas = items.reduce((total, item) => {
      return total + (parseFloat(item.valorGratuito) * parseFloat(item.cantidad));
    }, 0);

    // Calcular IGV gratuito (0 para operaciones gratuitas)
    const totalIGVGratuito = 0;

    // Formatear datos para SUNAT según ejemplo de greenter.dev
    const datosComprobante = {
      // Datos de la empresa
      empresa: {
        ruc: datosEmpresa.ruc,
        razonSocial: datosEmpresa.razonSocial,
        nombreComercial: datosEmpresa.nombreComercial,
        direccion: datosEmpresa.direccion,
        ubigeo: datosEmpresa.ubigeo,
        urbanizacion: datosEmpresa.urbanizacion || '-',
        distrito: datosEmpresa.distrito,
        provincia: datosEmpresa.provincia,
        departamento: datosEmpresa.departamento
      },
      // Datos del cliente
      cliente: {
        tipoDoc: datosCliente.tipoDocumento,
        numDoc: datosCliente.numeroDocumento,
        rznSocial: datosCliente.razonSocial,
        direccion: datosCliente.direccion || '-',
        email: datosCliente.email || ''
      },
      // Datos de la venta
      comprobante: {
        tipDoc: '01', // Factura
        serie: datosVenta.serie,
        correlativo: datosVenta.numero,
        fechaEmision: datosVenta.fechaEmision,
        tipoMoneda: datosVenta.moneda,
        formaPago: datosVenta.formaPago,
        observacion: datosVenta.observacion,
        // Campos específicos para operaciones gratuitas según greenter.dev
        mtoOperGratuitas: totalOperacionesGratuitas.toFixed(2),
        mtoIGVGratuitas: totalIGVGratuito.toFixed(2),
        mtoIGV: totalIGVGratuito.toFixed(2),
        totalImpuestos: totalIGVGratuito.toFixed(2),
        valorVenta: totalOperacionesGratuitas.toFixed(2),
        subTotal: totalOperacionesGratuitas.toFixed(2),
        mtoImpVenta: totalOperacionesGratuitas.toFixed(2),
        // Tipo de operación para gratuitas según greenter.dev
        tipOperacion: datosVenta.tipo_operacion || '0501',
        // Leyenda obligatoria para operaciones gratuitas
        leyendas: [
          {
            codigo: '1002',
            valor: 'TRANSFERENCIA GRATUITA DE UN BIEN Y/O SERVICIO PRESTADO GRATUITAMENTE'
          }
        ]
      },
      // Detalles de la venta (items)
      detalle: items.map(item => ({
        codProducto: item.codigo,
        unidad: item.unidadMedida,
        descripcion: item.nombre,
        cantidad: item.cantidad,
        mtoValorUnitario: item.valorGratuito,
        mtoValorGratuito: item.mto_valor_gratuito || item.valorGratuito,
        mtoValorVenta: (parseFloat(item.valorGratuito) * parseFloat(item.cantidad)).toFixed(2),
        mtoBaseIgv: (parseFloat(item.valorGratuito) * parseFloat(item.cantidad)).toFixed(2),
        porcentajeIgv: 0,
        igv: 0,
        tipAfeIgv: item.tipo_igv_codigo || '9996', // Código para operaciones gratuitas
        totalImpuestos: 0,
        mtoPrecioUnitario: 0
      }))
    };

    return datosComprobante;
  }

  /**
   * Envía una factura gratuita a SUNAT
   * @param {Object} datosEmpresa - Datos de la empresa
   * @param {Object} datosCliente - Datos del cliente
   * @param {Object} datosVenta - Datos básicos de la venta
   * @param {Array} items - Items de la factura
   * @returns {Promise<Object>} - Respuesta de SUNAT
   */
  async enviarFacturaGratuita(datosEmpresa, datosCliente, datosVenta, items) {
    try {
      // Preparar datos para la factura gratuita
      const datosComprobante = this.prepararFacturaGratuita(datosEmpresa, datosCliente, datosVenta, items);
      
      console.log('Enviando factura gratuita a SUNAT:', JSON.stringify(datosComprobante, null, 2));
      
      // Usar únicamente la API principal de SUNAT
      console.log('Usando API SUNAT principal para factura gratuita');
      try {
        const respuestaSUNAT = await SUNATService.enviarFactura(datosComprobante);
        console.log('Factura gratuita enviada exitosamente con SUNAT');
        return respuestaSUNAT;
      } catch (errorSUNAT) {
        console.error('Error al enviar factura gratuita con SUNAT:', errorSUNAT.message);
        
        // Si la respuesta es vacía pero con status 200, intentamos procesar como éxito
        if (errorSUNAT.message && errorSUNAT.message.includes('respuesta vacía pero con status 200')) {
          console.log('Procesando respuesta vacía como éxito para factura gratuita');
          return {
            aceptado: true,
            mensaje: "Comprobante gratuito procesado correctamente (respuesta sin contenido)",
            xmlUrl: "",
            cdrUrl: "",
            pdfUrl: "",
            codigoHash: "",
            xmlBase64: "",
            cdrBase64: ""
          };
        }
        
        throw new Error(`No se pudo enviar la factura gratuita con SUNAT: ${errorSUNAT.message}`);
      }
    } catch (error) {
      console.error('Error general al enviar factura gratuita:', error.message);
      throw error;
    }
  }

  /**
   * Obtiene información sobre el servicio de facturas gratuitas
   * @returns {Object} - Información del servicio
   */
  getInfo() {
    return {
      nombre: "Servicio de Facturas Gratuitas",
      descripcion: "Permite generar facturas gratuitas para SUNAT según ejemplo de greenter.dev",
      tipoOperacion: "0501", // Código para operaciones gratuitas
      tiposIGV: {
        gratuito: "9996" // Código para operaciones gratuitas
      },
      leyendas: {
        transferencia_gratuita: {
          codigo: "1002",
          descripcion: "TRANSFERENCIA GRATUITA DE UN BIEN Y/O SERVICIO PRESTADO GRATUITAMENTE"
        }
      },
      ejemploItem: {
        nombre: "Producto de ejemplo",
        cantidad: 1,
        valorGratuito: 100.00, // Valor referencial del producto gratuito
        mto_valor_gratuito: 100.00, // Campo según greenter.dev
        tipo_igv_codigo: "9996" // Código para operaciones gratuitas
      }
    };
  }
}

// Exportar una instancia del servicio
module.exports = new FacturaGratuitaService();