const axios = require('axios');
const { SUNAT_APIS } = require('../config/sunatConfig');

/**
 * Servicio para enviar comprobantes electrónicos a SUNAT usando la API de Lucode
 */
class LucodeService {
  /**
   * Envía un comprobante electrónico a SUNAT usando la API de Lucode
   * @param {Object} datosComprobante - Datos del comprobante
   * @param {string} tipoComprobante - Tipo de comprobante (FACTURA, BOLETA)
   * @returns {Promise<Object>} Respuesta de SUNAT
   */
  static async enviarComprobante(datosComprobante, tipoComprobante = 'FACTURA') {
    try {
      console.log(`Enviando ${tipoComprobante} a SUNAT usando API Lucode`);
      console.log("Datos enviados:", JSON.stringify(datosComprobante, null, 2));

      // Validar datos del comprobante
      this.validarDatosComprobante(datosComprobante);

      // Preparar datos para la API de Lucode
      const datosAPI = this.prepararDatosComprobante(datosComprobante);
      console.log("Datos preparados para API Lucode:", JSON.stringify(datosAPI, null, 2));

      // Verificar si tenemos token
      if (!SUNAT_APIS.LUCODE.token || SUNAT_APIS.LUCODE.token.trim() === "") {
        throw new Error("No se ha configurado el token de autenticación para la API de Lucode. Configure la variable de entorno LUCODE_TOKEN o actualice el valor en sunatConfig.js.");
      }

      // Enviar a la API de Lucode
      const response = await axios.post(
        SUNAT_APIS.LUCODE.baseURL + SUNAT_APIS.LUCODE.endpoint,
        datosAPI,
        {
          timeout: SUNAT_APIS.LUCODE.timeout,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${SUNAT_APIS.LUCODE.token}`,
            'User-Agent': 'Ferreteria-App/1.0'
          }
        }
      );

      console.log("Respuesta completa de Lucode:", JSON.stringify(response.data, null, 2));
      console.log("Status de respuesta:", response.status);
      console.log("Headers de respuesta:", response.headers);

      // Procesar respuesta
      if (response.data && response.data.success) {
        console.log("✅ Comprobante aceptado por SUNAT a través de Lucode");
        return this.normalizarRespuestaLucode(response.data);
      } else if (response.data && response.data.error) {
        console.log("❌ Error de la API Lucode:", response.data.error);
        throw new Error(`Error de API Lucode: ${response.data.error}`);
      } else {
        console.log("⚠️ Respuesta inesperada de la API Lucode");
        throw new Error("La API de Lucode retornó una respuesta inesperada. Verifique la configuración.");
      }
    } catch (error) {
      console.error("Error al enviar comprobante a SUNAT usando Lucode:", error.message);

      // Si es error de Axios, extraer más detalles
      if (error.response) {
        console.error("Respuesta de error:", error.response.data);
        console.error("Status:", error.response.status);

        // Manejo de errores específicos
        if (error.response.status === 401) {
          throw new Error("Token de autenticación inválido o expirado. Verifique su token de Lucode.");
        } else if (error.response.status === 400) {
          throw new Error("Datos del comprobante inválidos. Verifique los datos enviados.");
        } else if (error.response.status === 500) {
          throw new Error("Error interno en el servicio de Lucode. Intente más tarde.");
        }
      }

      throw new Error(`Error Lucode: ${error.message}`);
    }
  }

  /**
   * Método alias para mantener compatibilidad
   */
  static async enviarFactura(datosFactura) {
    return this.enviarComprobante(datosFactura, 'FACTURA');
  }

  /**
   * Valida los datos del comprobante antes de enviarla a SUNAT
   * @param {Object} datosComprobante - Datos del comprobante
   */
  static validarDatosComprobante(datosComprobante) {
    // Reutilizamos la validación del SUNATService
    const SUNATService = require('./SUNATService');
    return SUNATService.validarDatosComprobante(datosComprobante);
  }

  /**
   * Prepara los datos del comprobante para enviar a la API de Lucode
   * @param {Object} datosComprobante - Datos del comprobante
   * @returns {Object} Datos formateados para la API de Lucode
   */
  static prepararDatosComprobante(datosComprobante) {
    // Adaptamos el formato de datos para la API de Lucode
    // Nota: Este formato puede variar según la documentación de Lucode
    return {
      // Datos de la empresa
      empresa: {
        ruc: datosComprobante.empresa.ruc,
        razon_social: datosComprobante.empresa.razon_social,
        nombre_comercial: datosComprobante.empresa.nombre_comercial || "",
        direccion: datosComprobante.empresa.domicilio_fiscal,
        ubigeo: datosComprobante.empresa.ubigeo,
        distrito: datosComprobante.empresa.distrito,
        provincia: datosComprobante.empresa.provincia,
        departamento: datosComprobante.empresa.departamento,
        modo: datosComprobante.empresa.modo || "0",
      },
      // Datos del cliente
      cliente: {
        tipo_documento: datosComprobante.cliente.codigo_tipo_entidad,
        numero_documento: datosComprobante.cliente.numero_documento,
        razon_social: datosComprobante.cliente.razon_social_nombres,
        direccion: datosComprobante.cliente.cliente_direccion || ""
      },
      // Datos del comprobante
      comprobante: {
        tipo_documento: datosComprobante.venta.tipo_documento_codigo,
        serie: datosComprobante.venta.serie,
        numero: datosComprobante.venta.numero,
        fecha_emision: datosComprobante.venta.fecha_emision,
        hora_emision: datosComprobante.venta.hora_emision,
        fecha_vencimiento: datosComprobante.venta.fecha_vencimiento || "",
        moneda: datosComprobante.venta.moneda_id,
        forma_pago: datosComprobante.venta.forma_pago_id,
        total_gravada: datosComprobante.venta.total_gravada,
        total_igv: datosComprobante.venta.total_igv,
        total_exonerada: datosComprobante.venta.total_exonerada || "0",
        total_inafecta: datosComprobante.venta.total_inafecta || "0",
        observaciones: datosComprobante.venta.nota || ""
      },
      // Datos de los items
      items: datosComprobante.items.map(item => ({
        descripcion: item.producto,
        cantidad: item.cantidad.toString(),
        precio_unitario: item.precio_base.toString(),
        codigo_producto: item.codigo_producto || "",
        codigo_sunat: item.codigo_sunat || "-",
        unidad_medida: item.codigo_unidad || "NIU",
        tipo_igv: item.tipo_igv_codigo || "10"
      }))
    };
  }

  /**
   * Normaliza la respuesta de Lucode
   * @param {Object} datosLucode - Datos de respuesta de Lucode
   * @returns {Object} Respuesta normalizada
   */
  static normalizarRespuestaLucode(datosLucode) {
    // Adaptamos la respuesta de Lucode al formato esperado por nuestra aplicación
    return {
      aceptado: datosLucode.success === true,
      codigo: datosLucode.success ? "0" : "1",
      mensaje: datosLucode.message || "Comprobante procesado correctamente",
      xmlUrl: datosLucode.data?.xml_url || "",
      cdrUrl: datosLucode.data?.cdr_url || "",
      pdfUrl: datosLucode.data?.pdf_url || "",
      codigoHash: datosLucode.data?.codigo_hash || "",
      xmlBase64: datosLucode.data?.xml_base64 || "",
      cdrBase64: datosLucode.data?.cdr_base64 || "",
      fechaEnvio: new Date().toISOString()
    };
  }

  /**
   * Obtiene información sobre la API de Lucode
   * @returns {Object} Información de la API
   */
  static getAPIInfo() {
    return {
      nombre: "API de Facturación Electrónica Lucode",
      url: "https://apisunat.lucode.pe",
      estado: "Activa",
      tipo: "Freemium",
      limite: "Depende del plan contratado",
      documentacion: "https://apisunat.lucode.pe/docs",
      credenciales: "Requiere token de autenticación",
      monedasSoportadas: {
        "1": "PEN - Soles",
        "2": "USD - Dólares Americanos"
      }
    };
  }
}

module.exports = LucodeService;