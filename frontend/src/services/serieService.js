// src/services/serieService.js
import apiClient, { handleApiError } from './apiService';

// Listar series con filtros y paginación
export const obtenerSeries = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    if (filtros.filterBy) params.append('filterBy', filtros.filterBy);
    if (filtros.query) params.append('query', filtros.query);
    if (filtros.page) params.append('page', filtros.page);
    if (filtros.limit) params.append('limit', filtros.limit);

    const response = await apiClient.get(`/series?${params.toString()}`);
    return {
      series: response.data.data || [],
      total: response.data.total || 0,
      data: response.data.data || []
    };
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Obtener serie por ID
export const obtenerSeriePorId = async (id) => {
  try {
    const response = await apiClient.get(`/series/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Crear serie
export const crearSerie = async (data) => {
  try {
    const response = await apiClient.post('/series', data);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Actualizar serie
export const actualizarSerie = async (id, data) => {
  try {
    const response = await apiClient.put(`/series/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Eliminar serie
export const eliminarSerie = async (id) => {
  try {
    const response = await apiClient.delete(`/series/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const serieService = {
  obtenerSeries,
  obtenerSeriePorId,
  crearSerie,
  actualizarSerie,
  eliminarSerie
};

export default serieService;