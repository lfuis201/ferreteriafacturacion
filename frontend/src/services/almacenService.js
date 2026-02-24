import apiClient from './apiService';

// Función para manejar errores de la API
const handleApiError = (error) => {
  if (error.response) {
    return error.response.data.message || error.response.data.mensaje || 'Error en el servidor';
  } else if (error.request) {
    return 'No se pudo conectar con el servidor';
  } else {
    return 'Error inesperado';
  }
};

// Obtener todos los almacenes
export const obtenerAlmacenes = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    if (filtros.sucursalId) params.append('sucursalId', filtros.sucursalId);
    if (filtros.tipo) params.append('tipo', filtros.tipo);
    if (filtros.estado !== undefined) params.append('estado', filtros.estado);
    
    const response = await apiClient.get(`/almacenes?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Obtener almacén por ID
export const obtenerAlmacenPorId = async (id) => {
  try {
    const response = await apiClient.get(`/almacenes/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Crear nuevo almacén
export const crearAlmacen = async (almacenData) => {
  try {
    const response = await apiClient.post('/almacenes', almacenData);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Actualizar almacén
export const actualizarAlmacen = async (id, almacenData) => {
  try {
    const response = await apiClient.put(`/almacenes/${id}`, almacenData);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Eliminar almacén
export const eliminarAlmacen = async (id) => {
  try {
    const response = await apiClient.delete(`/almacenes/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Obtener inventario de un almacén
export const obtenerInventarioAlmacen = async (id) => {
  try {
    const response = await apiClient.get(`/almacenes/${id}/inventario`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Actualizar precios por almacén
export const actualizarPreciosAlmacen = async (id, datosActualizacion) => {
  try {
    const response = await apiClient.put(`/almacenes/${id}/actualizar-precios`, datosActualizacion);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export default {
  obtenerAlmacenes,
  obtenerAlmacenPorId,
  crearAlmacen,
  actualizarAlmacen,
  eliminarAlmacen,
  obtenerInventarioAlmacen,
  actualizarPreciosAlmacen
};