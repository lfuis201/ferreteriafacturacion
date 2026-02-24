import apiClient from './apiService';

// Obtener todas las presentaciones
export const obtenerPresentaciones = async (productoId = null) => {
  try {
    const params = productoId ? { productoId } : {};
    const response = await apiClient.get('/presentaciones', { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener presentaciones:', error);
    throw error;
  }
};

// Obtener presentación por ID
export const obtenerPresentacionPorId = async (id) => {
  try {
    const response = await apiClient.get(`/presentaciones/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener presentación:', error);
    throw error;
  }
};

// Crear nueva presentación
export const crearPresentacion = async (presentacionData) => {
  try {
    const response = await apiClient.post('/presentaciones', presentacionData);
    return response.data;
  } catch (error) {
    console.error('Error al crear presentación:', error);
    throw error;
  }
};

// Actualizar presentación
export const actualizarPresentacion = async (id, presentacionData) => {
  try {
    const response = await apiClient.put(`/presentaciones/${id}`, presentacionData);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar presentación:', error);
    throw error;
  }
};

// Función auxiliar para manejar errores de API
const handleApiError = (error) => {
  if (error.response) {
    return error.response.data?.mensaje || error.response.data?.error || 'Error en el servidor';
  } else if (error.request) {
    return 'Error de conexión con el servidor';
  } else {
    return error.message || 'Error desconocido';
  }
};

// Eliminar una presentación
export const eliminarPresentacion = async (id) => {
  try {
    const response = await apiClient.delete(`/presentaciones/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Importar presentaciones desde Excel
export const importarPresentacionesExcel = async (archivo) => {
  try {
    // Crear FormData para enviar el archivo
    const formData = new FormData();
    formData.append('archivo', archivo);

    // Usar apiClient con configuración correcta para multipart/form-data
    const response = await apiClient.post('/presentaciones/importar-excel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Exportar presentaciones a Excel
export const exportarPresentacionesExcel = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    if (filtros.productoId) params.append('productoId', filtros.productoId);
    if (filtros.fechaDesde) params.append('fechaDesde', filtros.fechaDesde);
    if (filtros.fechaHasta) params.append('fechaHasta', filtros.fechaHasta);

    console.log('URL de exportación:', `/presentaciones/exportar-excel?${params.toString()}`);
    console.log('Parámetros enviados:', Object.fromEntries(params));

    const response = await apiClient.get(`/presentaciones/exportar-excel?${params.toString()}`, {
      responseType: 'blob'
    });

    // Crear URL para descargar el archivo
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Obtener nombre del archivo desde los headers o usar uno por defecto
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'presentaciones.xlsx';
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/); 
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }
    
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return { mensaje: 'Archivo exportado exitosamente' };
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export default {
  obtenerPresentaciones,
  obtenerPresentacionPorId,
  crearPresentacion,
  actualizarPresentacion,
  eliminarPresentacion,
  importarPresentacionesExcel,
  exportarPresentacionesExcel
};