// src/services/resumenService.js
import apiClient, { handleApiError } from './apiService';

// Obtener todos los resúmenes con filtros y paginación
export const obtenerResumenes = async (filtros = {}) => {
  try {
    console.log('resumenService: Obteniendo resúmenes con filtros:', filtros);
    
    // Verificar token de autenticación
    const token = localStorage.getItem('token');
    console.log('resumenService: Token presente:', !!token);
    
    const params = new URLSearchParams();
    if (filtros.fechaEmision) params.append('fechaEmision', filtros.fechaEmision);
    if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
    if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);
    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.tipoComprobante) params.append('tipoComprobante', filtros.tipoComprobante);
    if (filtros.busqueda) params.append('busqueda', filtros.busqueda);
    if (filtros.page) params.append('page', filtros.page);
    if (filtros.limit) params.append('limit', filtros.limit);
    
    const url = `/resumenes?${params.toString()}`;
    console.log('resumenService: URL de solicitud:', url);
    
    const response = await apiClient.get(url);
    console.log('resumenService: Respuesta recibida:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('resumenService: Error al obtener resúmenes:', error);
    console.error('resumenService: Error response:', error.response?.data);
    throw new Error(handleApiError(error));
  }
};

// Obtener resumen por ID
export const obtenerResumenPorId = async (id) => {
  try {
    console.log('🌐 resumenService: Obteniendo resumen por ID:', id);
    const response = await apiClient.get(`/resumenes/${id}`);
    console.log('📦 resumenService: Respuesta del backend:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ resumenService: Error al obtener resumen:', error);
    throw new Error(handleApiError(error));
  }
};

// Crear nuevo resumen diario
export const crearResumen = async (resumenData) => {
  try {
    console.log('🌐 resumenService: Creando nuevo resumen:', resumenData);
    
    const response = await apiClient.post('/resumenes', resumenData);
    console.log('📦 resumenService: Resumen creado exitosamente:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('❌ resumenService: Error al crear resumen:', error);
    console.error('❌ resumenService: Error response:', error.response?.data);
    throw new Error(handleApiError(error));
  }
};

// Obtener estadísticas de resúmenes
export const obtenerEstadisticasResumenes = async (filtros = {}) => {
  try {
    console.log('🌐 resumenService: Obteniendo estadísticas de resúmenes:', filtros);
    
    const params = new URLSearchParams();
    if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
    if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);
    if (filtros.tipoComprobante) params.append('tipoComprobante', filtros.tipoComprobante);
    
    const url = `/resumenes/estadisticas?${params.toString()}`;
    console.log('resumenService: URL de estadísticas:', url);
    
    const response = await apiClient.get(url);
    console.log('📦 resumenService: Estadísticas obtenidas:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('❌ resumenService: Error al obtener estadísticas:', error);
    throw new Error(handleApiError(error));
  }
};

// Descargar resumen en formato específico
export const descargarResumen = async (id, formato = 'pdf') => {
  try {
    console.log(`🌐 resumenService: Descargando resumen ${id} en formato ${formato}`);
    
    const response = await apiClient.get(`/resumenes/${id}/descargar/${formato}`, {
      responseType: 'blob'
    });
    
    // Crear URL para descarga
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // Determinar nombre del archivo según formato
    const extension = formato === 'xml' ? 'xml' : formato === 'cdr' ? 'zip' : 'pdf';
    link.setAttribute('download', `resumen_${id}.${extension}`);
    
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    console.log('📦 resumenService: Descarga iniciada exitosamente');
    return { success: true, message: 'Descarga iniciada' };
  } catch (error) {
    console.error('❌ resumenService: Error al descargar resumen:', error);
    throw new Error(handleApiError(error));
  }
};

// Actualizar estado de resumen
export const actualizarEstadoResumen = async (id, estado) => {
  try {
    console.log(`🌐 resumenService: Actualizando estado del resumen ${id} a ${estado}`);
    
    const response = await apiClient.patch(`/resumenes/${id}/estado`, { estado });
    console.log('📦 resumenService: Estado actualizado:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('❌ resumenService: Error al actualizar estado:', error);
    throw new Error(handleApiError(error));
  }
};

// Obtener comprobantes para un rango de fechas (para el modal)
export const obtenerComprobantesPorFecha = async (fechaComprobantes) => {
  try {
    console.log('🌐 resumenService: Obteniendo comprobantes para fecha:', fechaComprobantes);
    
    const params = new URLSearchParams();
    params.append('fechaComprobantes', fechaComprobantes);
    
    const url = `/resumenes/comprobantes?${params.toString()}`;
    console.log('resumenService: URL de comprobantes:', url);
    
    const response = await apiClient.get(url);
    console.log('📦 resumenService: Comprobantes obtenidos:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('❌ resumenService: Error al obtener comprobantes:', error);
    throw new Error(handleApiError(error));
  }
};

export default {
  obtenerResumenes,
  obtenerResumenPorId,
  crearResumen,
  obtenerEstadisticasResumenes,
  descargarResumen,
  actualizarEstadoResumen,
  obtenerComprobantesPorFecha
};