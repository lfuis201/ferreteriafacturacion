// src/services/sucursalService.js
import apiClient, { handleApiError } from './apiService';

// Obtener todas las sucursales
export const obtenerSucursales = async () => {
  try {
    const response = await apiClient.get('/sucursales');
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Obtener sucursales sin autenticación (para registro de SuperAdmin)
export const obtenerSucursalesPublico = async () => {
  try {
    const response = await apiClient.get('/sucursales/publico/lista');
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Obtener sucursal por ID
export const obtenerSucursalPorId = async (id) => {
  try {
    const response = await apiClient.get(`/sucursales/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Crear nueva sucursal
export const crearSucursal = async (sucursalData) => {
  try {
    const response = await apiClient.post('/sucursales', sucursalData);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Actualizar sucursal
export const actualizarSucursal = async (id, sucursalData) => {
  try {
    const response = await apiClient.patch(`/sucursales/${id}`, sucursalData);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Eliminar sucursal
export const eliminarSucursal = async (id) => {
  try {
    const response = await apiClient.delete(`/sucursales/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Asignar administrador a sucursal
export const asignarAdministrador = async (sucursalId, usuarioId) => {
  try {
    const response = await apiClient.post('/sucursales/asignar-administrador', {
      sucursalId,
      usuarioId
    });
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};