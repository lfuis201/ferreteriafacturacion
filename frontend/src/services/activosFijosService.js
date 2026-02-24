 //aun no 
 // src/services/activosFijosService.js

/*
 import apiClient, { handleApiError } from './apiService';

// Obtener todos los activos fijos
export const obtenerActivosFijos = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
    if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);
    if (filtros.categoria) params.append('categoria', filtros.categoria);
    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.valorMinimo) params.append('valorMinimo', filtros.valorMinimo);
    if (filtros.valorMaximo) params.append('valorMaximo', filtros.valorMaximo);
    if (filtros.sucursalId) params.append('sucursalId', filtros.sucursalId);
    
    const response = await apiClient.get(`/activos-fijos?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Obtener reporte de activos fijos
export const obtenerReporteActivosFijos = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
    if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);
    if (filtros.categoria) params.append('categoria', filtros.categoria);
    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.valorMinimo) params.append('valorMinimo', filtros.valorMinimo);
    if (filtros.valorMaximo) params.append('valorMaximo', filtros.valorMaximo);
    if (filtros.sucursalId) params.append('sucursalId', filtros.sucursalId);
    
    const response = await apiClient.get(`/activos-fijos/reporte?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Obtener activo fijo por ID
export const obtenerActivoFijoPorId = async (id) => {
  try {
    const response = await apiClient.get(`/activos-fijos/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Crear nuevo activo fijo
export const crearActivoFijo = async (activoData) => {
  try {
    const response = await apiClient.post('/activos-fijos', activoData);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Actualizar activo fijo
export const actualizarActivoFijo = async (id, activoData) => {
  try {
    const response = await apiClient.patch(`/activos-fijos/${id}`, activoData);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Eliminar activo fijo
export const eliminarActivoFijo = async (id) => {
  try {
    const response = await apiClient.delete(`/activos-fijos/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Calcular depreciación de activo fijo
export const calcularDepreciacion = async (id) => {
  try {
    const response = await apiClient.post(`/activos-fijos/${id}/calcular-depreciacion`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Obtener categorías de activos fijos
export const obtenerCategoriasActivosFijos = async () => {
  try {
    const response = await apiClient.get('/activos-fijos/categorias');
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Exportar reporte a Excel
export const exportarReporteExcel = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
    if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);
    if (filtros.categoria) params.append('categoria', filtros.categoria);
    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.valorMinimo) params.append('valorMinimo', filtros.valorMinimo);
    if (filtros.valorMaximo) params.append('valorMaximo', filtros.valorMaximo);
    if (filtros.sucursalId) params.append('sucursalId', filtros.sucursalId);
    
    const response = await apiClient.get(`/activos-fijos/exportar/excel?${params.toString()}`, {
      responseType: 'blob'
    });
    
    // Crear URL para descargar el archivo
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reporte-activos-fijos-${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true, message: 'Reporte exportado exitosamente' };
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Exportar reporte a PDF
export const exportarReportePDF = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
    if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);
    if (filtros.categoria) params.append('categoria', filtros.categoria);
    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.valorMinimo) params.append('valorMinimo', filtros.valorMinimo);
    if (filtros.valorMaximo) params.append('valorMaximo', filtros.valorMaximo);
    if (filtros.sucursalId) params.append('sucursalId', filtros.sucursalId);
    
    const response = await apiClient.get(`/activos-fijos/exportar/pdf?${params.toString()}`, {
      responseType: 'blob'
    });
    
    // Crear URL para descargar el archivo
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reporte-activos-fijos-${new Date().toISOString().split('T')[0]}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true, message: 'Reporte exportado exitosamente' };
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};  */