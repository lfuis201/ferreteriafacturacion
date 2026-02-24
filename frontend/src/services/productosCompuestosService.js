import apiClient, { handleApiError } from './apiService';

const BASE_PATH = '/productos-compuestos';

export const listarProductosCompuestos = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    if (filtros.nombre) params.append('nombre', filtros.nombre);
    const res = await apiClient.get(`${BASE_PATH}?${params.toString()}`);
    return res.data.productos || [];
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const crearProductoCompuesto = async (payload) => {
  try {
    const res = await apiClient.post(BASE_PATH, payload);
    return res.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const actualizarProductoCompuesto = async (id, payload) => {
  try {
    const res = await apiClient.put(`${BASE_PATH}/${id}`, payload);
    return res.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const eliminarProductoCompuesto = async (id) => {
  try {
    const res = await apiClient.delete(`${BASE_PATH}/${id}`);
    return res.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export default {
  listarProductosCompuestos,
  crearProductoCompuesto,
  actualizarProductoCompuesto,
  eliminarProductoCompuesto,
};