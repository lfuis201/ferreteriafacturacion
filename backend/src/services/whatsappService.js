const axios = require('axios');
const { ConfiguracionWhatsapp } = require('../models');
const fs = require('fs');
const path = require('path');

/**
 * Servicio para envío de comprobantes por WhatsApp
 * Usando APIs gratuitas de WhatsApp Business
 */
class WhatsappService {
  constructor() {
    this.timeout = 30000; // 30 segundos
    this.limiteDiario = 100; // Límite diario por defecto
    this.plantillasComprobantes = {
      factura: 'Se ha generado su factura electrónica',
      boleta: 'Se ha generado su boleta de venta',
      notaCredito: 'Se ha generado su nota de crédito',
      notaDebito: 'Se ha generado su nota de débito'
    };
  }

  /**
   * Obtener configuración WhatsApp para una sucursal
   */
  async obtenerConfiguracion(sucursalId) {
    const configuracion = await ConfiguracionWhatsapp.findOne({
      where: { sucursalId, activo: true }
    });

    if (!configuracion) {
      throw new Error('No se encontró configuración WhatsApp activa para esta sucursal');
    }

    return configuracion;
  }

  /**
   * Validar número de teléfono
   */
  validarNumeroTelefono(numero) {
    // Remover espacios y caracteres especiales
    const numeroLimpio = numero.replace(/[^0-9+]/g, '');
    
    // Validar formato peruano (+51 seguido de 9 dígitos)
    const formatoPeruano = /^\+51[0-9]{9}$/;
    const formatoSinCodigo = /^[0-9]{9}$/;
    
    if (formatoPeruano.test(numeroLimpio)) {
      return numeroLimpio;
    } else if (formatoSinCodigo.test(numeroLimpio)) {
      return `+51${numeroLimpio}`;
    } else {
      throw new Error('Número de teléfono inválido. Debe tener 9 dígitos.');
    }
  }

  /**
   * Generar mensaje de comprobante
   */
  generarMensajeComprobante(datosComprobante, tipoComprobante) {
    const {
      serie,
      numero,
      fechaEmision,
      receptor,
      totales,
      empresa
    } = datosComprobante;

    const tipoDoc = this.obtenerNombreTipoDocumento(tipoComprobante);
    const fecha = new Date(fechaEmision).toLocaleDateString('es-PE');
    const total = parseFloat(totales.total).toFixed(2);

    return `🧾 *${tipoDoc} Electrónica*\n\n` +
           `📋 *Número:* ${serie}-${numero}\n` +
           `📅 *Fecha:* ${fecha}\n` +
           `👤 *Cliente:* ${receptor.nombre}\n` +
           `💰 *Total:* S/ ${total}\n\n` +
           `🏢 *${empresa.razonSocial}*\n` +
           `📍 ${empresa.direccion}\n\n` +
           `✅ Su comprobante ha sido generado exitosamente.\n` +
           `📱 Puede descargar el PDF desde el enlace adjunto.\n\n` +
           `¡Gracias por su preferencia! 🙏`;
  }

  /**
   * Obtener nombre del tipo de documento
   */
  obtenerNombreTipoDocumento(tipoDocumento) {
    const tipos = {
      '01': 'Factura',
      '03': 'Boleta',
      '07': 'Nota de Crédito',
      '08': 'Nota de Débito'
    };
    return tipos[tipoDocumento] || 'Comprobante';
  }

  /**
   * Enviar mensaje de texto por WhatsApp
   */
  async enviarMensajeTexto(sucursalId, numeroTelefono, mensaje) {
    try {
      const configuracion = await this.obtenerConfiguracion(sucursalId);
      const numeroValidado = this.validarNumeroTelefono(numeroTelefono);
      
      // Verificar límite diario
      await this.verificarLimiteDiario(configuracion);
      
      // Preparar datos para la API
      const datosEnvio = {
        phone: numeroValidado,
        message: mensaje,
        apikey: configuracion.apiKey
      };
      
      // Enviar mensaje según el proveedor configurado
      let response;
      if (configuracion.proveedor === 'whatsapp-web-js') {
        response = await this.enviarConWhatsappWebJS(datosEnvio, configuracion);
      } else if (configuracion.proveedor === 'baileys') {
        response = await this.enviarConBaileys(datosEnvio, configuracion);
      } else if (configuracion.proveedor === 'ultramsg') {
        response = await this.enviarConUltraMsg(datosEnvio, configuracion);
      } else {
        response = await this.enviarConApiGenerica(datosEnvio, configuracion);
      }
      
      // Actualizar contador diario
      await this.actualizarContadorDiario(configuracion);
      
      return {
        success: true,
        mensaje: 'Mensaje enviado exitosamente',
        numeroDestino: numeroValidado,
        fechaEnvio: new Date(),
        response
      };
      
    } catch (error) {
      console.error('Error al enviar mensaje WhatsApp:', error);
      throw new Error(`Error al enviar WhatsApp: ${error.message}`);
    }
  }

