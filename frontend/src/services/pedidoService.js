import apiClient, { handleApiError } from './apiService';

export const listarPedidos = async () => {
  try {
    const { data } = await apiClient.get('/pedidos');
    return data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const crearPedido = async (payload) => {
  try {
    const { data } = await apiClient.post('/pedidos', payload);
    return data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};