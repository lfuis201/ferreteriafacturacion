import apiClient, { handleApiError } from './apiService';

// Obtener todos los conductores
export const obtenerConductores = async () => {
  try {
    const response = await apiClient.get('/conductores');
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Obtener conductor por ID
export const obtenerConductorPorId = async (id) => {
  try {
    const response = await apiClient.get(`/conductores/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Crear nuevo conductor (con consulta automática de RENIEC para DNI)
export const crearConductor = async (conductorData) => {
  try {
    const response = await apiClient.post('/conductores', conductorData);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Actualizar conductor
export const actualizarConductor = async (id, conductorData) => {
  try {
    const response = await apiClient.put(`/conductores/${id}`, conductorData);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Eliminar conductor
export const eliminarConductor = async (id) => {
  try {
    const response = await apiClient.delete(`/conductores/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Buscar conductores
export const buscarConductores = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    if (filtros.nombre) params.append('nombre', filtros.nombre);
  if (filtros.tipoDocumento) params.append('tipoDocumento', filtros.tipoDocumento);
  if (filtros.numeroDocumento) params.append('numeroDocumento', filtros.numeroDocumento);
    
    const response = await apiClient.get(`/conductores/buscar?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Consultar RENIEC por tipo y número de documento
export const consultarRENIEC = async (tipoDocumento, numeroDocumento) => {
  try {
    const response = await apiClient.get(`/conductores/reniec/${tipoDocumento}/${numeroDocumento}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Obtener información de la API RENIEC
export const obtenerInfoAPIRENIEC = async () => {
  try {
    const response = await apiClient.get('/conductores/reniec/info');
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export default {
  obtenerConductores,
  obtenerConductorPorId,
  crearConductor,
  actualizarConductor,
  eliminarConductor,
  buscarConductores,
  consultarRENIEC,
  obtenerInfoAPIRENIEC
};