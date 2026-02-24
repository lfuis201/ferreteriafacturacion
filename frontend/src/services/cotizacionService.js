// src/services/cotizacionService.js
import apiClient, { handleApiError } from './apiService';

// Obtener todas las cotizaciones
export const obtenerCotizaciones = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    if (filtros.sucursalId) params.append('sucursalId', filtros.sucursalId);
    if (filtros.clienteId) params.append('clienteId', filtros.clienteId);
    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
    if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);
    
    const response = await apiClient.get(`/cotizaciones?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Obtener cotización por ID
export const obtenerCotizacionPorId = async (id) => {
  try {
    const response = await apiClient.get(`/cotizaciones/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Crear nueva cotización
export const crearCotizacion = async (cotizacionData) => {
  try {
    const response = await apiClient.post('/cotizaciones', cotizacionData);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Actualizar cotización
export const actualizarCotizacion = async (id, cotizacionData) => {
  try {
    const response = await apiClient.put(`/cotizaciones/${id}`, cotizacionData);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Eliminar cotización
export const eliminarCotizacion = async (id) => {
  try {
    const response = await apiClient.delete(`/cotizaciones/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Cambiar estado de cotización
export const cambiarEstadoCotizacion = async (id, estado, observacion) => {
  try {
    const body = observacion ? { estado, observacion } : { estado };
    const response = await apiClient.put(`/cotizaciones/${id}/estado`, body);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Alias más descriptivo para actualizar estado
export const actualizarEstadoCotizacion = cambiarEstadoCotizacion;

// Generar PDF de cotización
export const generarPDFCotizacion = async (id) => {
  try {
    const response = await apiClient.get(`/cotizaciones/${id}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Generar/obtener PDF de cotización indicando formato (A4 o ticket/80mm)
export const generarPDFCotizacionFormato = async (id, formato = 'A4') => {
  try {
    const response = await apiClient.get(`/cotizaciones/${id}/pdf`, {
      params: { formato },
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Duplicar cotización
export const duplicarCotizacion = async (id) => {
  try {
    const response = await apiClient.post(`/cotizaciones/${id}/duplicar`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};