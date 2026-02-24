// src/services/categoriaService.js
import apiClient, { handleApiError } from './apiService';

// Obtener todas las categorías
export const obtenerCategorias = async () => {
  try {
    const response = await apiClient.get('/categorias');
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Obtener categoría por ID
export const obtenerCategoriaPorId = async (id) => {
  try {
    const response = await apiClient.get(`/categorias/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Crear nueva categoría
export const crearCategoria = async (categoriaData) => {
  try {
    const response = await apiClient.post('/categorias', categoriaData);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Actualizar categoría
export const actualizarCategoria = async (id, categoriaData) => {
  try {
    const response = await apiClient.put(`/categorias/${id}`, categoriaData);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Eliminar categoría
export const eliminarCategoria = async (id) => {
  try {
    const response = await apiClient.delete(`/categorias/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Buscar categorías
export const buscarCategorias = async (termino) => {
  try {
    const response = await apiClient.get(`/categorias/buscar?nombre=${encodeURIComponent(termino)}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};