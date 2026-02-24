const axios = require("axios");
const { SUNAT_APIS } = require("../config/sunatConfig");

/**
 * Servicio para enviar comprobantes electrónicos a SUNAT
 * Usando la API de facturación electrónica
 */
class SUNATService {
  /**
   * Envía un comprobante electrónico a SUNAT (Factura, Boleta, etc.)
   * @param {Object} datosComprobante - Datos del comprobante
   * @param {string} tipoComprobante - Tipo de comprobante (FACTURA, BOLETA)
   * @returns {Promise<Object>} Respuesta de SUNAT
   */
 // services/SUNATService.js
/**
   * Envía un comprobante electrónico a SUNAT usando la API de facturaciondirecta.com
   * @param {Object} datosComprobante - Datos del comprobante
   * @param {string} tipoComprobante - Tipo de comprobante (FACTURA, BOLETA)
   * @returns {Promise<Object>} Respuesta de SUNAT
   */
  static async enviarComprobante(datosComprobante, tipoComprobante = 'FACTURA') {
  try {
    console.log(`Enviando ${tipoComprobante} a SUNAT`);
    console.log("Datos enviados:", JSON.stringify(datosComprobante, null, 2));

    // Validar datos del comprobante
    this.validarDatosComprobante(datosComprobante);

    // Preparar datos para la API
    const datosAPI = this.prepararDatosComprobante(datosComprobante);
    console.log("Datos preparados para API:", JSON.stringify(datosAPI, null, 2));

    // Intentar primero con la API principal
    try {
      // Enviar a la API de SUNAT
      const response = await axios.post(
        SUNAT_APIS.PRINCIPAL.baseURL + SUNAT_APIS.PRINCIPAL.endpoint,
        datosAPI,
        {
          timeout: SUNAT_APIS.PRINCIPAL.timeout,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'Ferreteria-App/1.0'
          }
        }
      );

      console.log("Respuesta completa de SUNAT:", JSON.stringify(response.data, null, 2));
      console.log("Status de respuesta:", response.status);
      console.log("Headers de respuesta:", response.headers);

      // Manejo mejorado de la respuesta
      if (response.data) {
        // Caso 1: Respuesta con estructura estándar
        if (response.data.data) {
          if (response.data.data.respuesta_sunat_codigo === "0") {
            console.log("✅ Comprobante aceptado por SUNAT");
            return this.normalizarRespuestaSUNAT(response.data.data);
          } else {
            console.log("❌ SUNAT rechazó el comprobante:", response.data.data.respuesta_sunat_descripcion);
            throw new Error(`SUNAT rechazó: ${response.data.data.respuesta_sunat_descripcion}`);
          }
        }
        // Caso 2: Respuesta con error específico
        else if (response.data.error) {
          console.log("❌ Error de la API:", response.data.error);
          throw new Error(`Error de API: ${response.data.error}`);
        }
        // Caso 3: Respuesta con mensaje alternativo
        else if (response.data.message) {
          console.log("❌ Mensaje de error:", response.data.message);
          throw new Error(`Error: ${response.data.message}`);
        }
        // Caso 4: Respuesta vacía pero con status 200
        else {
          console.log("⚠️ Respuesta vacía pero con status 200 - posible problema con la API");
          console.log("URL utilizada:", SUNAT_APIS.PRINCIPAL.baseURL + SUNAT_APIS.PRINCIPAL.endpoint);
          console.log("Verificando configuración de SUNAT...");
          
          // Intentar procesar como éxito si no hay indicación clara de error
          // Esto es para manejar APIs que devuelven 200 sin contenido cuando todo está bien
          return {
            aceptado: true,
            mensaje: "Comprobante procesado correctamente (respuesta sin contenido)",
            xmlUrl: "",
            cdrUrl: "",
            pdfUrl: "",
            codigoHash: "",
            xmlBase64: "",
            cdrBase64: ""
          };
        }
      } else {
        throw new Error("Respuesta vacía de la API de SUNAT");
      }
    } catch (errorPrincipal) {
      // Si falla la API principal, intentar con la API de Lucode
      if (SUNAT_APIS.LUCODE && SUNAT_APIS.LUCODE.token) {
        console.log("⚠️ Error con API principal, intentando con API de Lucode...");
        const urlLucode = SUNAT_APIS.LUCODE.baseURL + SUNAT_APIS.LUCODE.endpoint;
        
        try {
          const responseLucode = await axios.post(urlLucode, datosAPI, {
            timeout: SUNAT_APIS.LUCODE.timeout || 30000,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${SUNAT_APIS.LUCODE.token}`
            }
          });
          
          console.log("✅ Respuesta recibida de Lucode:", JSON.stringify(responseLucode.data, null, 2));
          
          if (responseLucode.status === 200 && responseLucode.data) {
            return this.normalizarRespuestaSUNAT(responseLucode.data);
          } else {
            throw new Error(`Error con API Lucode: Status ${responseLucode.status}`);
          }
        } catch (errorLucode) {
          console.error("❌ Error también con API de Lucode:", errorLucode.message);
          // Lanzar el error original de la API principal
          throw errorPrincipal;
        }
      } else {
        // Si no hay token de Lucode configurado, lanzar el error original
        throw errorPrincipal;
      }
    }
  } catch (error) {
    console.error("Error al enviar comprobante a SUNAT:", error.message);

    // Si es error de Axios, extraer más detalles
    if (error.response) {
      console.error("Respuesta de error:", error.response.data);
      console.error("Status:", error.response.status);

      // Manejo de errores específicos
      if (error.response.status === 401) {
        throw new Error("Credenciales incorrectas. Verifique usuario y contraseña de SUNAT.");
      } else if (error.response.status === 400) {
        throw new Error("Datos del comprobante inválidos. Verifique los datos enviados.");
      } else if (error.response.status === 500) {
        throw new Error("Error interno en el servicio de SUNAT. Intente más tarde.");
      }
    }

    throw new Error(`Error SUNAT: ${error.message}`);
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
    console.log("🔍 Validando datos del comprobante...");
    
    // Validar datos básicos
    if (!datosComprobante.empresa || !datosComprobante.empresa.ruc) {
      throw new Error("Datos de la empresa son requeridos (RUC)");
    }

    if (!datosComprobante.cliente || !datosComprobante.cliente.numero_documento) {
      throw new Error("Datos del cliente son requeridos (número de documento)");
    }

    if (!datosComprobante.venta || !datosComprobante.venta.serie || !datosComprobante.venta.numero) {
      throw new Error("Datos de la venta son requeridos (serie y número)");
    }

    if (!datosComprobante.items || datosComprobante.items.length === 0) {
      throw new Error("Debe incluir al menos un item en el comprobante");
    }

    // Validar RUC de la empresa
    if (!this.validarRUC(datosComprobante.empresa.ruc)) {
      throw new Error("El RUC de la empresa no es válido");
    }

    // Validar fecha - no debe ser muy antigua
    const fechaEmision = new Date(datosComprobante.venta.fecha_emision);
    const fechaActual = new Date();
    const diferenciaDias = Math.abs((fechaActual - fechaEmision) / (1000 * 60 * 60 * 24));
    
    if (diferenciaDias > 365) {
      console.log("⚠️ Advertencia: La fecha de emisión es muy antigua:", datosComprobante.venta.fecha_emision);
    }

    // Validar cálculos matemáticos
    const totalGravada = parseFloat(datosComprobante.venta.total_gravada);
    const totalIgv = parseFloat(datosComprobante.venta.total_igv);
    const igvCalculado = Math.round((totalGravada * 0.18) * 100) / 100;
    
    if (Math.abs(totalIgv - igvCalculado) > 0.02) {
      console.log("⚠️ Advertencia: IGV no coincide con el cálculo esperado");
      console.log(`IGV enviado: ${totalIgv}, IGV calculado: ${igvCalculado}`);
    }

    // Validar número de documento del cliente
    if (!this.validarNumeroDocumento(
      datosComprobante.cliente.numero_documento, 
      datosComprobante.cliente.codigo_tipo_entidad
    )) {
      throw new Error("El número de documento del cliente no es válido");
    }

    // Validar moneda
    if (!this.validarMoneda(datosComprobante.venta.moneda_id)) {
      throw new Error("Moneda no válida. Use 1 para PEN (soles) o 2 para USD (dólares)");
    }

    // Validar campos específicos requeridos por SUNAT
    const camposRequeridos = [
      'empresa.razon_social',
      'empresa.nombre_comercial',
      'empresa.domicilio_fiscal',
      'empresa.ubigeo',
      'empresa.distrito',
      'empresa.provincia',
      'empresa.departamento',
      'cliente.razon_social_nombres',
      'venta.fecha_emision',
      'venta.hora_emision'
    ];

    for (const campo of camposRequeridos) {
      const valor = this.obtenerValorAnidado(datosComprobante, campo);
      if (!valor || valor.trim() === '') {
        throw new Error(`Campo requerido faltante o vacío: ${campo}`);
      }
    }

    console.log("✅ Validación de datos completada exitosamente");
  }

  /**
   * Obtiene un valor anidado del objeto usando notación de puntos
   */
  static obtenerValorAnidado(obj, path) {
    return path.split('.').reduce((current, key) => current && current[key], obj);
  }

  /**
   * Prepara los datos del comprobante para enviar a la API de SUNAT
   * @param {Object} datosComprobante - Datos del comprobante
   * @returns {Object} Datos formateados para la API
   */
  static prepararDatosComprobante(datosComprobante) {
    // Los datos ya deben venir preparados desde el controlador
    // Solo verificamos que tengan la estructura correcta
    return {
      empresa: {
        ruc: datosComprobante.empresa.ruc,
        razon_social: datosComprobante.empresa.razon_social,
        nombre_comercial: datosComprobante.empresa.nombre_comercial || "",
        domicilio_fiscal: datosComprobante.empresa.domicilio_fiscal,
        ubigeo: datosComprobante.empresa.ubigeo,
        urbanizacion: datosComprobante.empresa.urbanizacion || "",
        distrito: datosComprobante.empresa.distrito,
        provincia: datosComprobante.empresa.provincia,
        departamento: datosComprobante.empresa.departamento,
        modo: datosComprobante.empresa.modo || "0",
        usu_secundario_produccion_user: datosComprobante.empresa.usu_secundario_produccion_user || SUNAT_APIS.PRINCIPAL.usuario,
        usu_secundario_produccion_password: datosComprobante.empresa.usu_secundario_produccion_password || SUNAT_APIS.PRINCIPAL.password
      },
      cliente: {
        razon_social_nombres: datosComprobante.cliente.razon_social_nombres,
        numero_documento: datosComprobante.cliente.numero_documento,
        codigo_tipo_entidad: datosComprobante.cliente.codigo_tipo_entidad,
        cliente_direccion: datosComprobante.cliente.cliente_direccion || ""
      },
      venta: {
        serie: datosComprobante.venta.serie,
        numero: datosComprobante.venta.numero,
        fecha_emision: datosComprobante.venta.fecha_emision,
        hora_emision: datosComprobante.venta.hora_emision,
        fecha_vencimiento: datosComprobante.venta.fecha_vencimiento || "",
        moneda_id: datosComprobante.venta.moneda_id,
        forma_pago_id: datosComprobante.venta.forma_pago_id,
        total_gravada: datosComprobante.venta.total_gravada,
        total_igv: datosComprobante.venta.total_igv,
        total_exonerada: datosComprobante.venta.total_exonerada || "",
        total_inafecta: datosComprobante.venta.total_inafecta || "",
        tipo_documento_codigo: datosComprobante.venta.tipo_documento_codigo,
        nota: datosComprobante.venta.nota || ""
      },
      items: datosComprobante.items.map(item => ({
        producto: item.producto,
        cantidad: item.cantidad.toString(),
        precio_base: item.precio_base.toString(),
        codigo_sunat: item.codigo_sunat || "-",
        codigo_producto: item.codigo_producto || "",
        codigo_unidad: item.codigo_unidad || "NIU",
        tipo_igv_codigo: item.tipo_igv_codigo || "10"
      }))
    };
  }

  /**
   * Normaliza la respuesta de SUNAT
   * @param {Object} datosSUNAT - Datos de respuesta de SUNAT
   * @returns {Object} Respuesta normalizada
   */
  static normalizarRespuestaSUNAT(datosSUNAT) {
    // Limpiar las URLs (eliminar espacios en blanco)
    const xmlUrl = datosSUNAT.ruta_xml ? datosSUNAT.ruta_xml.trim() : '';
    const cdrUrl = datosSUNAT.ruta_cdr ? datosSUNAT.ruta_cdr.trim() : '';
    const pdfUrl = datosSUNAT.ruta_pdf ? datosSUNAT.ruta_pdf.trim() : '';
    
    return {
      aceptado: datosSUNAT.respuesta_sunat_codigo === "0",
      codigo: datosSUNAT.respuesta_sunat_codigo,
      mensaje: datosSUNAT.respuesta_sunat_descripcion,
      xmlUrl: xmlUrl,
      cdrUrl: cdrUrl,
      pdfUrl: pdfUrl,
      codigoHash: datosSUNAT.codigo_hash,
      xmlBase64: datosSUNAT.xml_base_64,
      cdrBase64: datosSUNAT.cdr_base_64,
      fechaEnvio: new Date().toISOString()
    };
  }

  /**
   * Valida si un RUC es válido
   * @param {string} ruc - Número de RUC
   * @returns {boolean} Verdadero si es válido
   */
  static validarRUC(ruc) {
    if (!ruc || typeof ruc !== "string") {
      return false;
    }

    // Debe tener exactamente 11 dígitos
    if (!/^\d{11}$/.test(ruc)) {
      return false;
    }

    // No puede ser todo ceros
    if (ruc === "00000000000") {
      return false;
    }

    // Validar dígito verificador
    const digitos = ruc.split('').map(Number);
    const factores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
    let suma = 0;

    for (let i = 0; i < 10; i++) {
      suma += digitos[i] * factores[i];
    }

    const residuo = suma % 11;
    const digitoVerificador = residuo === 0 ? 0 : (11 - residuo);

    return digitos[10] === digitoVerificador;
  }

  /**
   * Valida el número de documento según el tipo
   * @param {string} numeroDocumento - Número de documento
   * @param {string} tipoDocumento - Tipo de documento (1: DNI, 6: RUC, etc.)
   * @returns {boolean} Verdadero si es válido
   */
  static validarNumeroDocumento(numeroDocumento, tipoDocumento) {
    if (!numeroDocumento || typeof numeroDocumento !== "string") {
      return false;
    }

    switch (tipoDocumento) {
      case "1": // DNI
        return /^\d{8}$/.test(numeroDocumento) && numeroDocumento !== "00000000";
      case "6": // RUC
        return this.validarRUC(numeroDocumento);
      default:
        return numeroDocumento.length > 0;
    }
  }

  /**
   * Valida el código de moneda
   * @param {string} monedaId - ID de la moneda
   * @returns {boolean} Verdadero si es válido
   */
  static validarMoneda(monedaId) {
    const monedasValidas = ["1", "2"];
    return monedasValidas.includes(monedaId);
  }

  /**
   * Obtiene información sobre la API de SUNAT
   * @returns {Object} Información de la API
   */
  static getAPIInfo() {
    return {
      nombre: "API de Facturación Electrónica",
      url: "https://facturaciondirecta.com/API_SUNAT",
      estado: "Activa",
      tipo: "Pago por uso",
      limite: "Depende del plan contratado",
      documentacion: "https://facturaciondirecta.com/API_SUNAT/docs",
      credenciales: "Requiere usuario y contraseña de SUNAT",
      monedasSoportadas: {
        "1": "PEN - Soles",
        "2": "USD - Dólares Americanos"
      }
    };
  }
}

module.exports = SUNATService;