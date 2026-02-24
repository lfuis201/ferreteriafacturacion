const xml2js = require('xml2js');
const fs = require('fs');
const path = require('path');
const sunatService = require('./sunatService');
const inventarioAutoService = require('./inventarioAutoService');

/**
 * Servicio para procesar archivos XML de compras
 */
class XmlProcessingService {
  /**
   * Procesa un archivo XML de compra completo
   * @param {string} xmlContent - Contenido del XML
   * @param {number} compraId - ID de la compra
   * @param {number} sucursalId - ID de la sucursal (opcional)
   * @param {number} usuarioId - ID del usuario (opcional)
   * @param {Object} transaction - Transacción de base de datos (opcional)
   * @returns {Promise<Object>} Resultado del procesamiento
   */
  async procesarXmlCompra(xmlContent, compraId, sucursalId = null, usuarioId = null, transaction = null) {
    try {
      // 1. Parsear XML
      const xmlParsed = await this.parsearXml(xmlContent);
      
      // 2. Extraer datos del comprobante
      const datosComprobante = this.extraerDatosComprobante(xmlParsed);
      
      // 3. Enviar a SUNAT para obtener CDR
      const resultadoSunat = await this.enviarASunat(xmlContent, datosComprobante);
      
      // 4. Generar PDF si el CDR es exitoso
      let pdfPath = null;
      if (resultadoSunat.exito) {
        pdfPath = await this.generarPdf(xmlParsed, resultadoSunat.cdr, compraId);
      }
      
      // 5. Procesar inventario automáticamente si se proporcionan sucursalId y usuarioId
      let resultadoInventario = null;
      if (resultadoSunat.exito && sucursalId && usuarioId && datosComprobante.items && datosComprobante.items.length > 0) {
        try {
          resultadoInventario = await inventarioAutoService.procesarInventarioDesdeXml(
            datosComprobante, 
            compraId, 
            sucursalId, 
            usuarioId,
            transaction
          );
        } catch (inventarioError) {
          console.error('Error procesando inventario automático:', inventarioError);
          // No fallar todo el proceso si hay error en inventario
        }
      }
      
      return {
        exito: true,
        datosComprobante,
        cdr: resultadoSunat.cdr,
        estadoSunat: resultadoSunat.estado,
        pdfPath,
        observaciones: resultadoSunat.observaciones || [],
        inventario: resultadoInventario
      };
    } catch (error) {
      return {
        exito: false,
        error: error.message,
        codigo: error.code || 'PROCESSING_ERROR'
      };
    }
  }

  /**
   * Parsea el contenido XML
   * @param {string} xmlContent - Contenido del XML
   * @returns {Promise<Object>} XML parseado
   */
  async parsearXml(xmlContent) {
    try {
      const parser = new xml2js.Parser({
        explicitArray: false,
        ignoreAttrs: false,
        mergeAttrs: true
      });
      return await parser.parseStringPromise(xmlContent);
    } catch (error) {
      throw new Error(`Error al parsear XML: ${error.message}`);
    }
  }

  /**
   * Extrae datos relevantes del comprobante
   * @param {Object} xmlParsed - XML parseado
   * @returns {Object} Datos del comprobante
   */
  extraerDatosComprobante(xmlParsed) {
    try {
      const rootKeys = Object.keys(xmlParsed);
      const rootNode = xmlParsed[rootKeys[0]];
      
      return {
        tipoComprobante: this.obtenerTipoComprobante(rootKeys[0]),
        numero: this.obtenerValor(rootNode, 'cbc:ID'),
        fecha: this.obtenerValor(rootNode, 'cbc:IssueDate'),
        moneda: this.obtenerValor(rootNode, 'cbc:DocumentCurrencyCode') || 'PEN',
        proveedor: this.extraerDatosProveedor(rootNode),
        cliente: this.extraerDatosCliente(rootNode),
        totales: this.extraerTotales(rootNode),
        items: this.extraerItems(rootNode)
      };
    } catch (error) {
      throw new Error(`Error extrayendo datos del comprobante: ${error.message}`);
    }
  }

