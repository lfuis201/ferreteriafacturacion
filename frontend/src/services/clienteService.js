// src/services/clienteService.js
import apiClient, { handleApiError } from './apiService';

// Obtener todos los clientes
export const obtenerClientes = async () => {
  try {
    const response = await apiClient.get('/clientes');
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Obtener cliente por ID
export const obtenerClientePorId = async (id) => {
  try {
    const response = await apiClient.get(`/clientes/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Crear nuevo cliente (con consulta automática de RENIEC para DNI y RUC)
export const crearCliente = async (clienteData) => {
  try {
    const response = await apiClient.post('/clientes', clienteData);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Actualizar cliente
export const actualizarCliente = async (id, clienteData) => {
  try {
    const response = await apiClient.put(`/clientes/${id}`, clienteData);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Eliminar cliente
export const eliminarCliente = async (id) => {
  try {
    const response = await apiClient.delete(`/clientes/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Buscar clientes
export const buscarClientes = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    if (filtros.nombre) params.append('nombre', filtros.nombre);
    if (filtros.tipoDocumento) params.append('tipoDocumento', filtros.tipoDocumento);
    if (filtros.numeroDocumento) params.append('numeroDocumento', filtros.numeroDocumento);
    
    const response = await apiClient.get(`/clientes/buscar?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Consultar datos de RENIEC por DNI o RUC
export const consultarRENIEC = async (tipoDocumento, numeroDocumento) => {
  try {
    const response = await apiClient.get(`/clientes/reniec/${tipoDocumento}/${numeroDocumento}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Obtener información de la API de RENIEC
export const obtenerInfoAPI = async () => {
  try {
    const response = await apiClient.get('/clientes/reniec/info');
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Exportación por defecto del objeto clienteService
export const clienteService = {
  obtenerClientes,
  obtenerClientePorId,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
  buscarClientes,
  consultarRENIEC,
  obtenerInfoAPI
};

export default clienteService;