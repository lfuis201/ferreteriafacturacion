import apiService from './apiService';

const anulacionesService = {
  // Obtener todas las anulaciones con filtros y paginación
  obtenerAnulaciones: async (filtros = {}) => {
    try {
      const params = new URLSearchParams();
      
      // Agregar filtros a los parámetros
      if (filtros.fechaInicio) {
        params.append('fechaInicio', filtros.fechaInicio);
      }
      if (filtros.fechaFin) {
        params.append('fechaFin', filtros.fechaFin);
      }
      if (filtros.tipo) {
        params.append('tipo', filtros.tipo);
      }
      if (filtros.estado) {
        params.append('estado', filtros.estado);
      }
      if (filtros.page) {
        params.append('page', filtros.page);
      }
      if (filtros.limit) {
        params.append('limit', filtros.limit);
      }

      const url = `/anulaciones${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await apiService.get(url);
      return response.data;
    } catch (error) {
      console.error('Error al obtener anulaciones:', error);
      throw error;
    }
  },

  // Obtener estadísticas de anulaciones
  obtenerEstadisticas: async (filtros = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filtros.fechaInicio) {
        params.append('fechaInicio', filtros.fechaInicio);
      }
      if (filtros.fechaFin) {
        params.append('fechaFin', filtros.fechaFin);
      }

      const url = `/anulaciones/estadisticas${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await apiService.get(url);
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas de anulaciones:', error);
      throw error;
    }
  },

  // Descargar documento anulado
  descargarDocumento: async (tipo, id, formato = 'pdf') => {
    try {
      const response = await apiService.get(`/anulaciones/descargar/${tipo}/${id}/${formato}`, {
        responseType: 'blob' // Para manejar archivos
      });
      
      // Crear un enlace de descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `documento_${tipo}_${id}.${formato}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return response.data;
    } catch (error) {
      console.error('Error al descargar documento:', error);
      throw error;
    }
  },

  // Buscar anulaciones por rango de fechas
  buscarPorFechas: async (fechaInicio, fechaFin, page = 1, limit = 10) => {
    try {
      return await anulacionesService.obtenerAnulaciones({
        fechaInicio,
        fechaFin,
        page,
        limit
      });
    } catch (error) {
      console.error('Error al buscar anulaciones por fechas:', error);
      throw error;
    }
  },

  // Buscar anulaciones por tipo de documento
  buscarPorTipo: async (tipo, page = 1, limit = 10) => {
    try {
      return await anulacionesService.obtenerAnulaciones({
        tipo,
        page,
        limit
      });
    } catch (error) {
      console.error('Error al buscar anulaciones por tipo:', error);
      throw error;
    }
  },

  // Obtener anulaciones de hoy
  obtenerAnulacionesHoy: async (page = 1, limit = 10) => {
    try {
      const hoy = new Date().toISOString().split('T')[0];
      return await anulacionesService.obtenerAnulaciones({
        fechaInicio: hoy,
        fechaFin: hoy,
        page,
        limit
      });
    } catch (error) {
      console.error('Error al obtener anulaciones de hoy:', error);
      throw error;
    }
  },

  // Obtener anulaciones de ayer
  obtenerAnulacionesAyer: async (page = 1, limit = 10) => {
    try {
      const ayer = new Date();
      ayer.setDate(ayer.getDate() - 1);
      const fechaAyer = ayer.toISOString().split('T')[0];
      
      return await anulacionesService.obtenerAnulaciones({
        fechaInicio: fechaAyer,
        fechaFin: fechaAyer,
        page,
        limit
      });
    } catch (error) {
      console.error('Error al obtener anulaciones de ayer:', error);
      throw error;
    }
  },

  // Obtener anulaciones de esta semana
  obtenerAnulacionesEstaSemana: async (page = 1, limit = 10) => {
    try {
      const hoy = new Date();
      const primerDiaSemana = new Date(hoy.setDate(hoy.getDate() - hoy.getDay()));
      const ultimoDiaSemana = new Date(hoy.setDate(hoy.getDate() - hoy.getDay() + 6));
      
      return await anulacionesService.obtenerAnulaciones({
        fechaInicio: primerDiaSemana.toISOString().split('T')[0],
        fechaFin: ultimoDiaSemana.toISOString().split('T')[0],
        page,
        limit
      });
    } catch (error) {
      console.error('Error al obtener anulaciones de esta semana:', error);
      throw error;
    }
  },

  // Obtener anulaciones de este mes
  obtenerAnulacionesEsteMes: async (page = 1, limit = 10) => {
    try {
      const hoy = new Date();
      const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
      
      return await anulacionesService.obtenerAnulaciones({
        fechaInicio: primerDiaMes.toISOString().split('T')[0],
        fechaFin: ultimoDiaMes.toISOString().split('T')[0],
        page,
        limit
      });
    } catch (error) {
      console.error('Error al obtener anulaciones de este mes:', error);
      throw error;
    }
  },

  // Obtener anulaciones del mes anterior
  obtenerAnulacionesMesAnterior: async (page = 1, limit = 10) => {
    try {
      const hoy = new Date();
      const primerDiaMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
      const ultimoDiaMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
      
      return await anulacionesService.obtenerAnulaciones({
        fechaInicio: primerDiaMesAnterior.toISOString().split('T')[0],
        fechaFin: ultimoDiaMesAnterior.toISOString().split('T')[0],
        page,
        limit
      });
    } catch (error) {
      console.error('Error al obtener anulaciones del mes anterior:', error);
      throw error;
    }
  }
};

export default anulacionesService;