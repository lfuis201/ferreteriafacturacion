// src/services/cajaService.js
import apiClient, { handleApiError } from './apiService';

// Abrir una nueva caja
export const abrirCaja = async (datos) => {
  try {
    const response = await apiClient.post('/cajas', datos);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Cerrar una caja
export const cerrarCaja = async (datos) => {
  try {
    const response = await apiClient.post('/cajas/cerrar', datos);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Obtener estado de caja (puede incluir lista de cajas)
export const obtenerEstadoCaja = async (params = {}) => {
  try {
    const query = new URLSearchParams();
    if (params.sucursalId) query.append('sucursalId', params.sucursalId);
    const response = await apiClient.get(`/cajas/estado${query.toString() ? `?${query.toString()}` : ''}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Generar reporte de caja
export const generarReporteCaja = async (params = {}) => {
  try {
    const query = new URLSearchParams();
    if (params.fechaInicio) query.append('fechaInicio', params.fechaInicio);
    if (params.fechaFin) query.append('fechaFin', params.fechaFin);
    if (params.sucursalId) query.append('sucursalId', params.sucursalId);
    const url = `/cajas/reporte${query.toString() ? `?${query.toString()}` : ''}`;
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Eliminar historial de una sucursal
export const eliminarHistorialCaja = async (sucursalId) => {
  try {
    const response = await apiClient.delete(`/cajas/historial/${sucursalId}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Actualizar caja (ej. observaciones)
export const actualizarCaja = async (id, datos) => {
  try {
    const response = await apiClient.patch(`/cajas/${id}`, datos);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};