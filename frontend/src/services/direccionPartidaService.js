// src/services/direccionPartidaService.js
import apiClient, { handleApiError } from './apiService';

// Listar direcciones de partida con filtros
export const obtenerDireccionesPartida = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    if (filtros.direccion) params.append('direccion', filtros.direccion);
    if (filtros.ubigeo) params.append('ubigeo', filtros.ubigeo);

    const response = await apiClient.get(`/direcciones-partida?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Obtener una dirección por ID
export const obtenerDireccionPartidaPorId = async (id) => {
  try {
    const response = await apiClient.get(`/direcciones-partida/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Crear nueva dirección de partida
export const crearDireccionPartida = async (payload) => {
  try {
    const response = await apiClient.post('/direcciones-partida', payload);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Actualizar dirección de partida
export const actualizarDireccionPartida = async (id, payload) => {
  try {
    const response = await apiClient.put(`/direcciones-partida/${id}`, payload);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Eliminar dirección de partida
export const eliminarDireccionPartida = async (id) => {
  try {
    const response = await apiClient.delete(`/direcciones-partida/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Buscar direcciones de partida
export const buscarDireccionesPartida = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    if (filtros.direccion) params.append('direccion', filtros.direccion);
    if (filtros.ubigeo) params.append('ubigeo', filtros.ubigeo);

    const response = await apiClient.get(`/direcciones-partida/buscar?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export default {
  obtenerDireccionesPartida,
  obtenerDireccionPartidaPorId,
  crearDireccionPartida,
  actualizarDireccionPartida,
  eliminarDireccionPartida,
  buscarDireccionesPartida,
};