  /**
   * Enviar con WhatsApp Web JS
   */
  async enviarConWhatsappWebJS(datosEnvio, configuracion) {
    const url = `${configuracion.urlApi}/send-message`;
    
    const response = await axios.post(url, {
      chatId: datosEnvio.phone + '@c.us',
      message: datosEnvio.message
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${datosEnvio.apikey}`
      },
      timeout: this.timeout
    });
    
    return response.data;
  }

  /**
   * Enviar con Baileys
   */
  async enviarConBaileys(datosEnvio, configuracion) {
    // Para Baileys gratuito, simulamos el envío exitoso
    if (configuracion.apiKey === 'BAILEYS_FREE') {
      console.log(`📱 [BAILEYS SIMULADO] Enviando mensaje a ${datosEnvio.phone}:`);
      console.log(`📝 Mensaje: ${datosEnvio.message}`);
      
      // Simular respuesta exitosa
      return {
        success: true,
        message: 'Mensaje enviado exitosamente (simulado)',
        phone: datosEnvio.phone,
        timestamp: new Date().toISOString(),
        provider: 'baileys-free'
      };
    }
    
    // Para configuraciones reales de Baileys
    const url = configuracion.apiUrl || `${configuracion.apiUrl}/send-text`;
    
    const response = await axios.post(url, {
      number: datosEnvio.phone,
      text: datosEnvio.message
    }, {
      headers: {
        'Content-Type': 'application/json',
        'apikey': datosEnvio.apikey
      },
      timeout: this.timeout
    });
    
    return response.data;
  }

  /**
   * Enviar con UltraMsg
   */
  async enviarConUltraMsg(datosEnvio, configuracion) {
    const url = `https://api.ultramsg.com/${configuracion.instanciaId}/messages/chat`;
    
    const response = await axios.post(url, {
      token: datosEnvio.apikey,
      to: datosEnvio.phone,
      body: datosEnvio.message
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      timeout: this.timeout
    });
    
    return response.data;
  }

  /**
   * Enviar con API genérica
   */
  async enviarConApiGenerica(datosEnvio, configuracion) {
    const response = await axios.post(configuracion.urlApi, {
      phone: datosEnvio.phone,
      message: datosEnvio.message,
      apikey: datosEnvio.apikey
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: this.timeout
    });
    
    return response.data;
  }

  /**
   * Enviar documento por WhatsApp
   */
  async enviarDocumento(sucursalId, numeroTelefono, rutaArchivo, nombreArchivo, mensaje = '') {
    try {
      const configuracion = await this.obtenerConfiguracion(sucursalId);
      const numeroValidado = this.validarNumeroTelefono(numeroTelefono);
      
      // Verificar que el archivo existe
      if (!fs.existsSync(rutaArchivo)) {
        throw new Error('El archivo no existe');
      }
      
      // Verificar límite diario
      await this.verificarLimiteDiario(configuracion);
      
      // Leer archivo y convertir a base64
      const archivoBuffer = fs.readFileSync(rutaArchivo);
      const archivoBase64 = archivoBuffer.toString('base64');
      
      // Preparar datos para envío
      const datosEnvio = {
        phone: numeroValidado,
        filename: nombreArchivo,
        document: archivoBase64,
        caption: mensaje,
        apikey: configuracion.apiKey
      };
      
      // Enviar documento según el proveedor configurado
      let response;
      if (configuracion.proveedor === 'whatsapp-web-js') {
        response = await this.enviarDocumentoWhatsappWebJS(datosEnvio, configuracion);
      } else if (configuracion.proveedor === 'baileys') {
        response = await this.enviarDocumentoBaileys(datosEnvio, configuracion);
      } else if (configuracion.proveedor === 'ultramsg') {
        response = await this.enviarDocumentoUltraMsg(datosEnvio, configuracion);
      } else {
        response = await this.enviarDocumentoApiGenerica(datosEnvio, configuracion);
      }
      
      // Actualizar contador diario
      await this.actualizarContadorDiario(configuracion);
      
      return {
        success: true,
        mensaje: 'Documento enviado exitosamente',
        numeroDestino: numeroValidado,
        nombreArchivo,
        fechaEnvio: new Date(),
        response
      };
      
    } catch (error) {
      console.error('Error al enviar documento WhatsApp:', error);
      throw new Error(`Error al enviar documento: ${error.message}`);
    }
  }

  /**
   * Enviar documento con WhatsApp Web JS
   */
  async enviarDocumentoWhatsappWebJS(datosEnvio, configuracion) {
    const url = `${configuracion.urlApi}/send-document`;
    
    const response = await axios.post(url, {
      chatId: datosEnvio.phone + '@c.us',
      document: datosEnvio.document,
      filename: datosEnvio.filename,
      caption: datosEnvio.caption
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${datosEnvio.apikey}`
      },
      timeout: this.timeout
    });
    
    return response.data;
  }

  /**
   * Enviar documento con Baileys
   */
  async enviarDocumentoBaileys(datosEnvio, configuracion) {
    // Para Baileys gratuito, simulamos el envío exitoso
    if (configuracion.apiKey === 'BAILEYS_FREE') {
      console.log(`📱 [BAILEYS SIMULADO] Enviando documento a ${datosEnvio.phone}:`);
      console.log(`📄 Archivo: ${datosEnvio.filename}`);
      console.log(`📝 Mensaje: ${datosEnvio.caption}`);
      
      // Simular respuesta exitosa
      return {
        success: true,
        message: 'Documento enviado exitosamente (simulado)',
        phone: datosEnvio.phone,
        filename: datosEnvio.filename,
        timestamp: new Date().toISOString(),
        provider: 'baileys-free'
      };
    }
    
    // Para configuraciones reales de Baileys
    const url = `${configuracion.apiUrl}/send-document`;
    
    const response = await axios.post(url, {
      number: datosEnvio.phone,
      document: datosEnvio.document,
      filename: datosEnvio.filename,
      caption: datosEnvio.caption
    }, {
      headers: {
        'Content-Type': 'application/json',
        'apikey': datosEnvio.apikey
      },
      timeout: this.timeout
    });
    
    return response.data;
  }

  /**
   * Enviar documento con UltraMsg
   */
  async enviarDocumentoUltraMsg(datosEnvio, configuracion) {
    const url = `https://api.ultramsg.com/${configuracion.instanciaId}/messages/document`;
    
    const response = await axios.post(url, {
      token: datosEnvio.apikey,
      to: datosEnvio.phone,
      document: datosEnvio.document,
      filename: datosEnvio.filename,
      caption: datosEnvio.caption
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      timeout: this.timeout
    });
    
    return response.data;
  }

  /**
   * Enviar documento con API genérica
   */
  async enviarDocumentoApiGenerica(datosEnvio, configuracion) {
    const response = await axios.post(`${configuracion.urlApi}/send-document`, {
      phone: datosEnvio.phone,
      document: datosEnvio.document,
      filename: datosEnvio.filename,
      caption: datosEnvio.caption,
      apikey: datosEnvio.apikey
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: this.timeout
    });
    
    return response.data;
  }

  /**
   * Enviar comprobante por WhatsApp
   */
  async enviarComprobante(sucursalId, datosComprobante, numeroTelefono, rutaPdf = null) {
    try {
      const mensaje = this.generarMensajeComprobante(datosComprobante, datosComprobante.tipoDocumento);
      
      // Enviar mensaje de texto primero
      const resultadoMensaje = await this.enviarMensajeTexto(sucursalId, numeroTelefono, mensaje);
      
      let resultadoDocumento = null;
      
      // Si hay PDF, enviarlo también
      if (rutaPdf && fs.existsSync(rutaPdf)) {
        const nombreArchivo = `${datosComprobante.serie}-${datosComprobante.numero}.pdf`;
        resultadoDocumento = await this.enviarDocumento(
          sucursalId, 
          numeroTelefono, 
          rutaPdf, 
          nombreArchivo,
          'Comprobante electrónico adjunto'
        );
      }
      
      return {
        success: true,
        mensaje: 'Comprobante enviado exitosamente por WhatsApp',
        numeroDestino: numeroTelefono,
        fechaEnvio: new Date(),
        resultadoMensaje,
        resultadoDocumento
      };
      
    } catch (error) {
      console.error('Error al enviar comprobante por WhatsApp:', error);
      throw new Error(`Error al enviar comprobante: ${error.message}`);
    }
  }

  /**
   * Verificar límite diario de envíos
   */
  async verificarLimiteDiario(configuracion) {
    const hoy = new Date().toDateString();
    
    if (configuracion.fechaUltimoEnvio !== hoy) {
      // Es un nuevo día, resetear contador
      configuracion.contadorDiario = 0;
      configuracion.fechaUltimoEnvio = hoy;
      await configuracion.save();
    }
    
    if (configuracion.contadorDiario >= configuracion.limiteDiario) {
      throw new Error(`Se ha alcanzado el límite diario de ${configuracion.limiteDiario} mensajes`);
    }
  }

  /**
   * Actualizar contador diario
   */
  async actualizarContadorDiario(configuracion) {
    configuracion.contadorDiario += 1;
    configuracion.fechaUltimoEnvio = new Date().toDateString();
    await configuracion.save();
  }

  /**
   * Obtener estadísticas de envío
   */
  async obtenerEstadisticas(sucursalId) {
    try {
      const configuracion = await this.obtenerConfiguracion(sucursalId);
      const hoy = new Date().toDateString();
      
      return {
        limiteDiario: configuracion.limiteDiario,
        enviosHoy: configuracion.fechaUltimoEnvio === hoy ? configuracion.contadorDiario : 0,
        enviosRestantes: configuracion.limiteDiario - (configuracion.fechaUltimoEnvio === hoy ? configuracion.contadorDiario : 0),
        fechaUltimoEnvio: configuracion.fechaUltimoEnvio,
        tipoApi: configuracion.tipoApi,
        estado: configuracion.activo ? 'Activo' : 'Inactivo'
      };
    } catch (error) {
      throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }
  }

  /**
   * Resetear contador diario
   */
  async resetearContadorDiario(sucursalId) {
    try {
      const configuracion = await this.obtenerConfiguracion(sucursalId);
      configuracion.contadorDiario = 0;
      configuracion.fechaUltimoEnvio = new Date().toDateString();
      await configuracion.save();
      
      return {
        success: true,
        mensaje: 'Contador diario reseteado exitosamente'
      };
    } catch (error) {
      throw new Error(`Error al resetear contador: ${error.message}`);
    }
  }

  /**
   * Probar conexión con la API de WhatsApp
   */
  async probarConexion(sucursalId) {
    try {
      const configuracion = await this.obtenerConfiguracion(sucursalId);
      
      // Intentar enviar un mensaje de prueba a un número de prueba
      const mensajePrueba = 'Mensaje de prueba - Configuración WhatsApp';
      const numeroPrueba = configuracion.numeroPrueba || '+51999999999';
      
      // Hacer una llamada de prueba a la API
      let response;
      if (configuracion.tipoApi === 'ultramsg') {
        const url = `https://api.ultramsg.com/${configuracion.instanciaId}/instance/status`;
        response = await axios.get(url, {
          params: { token: configuracion.tokenApi },
          timeout: 10000
        });
      } else {
        // Para otras APIs, hacer una llamada de estado
        response = await axios.get(`${configuracion.urlApi}/status`, {
          headers: {
            'Authorization': `Bearer ${configuracion.tokenApi}`
          },
          timeout: 10000
        });
      }
      
      return {
        success: true,
        mensaje: 'Conexión exitosa con la API de WhatsApp',
        tipoApi: configuracion.tipoApi,
        status: response.status,
        data: response.data
      };
      
    } catch (error) {
      return {
        success: false,
        mensaje: `Error de conexión: ${error.message}`,
        error: error.message
      };
    }
  }

  /**
   * Validar configuración de WhatsApp
   */
  validarConfiguracion(configuracion) {
    const errores = [];
    
    if (!configuracion.tokenApi) {
      errores.push('Token de API es requerido');
    }
    
    if (!configuracion.urlApi) {
      errores.push('URL de API es requerida');
    }
    
    if (!configuracion.tipoApi) {
      errores.push('Tipo de API es requerido');
    }
    
    if (configuracion.limiteDiario && configuracion.limiteDiario < 1) {
      errores.push('Límite diario debe ser mayor a 0');
    }
    
    if (errores.length > 0) {
      throw new Error(`Errores de configuración: ${errores.join(', ')}`);
    }
    
    return true;
  }
}

module.exports = new WhatsappService();