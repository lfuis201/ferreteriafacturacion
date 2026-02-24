// src/services/configuracionService.js
import apiClient, { handleApiError } from './apiService';

// Listar configuraciones con filtros opcionales
export const listarConfiguraciones = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    if (filtros.categoria) params.append('categoria', filtros.categoria);
    if (filtros.activo !== undefined) params.append('activo', filtros.activo);
    const response = await apiClient.get(`/configuraciones?${params.toString()}`);
    return response.data.configuraciones || [];
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Obtener configuración por clave
export const obtenerConfiguracion = async (clave) => {
  try {
    const response = await apiClient.get(`/configuraciones/${encodeURIComponent(clave)}`);
    return response.data.configuracion;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Obtener solo el valor de una configuración
export const obtenerValorConfiguracion = async (clave, valorPorDefecto) => {
  try {
    const params = new URLSearchParams();
    if (valorPorDefecto !== undefined) params.append('valorPorDefecto', valorPorDefecto);
    const response = await apiClient.get(`/configuraciones/${encodeURIComponent(clave)}/valor?${params.toString()}`);
    return response.data.valor;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Crear o actualizar una configuración (POST idempotente según backend)
export const guardarConfiguracion = async (config) => {
  try {
    const response = await apiClient.post('/configuraciones', config);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Eliminar configuración por clave
export const eliminarConfiguracion = async (clave) => {
  try {
    const response = await apiClient.delete(`/configuraciones/${encodeURIComponent(clave)}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export default {
  listarConfiguraciones,
  obtenerConfiguracion,
  obtenerValorConfiguracion,
  guardarConfiguracion,
  eliminarConfiguracion,
};