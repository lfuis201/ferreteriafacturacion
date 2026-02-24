import api from './apiService';

// Servicio para Liquidación de Compras
// Endpoints base
const BASE_PATH = '/liquidacion-compras';

export const obtenerLiquidaciones = async (params = {}) => {
  try {
    const { data } = await api.get(BASE_PATH, { params });
    return data;
  } catch (error) {
    throw error;
  }
};

export const obtenerLiquidacionPorId = async (id) => {
  try {
    const { data } = await api.get(`${BASE_PATH}/${id}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const crearLiquidacion = async (payload) => {
  try {
    const { data } = await api.post(BASE_PATH, payload);
    return data;
  } catch (error) {
    throw error;
  }
};

export const actualizarLiquidacion = async (id, payload) => {
  try {
    const { data } = await api.put(`${BASE_PATH}/${id}`, payload);
    return data;
  } catch (error) {
    throw error;
  }
};

export const eliminarLiquidacion = async (id) => {
  try {
    const { data } = await api.delete(`${BASE_PATH}/${id}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const buscarLiquidaciones = async (filtros = {}) => {
  // filtros puede incluir: numero, fechaEmision, vendedor, estado, proveedorId
  try {
    const { data } = await api.get(`${BASE_PATH}/buscar`, { params: filtros });
    return data;
  } catch (error) {
    throw error;
  }
};

export default {
  obtenerLiquidaciones,
  obtenerLiquidacionPorId,
  crearLiquidacion,
  actualizarLiquidacion,
  eliminarLiquidacion,
  buscarLiquidaciones,
};