// src/services/vehiculoService.js
import apiClient, { handleApiError } from './apiService';

// Obtener todos los vehículos
export const obtenerVehiculos = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    if (filtros.nroPlacaId) params.append('placa', filtros.nroPlacaId);
    if (filtros.marcaVehiculo) params.append('marca', filtros.marcaVehiculo);
    if (filtros.modeloVehiculo) params.append('modelo', filtros.modeloVehiculo);
    
    const response = await apiClient.get(`/vehiculos?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Obtener vehículo por ID
export const obtenerVehiculoPorId = async (id) => {
  try {
    const response = await apiClient.get(`/vehiculos/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Crear nuevo vehículo
export const crearVehiculo = async (vehiculoData) => {
  try {
    const response = await apiClient.post('/vehiculos', vehiculoData);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Actualizar vehículo
export const actualizarVehiculo = async (id, vehiculoData) => {
  try {
    const response = await apiClient.put(`/vehiculos/${id}`, vehiculoData);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Eliminar vehículo
export const eliminarVehiculo = async (id) => {
  try {
    const response = await apiClient.delete(`/vehiculos/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Buscar vehículos
export const buscarVehiculos = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    if (filtros.nroPlacaId) params.append('placa', filtros.nroPlacaId);
    if (filtros.marcaVehiculo) params.append('marca', filtros.marcaVehiculo);
    if (filtros.modeloVehiculo) params.append('modelo', filtros.modeloVehiculo);
    
    const response = await apiClient.get(`/vehiculos/buscar?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};