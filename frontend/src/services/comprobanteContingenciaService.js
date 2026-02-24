import apiService from './apiService';

const API_URL = '/api/ventas';

export const comprobanteContingenciaService = {
  // Obtener comprobantes de contingencia (usando endpoint de comprobantes no enviados)
  obtenerComprobantes: async (filtros = {}) => {
    try {
      const params = new URLSearchParams();
      
      // Agregar filtros a los parámetros
      if (filtros.sucursalId) params.append('sucursalId', filtros.sucursalId);
      if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
      if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);
      if (filtros.tipoComprobante && filtros.tipoComprobante !== '') {
        params.append('tipoComprobante', filtros.tipoComprobante);
      }
      if (filtros.serie) params.append('serie', filtros.serie);
      if (filtros.numero) params.append('numero', filtros.numero);
      if (filtros.busqueda) {
        // Para búsqueda general, usar el campo numero para buscar en serie y número
        params.append('numero', filtros.busqueda);
      }
      if (filtros.page) params.append('page', filtros.page);
      if (filtros.limit) params.append('limit', filtros.limit);

      const queryString = params.toString();
      const url = `/ventas/comprobantes-no-enviados${queryString ? `?${queryString}` : ''}`;
      
      console.log('🔍 Obteniendo comprobantes de contingencia:', url);
      
      const response = await apiService.get(url);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data || [],
          pagination: response.data.pagination || {},
          resumen: response.data.resumen || {},
          mensaje: response.data.mensaje || 'Comprobantes obtenidos exitosamente'
        };
      } else {
        throw new Error(response.data.mensaje || 'Error al obtener comprobantes');
      }
    } catch (error) {
      console.error('❌ Error en comprobanteContingenciaService.obtenerComprobantes:', error);
      throw {
        success: false,
        mensaje: error.response?.data?.mensaje || error.message || 'Error al obtener comprobantes de contingencia',
        data: [],
        pagination: {},
        resumen: {}
      };
    }
  },

  // Reenviar comprobante a SUNAT
  reenviarComprobante: async (comprobanteId) => {
    try {
      console.log('📤 Reenviando comprobante a SUNAT:', comprobanteId);
      
      const response = await apiService.post(`/ventas/${comprobanteId}/reenviar-sunat`);
      
      if (response.data.success) {
        return {
          success: true,
          mensaje: response.data.mensaje || 'Comprobante reenviado exitosamente'
        };
      } else {
        throw new Error(response.data.mensaje || 'Error al reenviar comprobante');
      }
    } catch (error) {
      console.error('❌ Error en comprobanteContingenciaService.reenviarComprobante:', error);
      throw {
        success: false,
        mensaje: error.response?.data?.mensaje || error.message || 'Error al reenviar comprobante'
      };
    }
  },

  // Obtener estado SUNAT de un comprobante
  obtenerEstadoSunat: async (comprobanteId) => {
    try {
      console.log('📊 Obteniendo estado SUNAT:', comprobanteId);
      
      const response = await apiService.get(`/ventas/${comprobanteId}/estado-sunat`);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          mensaje: response.data.mensaje || 'Estado obtenido exitosamente'
        };
      } else {
        throw new Error(response.data.mensaje || 'Error al obtener estado');
      }
    } catch (error) {
      console.error('❌ Error en comprobanteContingenciaService.obtenerEstadoSunat:', error);
      throw {
        success: false,
        mensaje: error.response?.data?.mensaje || error.message || 'Error al obtener estado SUNAT'
      };
    }
  },

  // Descargar XML del comprobante
  descargarXML: async (comprobanteId) => {
    try {
      console.log('📄 Descargando XML:', comprobanteId);
      
      const response = await apiService.get(`/ventas/${comprobanteId}/xml`, {
        responseType: 'blob'
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ Error en comprobanteContingenciaService.descargarXML:', error);
      throw {
        success: false,
        mensaje: error.response?.data?.mensaje || error.message || 'Error al descargar XML'
      };
    }
  },

  // Descargar CDR del comprobante
  descargarCDR: async (comprobanteId) => {
    try {
      console.log('📄 Descargando CDR:', comprobanteId);
      
      const response = await apiService.get(`/ventas/${comprobanteId}/cdr`, {
        responseType: 'blob'
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ Error en comprobanteContingenciaService.descargarCDR:', error);
      throw {
        success: false,
        mensaje: error.response?.data?.mensaje || error.message || 'Error al descargar CDR'
      };
    }
  },

  // Descargar PDF del comprobante
  descargarPDF: async (comprobanteId) => {
    try {
      console.log('📄 Descargando PDF:', comprobanteId);
      
      const response = await apiService.get(`/ventas/${comprobanteId}/pdf`, {
        responseType: 'blob'
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ Error en comprobanteContingenciaService.descargarPDF:', error);
      throw {
        success: false,
        mensaje: error.response?.data?.mensaje || error.message || 'Error al descargar PDF'
      };
    }
  }
};

export default comprobanteContingenciaService;