// src/services/transportistaService.js
import apiClient, { handleApiError } from './apiService';

// Obtener todos los transportistas
export const obtenerTransportistas = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    if (filtros.nombre) params.append('nombre', filtros.nombre);
    if (filtros.numeroDocumento) params.append('numeroDocumento', filtros.numeroDocumento);
    if (filtros.tipoDocumento) params.append('tipoDocumento', filtros.tipoDocumento);
    
    const response = await apiClient.get(`/transportistas?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Obtener transportista por ID
export const obtenerTransportistaPorId = async (id) => {
  try {
    const response = await apiClient.get(`/transportistas/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Crear nuevo transportista
export const crearTransportista = async (transportistaData) => {
  try {
    const response = await apiClient.post('/transportistas', transportistaData);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Actualizar transportista
export const actualizarTransportista = async (id, transportistaData) => {
  try {
    const response = await apiClient.put(`/transportistas/${id}`, transportistaData);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Eliminar transportista
export const eliminarTransportista = async (id) => {
  try {
    const response = await apiClient.delete(`/transportistas/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Buscar transportistas
export const buscarTransportistas = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    const nombre = filtros.razonSocial || filtros.nombre;
    if (nombre) params.append('razonSocial', nombre);
    if (filtros.numeroDocumento) params.append('numeroDocumento', filtros.numeroDocumento);
    if (filtros.tipoDocumento) params.append('tipoDocumento', filtros.tipoDocumento);
    
    const response = await apiClient.get(`/transportistas/buscar?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Consultar RENIEC por DNI
export const consultarRENIEC = async (dni) => {
  try {
    const response = await apiClient.get(`/transportistas/reniec/DNI/${dni}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Consultar SUNAT por RUC
export const consultarSUNAT = async (ruc) => {
  try {
    const response = await apiClient.get(`/transportistas/reniec/RUC/${ruc}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
