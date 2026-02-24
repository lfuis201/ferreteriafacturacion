import apiClient, { handleApiError } from './apiService';

const basePath = '/marcas';

export async function getMarcas({ nombre = '', page = 1, limit = 10 } = {}) {
  try {
    const params = {};
    if (nombre) params.nombre = nombre;
    params.page = page;
    params.limit = limit;
    const { data } = await apiClient.get(basePath, { params });
    return data;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function getMarcaById(id) {
  try {
    const { data } = await apiClient.get(`${basePath}/${id}`);
    return data;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function createMarca(payload) {
  try {
    const { data } = await apiClient.post(basePath, payload);
    return data;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function updateMarca(id, payload) {
  try {
    const { data } = await apiClient.put(`${basePath}/${id}`, payload);
    return data;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function deleteMarca(id) {
  try {
    const { data } = await apiClient.delete(`${basePath}/${id}`);
    return data;
  } catch (error) {
    throw handleApiError(error);
  }
}