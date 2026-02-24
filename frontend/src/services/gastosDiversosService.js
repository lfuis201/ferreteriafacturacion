// src/services/gastosDiversosService.js
import apiClient, { handleApiError } from './apiService';

export const listarGastosDiversos = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    if (filtros.fecha) params.append('fecha', filtros.fecha);
    if (filtros.q) params.append('q', filtros.q);
    params.append('page', filtros.page ?? 1);
    params.append('limit', filtros.limit ?? 20);
    const res = await apiClient.get(`/gastos-diversos?${params.toString()}`);
    return res.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const obtenerGastoDiverso = async (id) => {
  try {
    const res = await apiClient.get(`/gastos-diversos/${id}`);
    return res.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const crearGastoDiverso = async (payload) => {
  try {
    const res = await apiClient.post('/gastos-diversos', payload);
    return res.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const actualizarGastoDiverso = async (id, payload) => {
  try {
    const res = await apiClient.put(`/gastos-diversos/${id}`, payload);
    return res.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const eliminarGastoDiverso = async (id) => {
  try {
    const res = await apiClient.delete(`/gastos-diversos/${id}`);
    return res.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};