  /**
   * Determina el tipo de comprobante basado en el nodo raíz
   * @param {string} rootNodeName - Nombre del nodo raíz
   * @returns {string} Tipo de comprobante
   */
  obtenerTipoComprobante(rootNodeName) {
    const tipos = {
      'Invoice': '01', // Factura
      'CreditNote': '07', // Nota de Crédito
      'DebitNote': '08', // Nota de Débito
      'DespatchAdvice': '09' // Guía de Remisión
    };
    
    for (const [key, value] of Object.entries(tipos)) {
      if (rootNodeName.includes(key)) {
        return value;
      }
    }
    
    return '01'; // Por defecto factura
  }

  /**
   * Extrae datos del proveedor
   * @param {Object} rootNode - Nodo raíz del XML
   * @returns {Object} Datos del proveedor
   */
  extraerDatosProveedor(rootNode) {
    const supplier = rootNode['cac:AccountingSupplierParty'];
    if (!supplier) return {};
    
    const party = supplier['cac:Party'];
    return {
      ruc: this.obtenerValor(party, 'cac:PartyIdentification.cbc:ID'),
      razonSocial: this.obtenerValor(party, 'cac:PartyName.cbc:Name'),
      direccion: this.obtenerValor(party, 'cac:PostalAddress.cbc:StreetName')
    };
  }

  /**
   * Extrae datos del cliente
   * @param {Object} rootNode - Nodo raíz del XML
   * @returns {Object} Datos del cliente
   */
  extraerDatosCliente(rootNode) {
    const customer = rootNode['cac:AccountingCustomerParty'];
    if (!customer) return {};
    
    const party = customer['cac:Party'];
    return {
      documento: this.obtenerValor(party, 'cac:PartyIdentification.cbc:ID'),
      nombre: this.obtenerValor(party, 'cac:PartyName.cbc:Name'),
      direccion: this.obtenerValor(party, 'cac:PostalAddress.cbc:StreetName')
    };
  }

  /**
   * Extrae totales del comprobante
   * @param {Object} rootNode - Nodo raíz del XML
   * @returns {Object} Totales
   */
  extraerTotales(rootNode) {
    const monetary = rootNode['cac:LegalMonetaryTotal'];
    const taxTotal = rootNode['cac:TaxTotal'];
    
    return {
      subtotal: parseFloat(this.obtenerValor(monetary, 'cbc:LineExtensionAmount') || 0),
      igv: parseFloat(this.obtenerValor(taxTotal, 'cbc:TaxAmount') || 0),
      total: parseFloat(this.obtenerValor(monetary, 'cbc:TaxInclusiveAmount') || 0)
    };
  }

  /**
   * Extrae items del comprobante
   * @param {Object} rootNode - Nodo raíz del XML
   * @returns {Array} Lista de items
   */
  extraerItems(rootNode) {
    const lines = rootNode['cac:InvoiceLine'] || rootNode['cac:CreditNoteLine'] || rootNode['cac:DebitNoteLine'];
    if (!lines) return [];
    
    const items = Array.isArray(lines) ? lines : [lines];
    
    return items.map(item => ({
      codigo: this.obtenerValor(item, 'cac:Item.cac:SellersItemIdentification.cbc:ID'),
      descripcion: this.obtenerValor(item, 'cac:Item.cbc:Description'),
      cantidad: parseFloat(this.obtenerValor(item, 'cbc:InvoicedQuantity') || 0),
      precioUnitario: parseFloat(this.obtenerValor(item, 'cac:Price.cbc:PriceAmount') || 0),
      valorVenta: parseFloat(this.obtenerValor(item, 'cbc:LineExtensionAmount') || 0)
    }));
  }

