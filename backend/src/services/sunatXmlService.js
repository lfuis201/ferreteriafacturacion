const axios = require('axios');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { ConfiguracionSunat } = require('../models');
const xml2js = require('xml2js');
const JSZip = require('jszip');

/**
 * Servicio para envío directo de comprobantes XML a SUNAT
 * usando certificados digitales y servicios web oficiales
 */
class SunatXmlService {
  constructor() {
    this.timeout = 30000; // 30 segundos
    this.urlsProduccion = {
      factura: 'https://e-factura.sunat.gob.pe/ol-ti-itcpfegem/billService',
      boleta: 'https://e-beta.sunat.gob.pe/ol-ti-itcpfegem/billService',
      guia: 'https://api-cpe.sunat.gob.pe/v1/contribuyente/gem'
    };
    this.urlsDemo = {
      factura: 'https://e-beta.sunat.gob.pe/ol-ti-itcpfegem-beta/billService',
      boleta: 'https://e-beta.sunat.gob.pe/ol-ti-itcpfegem-beta/billService',
      guia: 'https://gre-test.nubefact.com/ol-ti-itemision-guia-gem-beta/billService'
    };
  }

  /**
   * Obtener configuración SUNAT para una sucursal
   */
  async obtenerConfiguracion(sucursalId) {
    const configuracion = await ConfiguracionSunat.findOne({
      where: { sucursalId, activo: true }
    });

    if (!configuracion) {
      throw new Error('No se encontró configuración SUNAT activa para esta sucursal');
    }

    return configuracion;
  }

  /**
   * Validar certificado PFX
   */
  async validarCertificado(rutaCertificado, password) {
    try {
      if (!fs.existsSync(rutaCertificado)) {
        throw new Error('El archivo de certificado no existe');
      }

      const stats = fs.statSync(rutaCertificado);
      if (stats.size === 0) {
        throw new Error('El archivo de certificado está vacío');
      }

      // Verificar que el archivo sea un PFX válido
      const certificadoBuffer = fs.readFileSync(rutaCertificado);
      
      // Validación básica del formato PFX
      if (certificadoBuffer.length < 100) {
        throw new Error('El archivo de certificado parece estar corrupto');
      }

      return true;
    } catch (error) {
      throw new Error(`Error al validar certificado: ${error.message}`);
    }
  }

  /**
   * Generar XML de comprobante según estándar UBL 2.1
   */
  generarXmlComprobante(datosComprobante) {
    const {
      tipoDocumento,
      serie,
      numero,
      fechaEmision,
      horaEmision,
      emisor,
      receptor,
      items,
      totales,
      moneda = 'PEN'
    } = datosComprobante;

    // Determinar el tipo de documento UBL
    const tipoDocumentoUBL = this.obtenerTipoDocumentoUBL(tipoDocumento);
    const codigoTipoDocumento = this.obtenerCodigoTipoDocumento(tipoDocumento);

    // Generar XML según el tipo de documento
    if (tipoDocumento === '01') {
      return this.generarXmlFactura(datosComprobante);
    } else if (tipoDocumento === '03') {
      return this.generarXmlBoleta(datosComprobante);
    } else if (tipoDocumento === '07') {
      return this.generarXmlNotaCredito(datosComprobante);
    } else if (tipoDocumento === '08') {
      return this.generarXmlNotaDebito(datosComprobante);
    } else {
      throw new Error(`Tipo de documento no soportado: ${tipoDocumento}`);
    }
  }

