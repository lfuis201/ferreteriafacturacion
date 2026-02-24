import apiService from './apiService';

/**
 * Servicio para consultar datos de RENIEC desde el frontend
 */
class RENIECService {
  /**
   * Consulta datos de una persona por DNI
   * @param {string} numeroDocumento - Número de DNI
   * @returns {Promise<Object>} Datos de la persona
   */
  static async consultarPorDNI(numeroDocumento) {
    try {
      const response = await apiService.get(`/clientes/reniec/${numeroDocumento}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.mensaje || 'Error al consultar RENIEC');
    }
  }

  /**
   * Valida si un DNI es válido
   * @param {string} numeroDocumento - Número de DNI
   * @returns {boolean} True si es válido
   */
  static validarDNI(numeroDocumento) {
    if (!numeroDocumento || typeof numeroDocumento !== 'string') {
      return false;
    }

    // Debe tener exactamente 8 dígitos
    if (!/^\d{8}$/.test(numeroDocumento)) {
      return false;
    }

    // No puede ser todo ceros
    if (numeroDocumento === '00000000') {
      return false;
    }

    return true;
  }

  /**
   * Formatea un DNI agregando espacios cada 2 dígitos
   * @param {string} numeroDocumento - Número de DNI
   * @returns {string} DNI formateado
   */
  static formatearDNI(numeroDocumento) {
    if (!numeroDocumento) return '';
    return numeroDocumento.replace(/(\d{2})(?=\d)/g, '$1 ');
  }

  /**
   * Limpia un DNI removiendo espacios y caracteres no numéricos
   * @param {string} numeroDocumento - Número de DNI
   * @returns {string} DNI limpio
   */
  static limpiarDNI(numeroDocumento) {
    if (!numeroDocumento) return '';
    return numeroDocumento.replace(/\D/g, '');
  }
}

export default RENIECService;
