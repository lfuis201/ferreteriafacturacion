const axios = require("axios");
const { RENIEC_APIS } = require("../config/reniecConfig");
/**
 * Servicio para consultar datos de RENIEC y RUC
 * Usando exclusivamente apis.net.pe - API confiable y gratuita
 */
class RENIECService {
  /**
   * Consulta datos de una persona por DNI
   * @param {string} numeroDocumento - Número de DNI
   * @returns {Promise<Object>} Datos de la persona
   */
  static async consultarDNI(numeroDocumento) {
    return await this.consultarPorDNI(numeroDocumento);
  }

  /**
   * Consulta datos de una empresa por RUC
   * @param {string} numeroDocumento - Número de RUC
   * @returns {Promise<Object>} Datos de la empresa
   */
  static async consultarRUC(numeroDocumento) {
    return await this.consultarPorRUC(numeroDocumento);
  }

  /**
   * Consulta datos de una persona por DNI
   * @param {string} numeroDocumento - Número de DNI
   * @returns {Promise<Object>} Datos de la persona
   */
  static async consultarPorDNI(numeroDocumento) {
    if (!numeroDocumento || numeroDocumento.length !== 8) {
      throw new Error("El DNI debe tener 8 dígitos");
    }
    try {
      const datos = await this.consultarAPIPrincipal(numeroDocumento, "DNI");
      if (datos) {
        console.log("Datos obtenidos de apis.net.pe exitosamente");
        return datos;
      }
    } catch (error) {
      console.log("Error al consultar apis.net.pe:", error.message);
      throw new Error("No se pudieron obtener datos de la API");
    }
  }
  /**
   * Consulta datos de una empresa por RUC
   * @param {string} numeroDocumento - Número de RUC
   * @returns {Promise<Object>} Datos de la empresa
   */
  static async consultarPorRUC(numeroDocumento) {
    if (!numeroDocumento || numeroDocumento.length !== 11) {
      throw new Error("El RUC debe tener 11 dígitos");
    }
    try {
      const datos = await this.consultarAPIPrincipal(numeroDocumento, "RUC");
      if (datos) {
        console.log("Datos obtenidos de apis.net.pe exitosamente");
        return datos;
      }
    } catch (error) {
      console.log("Error al consultar apis.net.pe:", error.message);
      throw new Error("No se pudieron obtener datos de la API");
    }
  }
  /**
   * Consulta la API principal (apis.net.pe)
   */
  static async consultarAPIPrincipal(numeroDocumento, tipoDocumento) {
    try {
      console.log(
        `Consultando ${tipoDocumento}: ${numeroDocumento} en apis.net.pe`
      );
      const apiConfig =
        tipoDocumento === "DNI" ? RENIEC_APIS.PRINCIPAL : RENIEC_APIS.RUC;
      const response = await axios.get(
        `${apiConfig.baseURL}${apiConfig.endpoint}`,
        {
          params: { numero: numeroDocumento },
          timeout: apiConfig.timeout,
          headers: {
            Accept: "application/json",
            "User-Agent": "Ferreteria-App/1.0",
          },
        }
      );
      console.log(
        "Respuesta de la API:",
        JSON.stringify(response.data, null, 2)
      );
      // Verificar si la respuesta tiene datos válidos
      if (tipoDocumento === "DNI") {
        if (
          response.data &&
          response.data.nombres &&
          response.data.apellidoPaterno
        ) {
          console.log("✅ Datos válidos encontrados en la respuesta");
          return this.normalizarDatosDNI(response.data);
        } else if (response.data && response.data.error) {
          // Si la API retorna un error
          throw new Error(response.data.error);
        } else {
          throw new Error("La API no retornó datos válidos del DNI");
        }
      } else if (tipoDocumento === "RUC") {
        if (
          response.data &&
          response.data.nombre &&
          response.data.numeroDocumento
        ) {
          console.log("✅ Datos válidos encontrados en la respuesta");
          return this.normalizarDatosRUC(response.data);
        } else if (response.data && response.data.error) {
          // Si la API retorna un error
          throw new Error(response.data.error);
        } else {
          throw new Error("La API no retornó datos válidos del RUC");
        }
      }
    } catch (error) {
      console.log("Error completo:", error);
      if (error.response) {
        // Error de respuesta HTTP
        console.log("Error HTTP:", error.response.status, error.response.data);
        if (error.response.status === 404) {
          throw new Error(`${tipoDocumento} no encontrado`);
        } else if (error.response.status === 429) {
          throw new Error("Demasiadas consultas. Intente más tarde");
        } else if (error.response.status === 400) {
          throw new Error(`${tipoDocumento} inválido o mal formateado`);
        } else {
          throw new Error(
            `Error de la API: ${error.response.status} - ${
              error.response.data?.message || "Error desconocido"
            }`
          );
        }
      } else if (error.code === "ECONNABORTED") {
        throw new Error("Timeout: La consulta tardó demasiado");
      } else if (error.code === "ENOTFOUND") {
        throw new Error(
          "No se puede conectar con la API. Verifique su conexión a internet"
        );
      } else {
        throw new Error(`Error de conexión: ${error.message}`);
      }
    }
  }
  /**
   * Normaliza los datos recibidos de la API para DNI
   */
  static normalizarDatosDNI(datos) {
    return {
      nombres: datos.nombres || "",
      apellidoPaterno: datos.apellidoPaterno || "",
      apellidoMaterno: datos.apellidoMaterno || "",
      direccion: datos.direccion || "",
      ubigeo: datos.ubigeo || "",
      distrito: datos.distrito || "",
      provincia: datos.provincia || "",
      departamento: datos.departamento || "",
    };
  }
  /**
   * Normaliza los datos recibidos de la API para RUC
   */
  static normalizarDatosRUC(datos) {
    return {
      nombre: datos.nombre || "",
      tipoDocumento: datos.tipoDocumento || "",
      numeroDocumento: datos.numeroDocumento || "",
      estado: datos.estado || "",
      condicion: datos.condicion || "",
      direccion: datos.direccion || "",
      ubigeo: datos.ubigeo || "",
      viaTipo: datos.viaTipo || "",
      viaNombre: datos.viaNombre || "",
      zonaCodigo: datos.zonaCodigo || "",
      zonaTipo: datos.zonaTipo || "",
      numero: datos.numero || "",
      interior: datos.interior || "",
      lote: datos.lote || "",
      dpto: datos.dpto || "",
      manzana: datos.manzana || "",
      kilometro: datos.kilometro || "",
      distrito: datos.distrito || "",
      provincia: datos.provincia || "",
      departamento: datos.departamento || "",
    };
  }
  /**
   * Valida si un DNI es válido
   */
  static validarDNI(numeroDocumento) {
    if (!numeroDocumento || typeof numeroDocumento !== "string") {
      return false;
    }
    // Debe tener exactamente 8 dígitos
    if (!/^\d{8}$/.test(numeroDocumento)) {
      return false;
    }
    // No puede ser todo ceros
    if (numeroDocumento === "00000000") {
      return false;
    }
    return true;
  }
  /**
   * Valida si un RUC es válido
   */
  static validarRUC(numeroDocumento) {
    if (!numeroDocumento || typeof numeroDocumento !== "string") {
      return false;
    }
    // Debe tener exactamente 11 dígitos
    if (!/^\d{11}$/.test(numeroDocumento)) {
      return false;
    }
    // No puede ser todo ceros
    if (numeroDocumento === "00000000000") {
      return false;
    }
    return true;
  }
  /**
   * Obtiene información sobre la API
   */
  static getAPIInfo() {
    return {
      nombre: "apis.net.pe",
      url: "https://api.apis.net.pe/v1",
      estado: "Activa",
      tipo: "Gratuita",
      limite: "1000 consultas por día",
      documentacion: "https://apis.net.pe/api-dni",
    };
  }
}
module.exports = RENIECService;