  /**
   * Generar XML para Factura
   */
  generarXmlFactura(datosComprobante) {
    const {
      serie,
      numero,
      fechaEmision,
      horaEmision,
      emisor,
      receptor,
      items,
      totales,
      moneda = 'PEN'
    } = datosComprobante;

    const fechaISO = new Date(fechaEmision).toISOString().split('T')[0];
    const horaISO = horaEmision || new Date().toTimeString().split(' ')[0];

    return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
         xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2">
  <ext:UBLExtensions>
    <ext:UBLExtension>
      <ext:ExtensionContent>
        <!-- Firma digital se insertará aquí -->
      </ext:ExtensionContent>
    </ext:UBLExtension>
  </ext:UBLExtensions>
  
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:CustomizationID>2.0</cbc:CustomizationID>
  <cbc:ID>${serie}-${numero}</cbc:ID>
  <cbc:IssueDate>${fechaISO}</cbc:IssueDate>
  <cbc:IssueTime>${horaISO}</cbc:IssueTime>
  <cbc:InvoiceTypeCode listID="0101">01</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>${moneda}</cbc:DocumentCurrencyCode>
  
  <!-- Datos del emisor -->
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="6">${emisor.ruc}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyName>
        <cbc:Name><![CDATA[${emisor.nombreComercial || emisor.razonSocial}]]></cbc:Name>
      </cac:PartyName>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName><![CDATA[${emisor.razonSocial}]]></cbc:RegistrationName>
        <cac:RegistrationAddress>
          <cbc:ID>${emisor.ubigeo}</cbc:ID>
          <cbc:AddressTypeCode>0000</cbc:AddressTypeCode>
          <cac:AddressLine>
            <cbc:Line><![CDATA[${emisor.direccion}]]></cbc:Line>
          </cac:AddressLine>
          <cac:Country>
            <cbc:IdentificationCode>PE</cbc:IdentificationCode>
          </cac:Country>
        </cac:RegistrationAddress>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingSupplierParty>
  
  <!-- Datos del receptor -->
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="${receptor.tipoDocumento}">${receptor.numeroDocumento}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName><![CDATA[${receptor.nombre}]]></cbc:RegistrationName>
        <cac:RegistrationAddress>
          <cac:AddressLine>
            <cbc:Line><![CDATA[${receptor.direccion || '-'}]]></cbc:Line>
          </cac:AddressLine>
          <cac:Country>
            <cbc:IdentificationCode>PE</cbc:IdentificationCode>
          </cac:Country>
        </cac:RegistrationAddress>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingCustomerParty>
  
  <!-- Totales de impuestos -->
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="${moneda}">${totales.igv}</cbc:TaxAmount>
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="${moneda}">${totales.subtotal}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="${moneda}">${totales.igv}</cbc:TaxAmount>
      <cac:TaxCategory>
        <cbc:ID schemeID="UN/ECE 5305" schemeName="Tax Category Identifier" schemeAgencyName="United Nations Economic Commission for Europe">S</cbc:ID>
        <cbc:Percent>18.00</cbc:Percent>
        <cbc:TaxExemptionReasonCode>10</cbc:TaxExemptionReasonCode>
        <cac:TaxScheme>
          <cbc:ID schemeID="UN/ECE 5153" schemeAgencyID="6">1000</cbc:ID>
          <cbc:Name>IGV</cbc:Name>
          <cbc:TaxTypeCode>VAT</cbc:TaxTypeCode>
        </cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
  </cac:TaxTotal>
  
  <!-- Totales monetarios -->
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="${moneda}">${totales.subtotal}</cbc:LineExtensionAmount>
    <cbc:TaxInclusiveAmount currencyID="${moneda}">${totales.total}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="${moneda}">${totales.total}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  
  <!-- Líneas de detalle -->
  ${items.map((item, index) => this.generarLineaDetalle(item, index + 1, moneda)).join('')}
  
</Invoice>`;
  }

  /**
   * Generar línea de detalle para items
   */
  generarLineaDetalle(item, numeroLinea, moneda) {
    return `
  <cac:InvoiceLine>
    <cbc:ID>${numeroLinea}</cbc:ID>
    <cbc:InvoicedQuantity unitCode="${item.unidadMedida || 'NIU'}">${item.cantidad}</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="${moneda}">${item.valorVenta}</cbc:LineExtensionAmount>
    <cac:PricingReference>
      <cac:AlternativeConditionPrice>
        <cbc:PriceAmount currencyID="${moneda}">${item.precioUnitario}</cbc:PriceAmount>
        <cbc:PriceTypeCode listName="Tipo de Precio" listAgencyName="PE:SUNAT" listURI="urn:pe:gob:sunat:cpe:see:gem:catalogos:catalogo16">01</cbc:PriceTypeCode>
      </cac:AlternativeConditionPrice>
    </cac:PricingReference>
    <cac:TaxTotal>
      <cbc:TaxAmount currencyID="${moneda}">${item.igv}</cbc:TaxAmount>
      <cac:TaxSubtotal>
        <cbc:TaxableAmount currencyID="${moneda}">${item.valorVenta}</cbc:TaxableAmount>
        <cbc:TaxAmount currencyID="${moneda}">${item.igv}</cbc:TaxAmount>
        <cac:TaxCategory>
          <cbc:ID schemeID="UN/ECE 5305" schemeName="Tax Category Identifier" schemeAgencyName="United Nations Economic Commission for Europe">S</cbc:ID>
          <cbc:Percent>18.00</cbc:Percent>
          <cbc:TaxExemptionReasonCode listAgencyName="PE:SUNAT" listName="Afectacion del IGV" listURI="urn:pe:gob:sunat:cpe:see:gem:catalogos:catalogo07">10</cbc:TaxExemptionReasonCode>
          <cac:TaxScheme>
            <cbc:ID schemeID="UN/ECE 5153" schemeAgencyID="6">1000</cbc:ID>
            <cbc:Name>IGV</cbc:Name>
            <cbc:TaxTypeCode>VAT</cbc:TaxTypeCode>
          </cac:TaxScheme>
        </cac:TaxCategory>
      </cac:TaxSubtotal>
    </cac:TaxTotal>
    <cac:Item>
      <cbc:Description><![CDATA[${item.descripcion}]]></cbc:Description>
      <cac:SellersItemIdentification>
        <cbc:ID>${item.codigo || '-'}</cbc:ID>
      </cac:SellersItemIdentification>
      <cac:CommodityClassification>
        <cbc:ItemClassificationCode listID="UNSPSC" listAgencyName="GS1 US" listName="Item Classification">${item.codigoSunat || '10000000'}</cbc:ItemClassificationCode>
      </cac:CommodityClassification>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="${moneda}">${item.valorUnitario}</cbc:PriceAmount>
    </cac:Price>
  </cac:InvoiceLine>`;
  }

  /**
   * Generar XML para Boleta (similar a factura pero con algunas diferencias)
   */
  generarXmlBoleta(datosComprobante) {
    // La boleta usa la misma estructura que la factura pero con InvoiceTypeCode = 03
    const xmlFactura = this.generarXmlFactura(datosComprobante);
    return xmlFactura.replace('<cbc:InvoiceTypeCode listID="0101">01</cbc:InvoiceTypeCode>', 
                             '<cbc:InvoiceTypeCode listID="0101">03</cbc:InvoiceTypeCode>');
  }

  /**
   * Firmar XML con certificado digital (placeholder)
   */
  async firmarXml(xmlContent, rutaCertificado, passwordCertificado) {
    try {
      // Validar certificado
      await this.validarCertificado(rutaCertificado, passwordCertificado);

      // TODO: Implementar firma digital real usando xmldsig o similar
      // Por ahora retornamos el XML sin firmar como placeholder
      console.log('Firmando XML con certificado:', rutaCertificado);
      
      // En una implementación real, aquí se usaría una librería como:
      // - xmldsig
      // - node-forge
      // - xmlcrypto
      // para firmar digitalmente el XML con el certificado PFX
      
      return xmlContent;
    } catch (error) {
      throw new Error(`Error al firmar XML: ${error.message}`);
    }
  }

  /**
   * Crear ZIP con el XML firmado
   */
  async crearZip(nombreArchivo, xmlContent) {
    const zip = new JSZip();
    zip.file(`${nombreArchivo}.xml`, xmlContent);
    return await zip.generateAsync({ type: 'nodebuffer' });
  }

  /**
   * Crear envelope SOAP para SUNAT
   */
  crearSoapEnvelope(nombreArchivo, zipBuffer, configuracion) {
    const zipBase64 = zipBuffer.toString('base64');
      
      return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://service.sunat.gob.pe">
  <soap:Header>
    <!-- Autenticación mediante certificado digital -->
  </soap:Header>
  <soap:Body>
    <ser:sendBill>
      <fileName>${nombreArchivo}.zip</fileName>
      <contentFile>${zipBase64}</contentFile>
    </ser:sendBill>
  </soap:Body>
</soap:Envelope>`;
  }