  /**
   * Envía XML a SUNAT para obtener CDR
   * @param {string} xmlContent - Contenido del XML
   * @param {Object} datosComprobante - Datos del comprobante
   * @returns {Promise<Object>} Resultado de SUNAT
   */
  async enviarASunat(xmlContent, datosComprobante) {
    try {
      // Verificar si está en modo desarrollo
      const modoDesarrollo = process.env.NODE_ENV === 'development' || process.env.SUNAT_MODO_SIMULACION === 'true';
      
      if (modoDesarrollo) {
        console.log('🔧 Modo desarrollo: usando simulación de SUNAT');
        return await this.simularRespuestaSunat(xmlContent, datosComprobante);
      }

      // Transformar datos del XML al formato esperado por SUNAT
      const datosSunat = this.transformarDatosParaSunat(datosComprobante);
      
      // Enviar a SUNAT usando el servicio real
      const respuestaSunat = await sunatService.enviarComprobante(datosSunat, datosComprobante.tipoComprobante);
      
      if (respuestaSunat.aceptado) {
        return {
          exito: true,
          cdr: respuestaSunat.cdrBase64 ? Buffer.from(respuestaSunat.cdrBase64, 'base64').toString('utf8') : null,
          estado: 'ACEPTADO',
          observaciones: [],
          urlCdr: respuestaSunat.cdrUrl,
          codigoHash: respuestaSunat.codigoHash
        };
      } else {
        return {
          exito: false,
          error: respuestaSunat.mensaje,
          estado: 'RECHAZADO',
          codigo: respuestaSunat.codigo
        };
      }
    } catch (error) {
      console.error('Error enviando a SUNAT:', error);
      return {
        exito: false,
        error: error.message,
        estado: 'ERROR_SUNAT'
      };
    }
  }

  /**
   * Transforma datos del comprobante al formato esperado por SUNAT
   * @param {Object} datosComprobante - Datos extraídos del XML
   * @returns {Object} Datos en formato SUNAT
   */
  transformarDatosParaSunat(datosComprobante) {
    // Obtener configuración de empresa desde variables de entorno
    const empresaConfig = {
      ruc: process.env.EMPRESA_RUC || '20600535022',
      razon_social: process.env.EMPRESA_RAZON_SOCIAL || 'FERRETERIA S.A.C.',
      nombre_comercial: process.env.EMPRESA_NOMBRE_COMERCIAL || 'FERRETERIA',
      domicilio_fiscal: process.env.EMPRESA_DIRECCION || 'Av. Principal 123',
      ubigeo: process.env.EMPRESA_UBIGEO || '150114',
      urbanizacion: process.env.EMPRESA_URBANIZACION || '',
      distrito: process.env.EMPRESA_DISTRITO || 'LIMA',
      provincia: process.env.EMPRESA_PROVINCIA || 'LIMA',
      departamento: process.env.EMPRESA_DEPARTAMENTO || 'LIMA',
      modo: process.env.SUNAT_MODO || '0',
      usu_secundario_produccion_user: process.env.SUNAT_USUARIO || '',
      usu_secundario_produccion_password: process.env.SUNAT_PASSWORD || ''
    };

    return {
      empresa: empresaConfig,
      cliente: {
        razon_social_nombres: datosComprobante.cliente.nombre || 'Cliente',
        numero_documento: datosComprobante.cliente.documento || '12345678',
        codigo_tipo_entidad: this.obtenerTipoDocumento(datosComprobante.cliente.documento),
        cliente_direccion: datosComprobante.cliente.direccion || 'Sin dirección'
      },
      venta: {
        serie: datosComprobante.serie || 'F001',
        numero: datosComprobante.numero || '1',
        fecha_emision: datosComprobante.fecha || new Date().toISOString().split('T')[0],
        hora_emision: new Date().toTimeString().split(' ')[0],
        fecha_vencimiento: '',
        moneda_id: datosComprobante.moneda === 'USD' ? '2' : '1',
        forma_pago_id: '1',
        total_gravada: (datosComprobante.totales.subtotal || 0).toString(),
        total_igv: (datosComprobante.totales.igv || 0).toString(),
        total_exonerada: '',
        total_inafecta: '',
        tipo_documento_codigo: this.obtenerCodigoTipoComprobante(datosComprobante.tipoComprobante),
        nota: 'Comprobante procesado desde XML'
      },
      items: this.transformarItems(datosComprobante.items || [])
    };
  }

  /**
   * Obtiene el tipo de documento según el número
   * @param {string} documento - Número de documento
   * @returns {string} Código del tipo de documento
   */
  obtenerTipoDocumento(documento) {
    if (!documento) return '1';
    return documento.length === 11 ? '6' : '1'; // 6: RUC, 1: DNI
  }

