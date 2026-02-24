// src/services/servicioService.js
import apiClient, { handleApiError } from './apiService';

export const obtenerServicios = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    if (filtros.categoriaId) params.append('categoriaId', filtros.categoriaId);
    if (filtros.nombre) params.append('nombre', filtros.nombre);
    if (filtros.sucursalId) params.append('sucursalId', filtros.sucursalId);

    const response = await apiClient.get(`/servicios?${params.toString()}`);
    return {
      servicios: response.data.servicios || [],
      data: response.data.servicios || []
    };
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const obtenerServicioPorId = async (id) => {
  try {
    const response = await apiClient.get(`/servicios/${id}`);
    return response.data.servicio;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const crearServicio = async (data) => {
  try {
    const response = await apiClient.post('/servicios', data);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const actualizarServicio = async (id, data) => {
  try {
    const response = await apiClient.put(`/servicios/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const eliminarServicio = async (id) => {
  try {
    const response = await apiClient.delete(`/servicios/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const servicioService = {
  obtenerServicios,
  obtenerServicioPorId,
  crearServicio,
  actualizarServicio,
  eliminarServicio
};

export default servicioService;