  /**
   * Enviar comprobante XML a SUNAT
   */
  async enviarComprobante(sucursalId, datosComprobante) {
    try {
      // Obtener configuración
      const configuracion = await this.obtenerConfiguracion(sucursalId);
      
      // Validar datos del comprobante
      this.validarComprobante(datosComprobante);
      
      // Generar XML
      const xmlContent = this.generarXmlComprobante(datosComprobante);
      
      // Firmar XML
      const xmlFirmado = await this.firmarXml(
        xmlContent, 
        configuracion.rutaCertificado, 
        configuracion.passwordCertificado
      );
      
      // Preparar nombre del archivo
      const nombreArchivo = `${datosComprobante.emisor.ruc}-${datosComprobante.tipoDocumento}-${datosComprobante.serie}-${datosComprobante.numero}`;
      
      // Crear ZIP
      const zipBuffer = await this.crearZip(nombreArchivo, xmlFirmado);
      
      // Obtener URL de conexión
      const urlConexion = configuracion.obtenerUrlConexion();
      
      // Crear envelope SOAP
      const soapEnvelope = this.crearSoapEnvelope(nombreArchivo, zipBuffer, configuracion);
      
      // Enviar a SUNAT
      const response = await axios.post(urlConexion, soapEnvelope, {
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': 'urn:sendBill'
        },
        timeout: this.timeout
      });
      
      // Procesar respuesta
      const resultado = await this.procesarRespuestaSunat(response.data);
      
      return {
        success: true,
        ticket: resultado.ticket,
        mensaje: 'Comprobante enviado exitosamente a SUNAT',
        nombreArchivo,
        fechaEnvio: new Date(),
        xmlGenerado: xmlFirmado
      };
      
    } catch (error) {
      console.error('Error al enviar comprobante XML a SUNAT:', error);
      throw new Error(`Error al enviar comprobante: ${error.message}`);
    }
  }

  /**
   * Procesar respuesta SOAP de SUNAT
   */
  async procesarRespuestaSunat(responseXml) {
    try {
      const parser = new xml2js.Parser();
      const result = await parser.parseStringPromise(responseXml);
      
      const soapBody = result['soap:Envelope']['soap:Body'][0];
      
      if (soapBody['soap:Fault']) {
        const fault = soapBody['soap:Fault'][0];
        throw new Error(`Error SUNAT: ${fault.faultstring[0]}`);
      }
      
      const sendBillResponse = soapBody['ns2:sendBillResponse'][0];
      const ticket = sendBillResponse.ticket[0];
      
      return {
        ticket,
        estado: 'ENVIADO',
        mensaje: 'Comprobante enviado exitosamente'
      };
      
    } catch (error) {
      throw new Error(`Error al procesar respuesta SUNAT: ${error.message}`);
    }
  }

  /**
   * Consultar estado de comprobante por ticket
   */
  async consultarEstado(sucursalId, ticket) {
    try {
      const configuracion = await this.obtenerConfiguracion(sucursalId);
      const urlConexion = configuracion.obtenerUrlConexion();
      
      const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://service.sunat.gob.pe">
  <soap:Header>
    <!-- Autenticación mediante certificado digital -->
  </soap:Header>
  <soap:Body>
    <ser:getStatus>
      <ticket>${ticket}</ticket>
    </ser:getStatus>
  </soap:Body>
</soap:Envelope>`;
      
      const response = await axios.post(urlConexion, soapEnvelope, {
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': 'urn:getStatus'
        },
        timeout: this.timeout
      });
      
      return await this.procesarRespuestaEstado(response.data);
      
    } catch (error) {
      throw new Error(`Error al consultar estado: ${error.message}`);
    }
  }

  /**
   * Procesar respuesta de consulta de estado
   */
  async procesarRespuestaEstado(responseXml) {
    try {
      const parser = new xml2js.Parser();
      const result = await parser.parseStringPromise(responseXml);
      
      const soapBody = result['soap:Envelope']['soap:Body'][0];
      
      if (soapBody['soap:Fault']) {
        const fault = soapBody['soap:Fault'][0];
        throw new Error(`Error SUNAT: ${fault.faultstring[0]}`);
      }
      
      const getStatusResponse = soapBody['ns2:getStatusResponse'][0];
      const status = getStatusResponse.status[0];
      
      return {
        estado: status.statusCode[0],
        mensaje: status.content[0] || 'Consulta exitosa',
        fechaConsulta: new Date()
      };
      
    } catch (error) {
      throw new Error(`Error al procesar respuesta de estado: ${error.message}`);
    }
  }

  /**
   * Validar estructura de comprobante
   */
  validarComprobante(datosComprobante) {
    const errores = [];
    
    if (!datosComprobante.tipoDocumento) {
      errores.push('Tipo de documento es requerido');
    }
    
    if (!datosComprobante.serie) {
      errores.push('Serie es requerida');
    }
    
    if (!datosComprobante.numero) {
      errores.push('Número es requerido');
    }
    
    if (!datosComprobante.emisor || !datosComprobante.emisor.ruc) {
      errores.push('Datos del emisor son requeridos');
    }
    
    if (!datosComprobante.receptor || !datosComprobante.receptor.numeroDocumento) {
      errores.push('Datos del receptor son requeridos');
    }
    
    if (!datosComprobante.items || datosComprobante.items.length === 0) {
      errores.push('Al menos un item es requerido');
    }
    
    if (!datosComprobante.totales) {
      errores.push('Totales son requeridos');
    }
    
    if (errores.length > 0) {
      throw new Error(`Errores de validación: ${errores.join(', ')}`);
    }
    
    return true;
  }

  /**
   * Obtener tipo de documento UBL
   */
  obtenerTipoDocumentoUBL(tipoDocumento) {
    const tipos = {
      '01': 'Invoice',
      '03': 'Invoice',
      '07': 'CreditNote',
      '08': 'DebitNote'
    };
    return tipos[tipoDocumento] || 'Invoice';
  }

  /**
   * Obtener código de tipo de documento
   */
  obtenerCodigoTipoDocumento(tipoDocumento) {
    return tipoDocumento;
  }

  /**
   * Probar conexión con SUNAT
   */
  async probarConexion(sucursalId) {
    try {
      const configuracion = await this.obtenerConfiguracion(sucursalId);
      const urlConexion = configuracion.obtenerUrlConexion();
      
      // Validar que existe el certificado
      if (!configuracion.certificadoPfx) {
        throw new Error('No se encontró certificado PFX configurado');
      }
      
      // Validar el certificado
      await this.validarCertificado(configuracion.certificadoPfx, configuracion.passwordCertificado);
      
      // Crear un envelope SOAP simple para probar la conexión
      const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Header>
    <!-- Autenticación mediante certificado digital -->
  </soap:Header>
  <soap:Body>
    <ser:getStatus xmlns:ser="http://service.sunat.gob.pe">
      <ticket>test-connection</ticket>
    </ser:getStatus>
  </soap:Body>
</soap:Envelope>`;
      
      const response = await axios.post(urlConexion, soapEnvelope, {
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': 'urn:getStatus'
        },
        timeout: 10000 // 10 segundos para prueba
      });
      
      return {
        success: true,
        mensaje: 'Conexión exitosa con SUNAT',
        url: urlConexion,
        status: response.status
      };
      
    } catch (error) {
      return {
        success: false,
        mensaje: `Error de conexión: ${error.message}`,
        error: error.message
      };
    }
  }
}

module.exports = new SunatXmlService();