  /**
   * Obtiene el código del tipo de comprobante para SUNAT
   * @param {string} tipoComprobante - Tipo de comprobante
   * @returns {string} Código SUNAT
   */
  obtenerCodigoTipoComprobante(tipoComprobante) {
    const tipos = {
      'FACTURA': '01',
      'BOLETA': '03',
      'NOTA_CREDITO': '07',
      'NOTA_DEBITO': '08'
    };
    return tipos[tipoComprobante] || '01';
  }

  /**
   * Transforma items al formato SUNAT
   * @param {Array} items - Items del comprobante
   * @returns {Array} Items en formato SUNAT
   */
  transformarItems(items) {
    if (!items || items.length === 0) {
      return [{
        producto: 'Producto genérico',
        cantidad: '1',
        precio_base: '100',
        codigo_sunat: '-',
        codigo_producto: 'PROD001',
        codigo_unidad: 'NIU',
        tipo_igv_codigo: '10'
      }];
    }

    return items.map((item, index) => ({
      producto: item.descripcion || `Producto ${index + 1}`,
      cantidad: (item.cantidad || 1).toString(),
      precio_base: (item.precioUnitario || 0).toString(),
      codigo_sunat: '-',
      codigo_producto: item.codigo || `PROD${index + 1}`,
      codigo_unidad: 'NIU',
      tipo_igv_codigo: '10'
    }));
  }

  /**
   * Simula respuesta de SUNAT para desarrollo
   * @param {string} xmlContent - Contenido del XML
   * @param {Object} datosComprobante - Datos del comprobante
   * @returns {Promise<Object>} Respuesta simulada
   */
  async simularRespuestaSunat(xmlContent, datosComprobante) {
    // Simular tiempo de procesamiento
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const fechaActual = new Date().toISOString();
    const cdr = `<?xml version="1.0" encoding="UTF-8"?>
<ar:ApplicationResponse xmlns:ar="urn:oasis:names:specification:ubl:schema:xsd:ApplicationResponse-2">
  <cbc:UBLVersionID xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">2.0</cbc:UBLVersionID>
  <cbc:ID xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">R-${datosComprobante.numero}</cbc:ID>
  <cbc:IssueDate xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">${fechaActual.split('T')[0]}</cbc:IssueDate>
  <cbc:ResponseCode xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">0</cbc:ResponseCode>
  <cbc:Note xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">El comprobante ${datosComprobante.numero} ha sido aceptado</cbc:Note>
</ar:ApplicationResponse>`;
    
    return {
      exito: true,
      cdr,
      estado: 'ACEPTADO',
      observaciones: []
    };
  }

  /**
   * Genera PDF del comprobante
   * @param {Object} xmlParsed - XML parseado
   * @param {string} cdr - CDR de SUNAT
   * @param {number} compraId - ID de la compra
   * @returns {Promise<string>} Ruta del PDF generado
   */
  async generarPdf(xmlParsed, cdr, compraId) {
    try {
      const pdfGeneratorService = require('./pdfGeneratorService');
      const datosComprobante = this.extraerDatosComprobante(xmlParsed);
      
      const pdfPath = await pdfGeneratorService.generarPdfCompra(datosComprobante, cdr, compraId);
      return pdfPath;
    } catch (error) {
      throw new Error(`Error generando PDF: ${error.message}`);
    }
  }

  /**
   * Obtiene un valor del objeto XML usando notación de puntos
   * @param {Object} obj - Objeto a buscar
   * @param {string} path - Ruta del valor
   * @returns {any} Valor encontrado
   */
  obtenerValor(obj, path) {
    if (!obj || !path) return null;
    
    const result = path.split('.').reduce((current, key) => {
      return current && current[key] ? current[key] : null;
    }, obj);
    
    // Si el resultado es un objeto con propiedades de texto, extraer el valor
    if (result && typeof result === 'object') {
      // Para elementos con texto directo
      if (result._) return result._;
      // Para elementos con solo texto
      if (typeof result === 'string') return result;
      // Para elementos con atributos y texto
      if (result['#text']) return result['#text'];
      // Si es un objeto simple con una propiedad de texto
      const keys = Object.keys(result);
      if (keys.length === 1 && typeof result[keys[0]] === 'string') {
        return result[keys[0]];
      }
    }
    
    return result;
  }
}

module.exports = new XmlProcessingService();