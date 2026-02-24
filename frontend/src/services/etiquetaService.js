import apiClient, { handleApiError } from './apiService';

// Obtener productos para etiquetas con filtros
export const obtenerProductosParaEtiquetas = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filtros.categoriaId) params.append('categoriaId', filtros.categoriaId);
    if (filtros.sucursalId) params.append('sucursalId', filtros.sucursalId);
    if (filtros.almacenId) params.append('almacenId', filtros.almacenId);
    if (filtros.conStock) params.append('conStock', 'true');
    if (filtros.buscar) params.append('buscar', filtros.buscar);

    const response = await apiClient.get(`/etiquetas/productos?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Exportar etiquetas en PDF
export const exportarEtiquetas = async (productos, configuracion, filtros = {}) => {
  try {
    const requestData = {
      productos,
      configuracion,
      filtros
    };

    const response = await apiClient.post('/etiquetas/exportar', requestData, {
      responseType: 'blob'
    });

    // Crear URL para descargar el archivo
    const blob = new Blob([response.data], {
      type: 'application/pdf'
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Obtener nombre del archivo desde los headers o usar uno por defecto
    const contentDisposition = response.headers['content-disposition'];
    let filename = `etiquetas_${new Date().toISOString().split('T')[0]}.pdf`;
    
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
    
    return { mensaje: 'Etiquetas exportadas exitosamente' };
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};