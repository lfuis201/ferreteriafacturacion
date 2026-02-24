// src/services/loteService.js
import apiClient, { handleApiError } from './apiService';

// Listar lotes con filtros y paginación
export const obtenerLotes = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    if (filtros.filterBy) params.append('filterBy', filtros.filterBy);
    if (filtros.query) params.append('query', filtros.query);
    if (filtros.productoId) params.append('productoId', filtros.productoId);
    if (filtros.almacenId) params.append('almacenId', filtros.almacenId);
    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.page) params.append('page', filtros.page);
    if (filtros.limit) params.append('limit', filtros.limit);

    const response = await apiClient.get(`/lotes?${params.toString()}`);
    const { data = [], total = 0 } = response.data || {};
    return { data, total };
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Obtener lote por ID
export const obtenerLotePorId = async (id) => {
  try {
    const response = await apiClient.get(`/lotes/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Crear lote
export const crearLote = async (loteData) => {
  try {
    const response = await apiClient.post('/lotes', loteData);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Actualizar lote
export const actualizarLote = async (id, loteData) => {
  try {
    const response = await apiClient.put(`/lotes/${id}`, loteData);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Eliminar lote
export const eliminarLote = async (id) => {
  try {
    const response = await apiClient.delete(`/lotes/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export default {
  obtenerLotes,
  obtenerLotePorId,
  crearLote,
  actualizarLote,
  eliminarLote,
};