import apiClient from './apiService';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'; 
//const API_URL = 'https://ferreteriafcturacion.onrender.com/api';

const guiaRemisionService = {
  // Obtener todas las guías de remisión
  obtenerGuias: async (filtros = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filtros.sucursalId) params.append('sucursalId', filtros.sucursalId);
      if (filtros.estado) params.append('estado', filtros.estado);
      if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
      if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);

      const response = await apiClient.get(`/guias-remision?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener guías de remisión:', error);
      throw error;
    }
  },

  // Obtener guía por ID
  obtenerGuiaRemisionPorId: async (id) => {
    try {
      const response = await apiClient.get(`/guias-remision/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener guía de remisión:', error);
      throw error;
    }
  },

  obtenerGuiaPorId: async (id) => {
    try {
      const response = await apiClient.get(`/guias-remision/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener guía de remisión:', error);
      throw error;
    }
  },

  // Crear nueva guía de remisión
  crearGuia: async (datosGuia) => {
    try {
      const response = await apiClient.post('/guias-remision', datosGuia);
      return response.data;
    } catch (error) {
      console.error('Error al crear guía de remisión:', error);
      throw error;
    }
  },

  // Alias para compatibilidad con FormularioGuiaCompleto
  crearGuiaRemision: async (datosGuia) => {
    return guiaRemisionService.crearGuia(datosGuia);
  },

  // Generar guía desde una venta
  generarDesdeVenta: async (ventaId, datosGuia) => {
    try {
      const response = await apiClient.post(
        `/guias-remision/venta/${ventaId}`,
        datosGuia
      );
      return response.data;
    } catch (error) {
      console.error('Error al generar guía desde venta:', error);
      throw error;
    }
  },

  // Anular guía de remisión
  anularGuia: async (id, motivoAnulacion) => {
    try {
      const response = await apiClient.put(
        `/guias-remision/${id}/anular`,
        { motivoAnulacion }
      );
      return response.data;
    } catch (error) {
      console.error('Error al anular guía de remisión:', error);
      throw error;
    }
  },

  // Actualizar guía de remisión
  actualizarGuiaRemision: async (id, datosGuia) => {
    try {
      const response = await apiClient.put(`/guias-remision/${id}`, datosGuia);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar guía de remisión:', error);
      throw error;
    }
  },

  // Obtener datos de venta para prellenar guía
  obtenerDatosVenta: async (ventaId) => {
    try {
      const response = await apiClient.get(`/ventas/${ventaId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener datos de venta:', error);
      throw error;
    }
  },

  // Verificar si una venta ya tiene guía de remisión
  verificarGuiaExistente: async (ventaId) => {
    try {
      const response = await apiClient.get(
        `/guias-remision?ventaId=${ventaId}`
      );
      return response.data.guiasRemision.length > 0;
    } catch (error) {
      console.error('Error al verificar guía existente:', error);
      return false;
    }
  },

  // Obtener guías de remisión por venta
  obtenerGuiasPorVenta: async (ventaId) => {
    try {
      const response = await apiClient.get(
        `/guias-remision?ventaId=${ventaId}`
      );
      return response.data.guiasRemision;
    } catch (error) {
      console.error('Error al obtener guías por venta:', error);
      throw error;
    }
  },

  // Descargar PDF de guía de remisión
  descargarPDF: async (id) => {
    try {
      const response = await apiClient.get(
        `/guias-remision/${id}/pdf`,
        { responseType: 'blob' }
      );
      
      // Crear URL del blob y descargar
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Obtener nombre del archivo desde headers o usar uno por defecto
      const contentDisposition = response.headers['content-disposition'];
      let filename = `guia_remision_${id}.pdf`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'PDF descargado exitosamente' };
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      throw error;
    }
  },

  // Obtener PDF de guía de remisión como Blob (para previsualización en modal)
  generarPdfGuia: async (id) => {
    try {
      const response = await apiClient.get(
        `/guias-remision/${id}/pdf`,
        { responseType: 'blob' }
      );
      return response.data; // Blob del PDF
    } catch (error) {
      console.error('Error al generar PDF de guía (blob):', error);
      throw error;
    }
  },

  // Alias: generar PDF (compatibilidad con componentes existentes)
  generarPDFGuia: async (id) => {
    // Reutiliza la implementación de descargarPDF
    return guiaRemisionService.descargarPDF(id);
  },

  // Cambiar estado de guía
  cambiarEstado: async (id, estado) => {
    try {
      const response = await apiClient.put(`/guias-remision/${id}/estado`, { estado });
      return response.data;
    } catch (error) {
      console.error('Error al cambiar estado de guía:', error);
      throw error;
    }
  },

  // Alias: cambiar estado (compatibilidad)
  cambiarEstadoGuia: async (id, estado) => {
    return guiaRemisionService.cambiarEstado(id, estado);
  },

  // Eliminar guía de remisión
  eliminarGuiaRemision: async (id) => {
    try {
      const response = await apiClient.delete(`/guias-remision/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar guía de remisión:', error);
      throw error;
    }
  },

  // Obtener estadísticas de guías
  obtenerEstadisticas: async (filtros = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filtros.sucursalId) params.append('sucursalId', filtros.sucursalId);
      if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
      if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);

      const response = await apiClient.get(`/guias-remision/estadisticas?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  },

  // Buscar guías de remisión
  buscarGuias: async (termino) => {
    try {
      const response = await apiClient.get(`/guias-remision/buscar?q=${encodeURIComponent(termino)}`);
      return response.data;
    } catch (error) {
      console.error('Error al buscar guías:', error);
      throw error;
    }
  },

  // Obtener guías por cliente
  obtenerGuiasPorCliente: async (clienteId) => {
    try {
      const response = await apiClient.get(`/guias-remision?clienteId=${clienteId}`);
      return response.data.guiasRemision;
    } catch (error) {
      console.error('Error al obtener guías por cliente:', error);
      throw error;
    }
  },

  // Obtener guías por sucursal
  obtenerGuiasPorSucursal: async (sucursalId) => {
    try {
      const response = await apiClient.get(`/guias-remision?sucursalId=${sucursalId}`);
      return response.data.guiasRemision;
    } catch (error) {
      console.error('Error al obtener guías por sucursal:', error);
      throw error;
    }
  },

  // Obtener guías por estado
  obtenerGuiasPorEstado: async (estado) => {
    try {
      const response = await apiClient.get(`/guias-remision?estado=${estado}`);
      return response.data.guiasRemision;
    } catch (error) {
      console.error('Error al obtener guías por estado:', error);
      throw error;
    }
  },

  // Obtener guías por rango de fechas
  obtenerGuiasPorFechas: async (fechaInicio, fechaFin) => {
    try {
      const response = await apiClient.get(
        `/guias-remision?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
      );
      return response.data.guiasRemision;
    } catch (error) {
      console.error('Error al obtener guías por fechas:', error);
      throw error;
    }
  },

  // Validar datos de guía antes de enviar
  validarDatosGuia: (datosGuia) => {
    const errores = [];
    
    if (!datosGuia.puntoPartida) {
      errores.push('El punto de partida es obligatorio');
    }
    
    if (!datosGuia.puntoLlegada) {
      errores.push('El punto de llegada es obligatorio');
    }
    
    if (!datosGuia.motivoTraslado) {
      errores.push('El motivo de traslado es obligatorio');
    }
    
    if (!datosGuia.detalles || datosGuia.detalles.length === 0) {
      errores.push('Debe agregar al menos un producto');
    }
    
    return {
      esValido: errores.length === 0,
      errores
    };
  }
};

export default guiaRemisionService;

// Crear guía de remisión específica para transportista
export const crearGuiaTransportista = async (datosGuia) => {
  try {
    const response = await fetch(`${API_URL}/guias-remision/transportista`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(datosGuia)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al crear la guía de remisión de transportista');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en crearGuiaTransportista:', error);
    throw error;
  }
};