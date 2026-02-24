// src/services/notaVentaService.js
import apiClient, { handleApiError } from './apiService';

// Obtener todas las notas de venta
export const obtenerNotasVenta = async (filtros = {}) => {
  try {
    console.log('notaVentaService: Obteniendo notas de venta con filtros:', filtros);
    
    // Verificar token de autenticación
    const token = localStorage.getItem('token');
    console.log('notaVentaService: Token presente:', !!token);
    
    const params = new URLSearchParams();
    
    // Filtros existentes
    if (filtros.sucursalId) params.append('sucursalId', filtros.sucursalId);
    if (filtros.estado) params.append('estado', filtros.estado);
    
    // Nuevos filtros
    if (filtros.fechaEmision) params.append('fechaEmision', filtros.fechaEmision);
    if (filtros.buscar) params.append('buscar', filtros.buscar);
    if (filtros.serie) params.append('serie', filtros.serie);
    if (filtros.numero) params.append('numero', filtros.numero);
    if (filtros.cliente) params.append('cliente', filtros.cliente);
    
    const url = `/notas-venta?${params.toString()}`;
    console.log('notaVentaService: URL de solicitud:', url);
    
    const response = await apiClient.get(url);
    console.log('notaVentaService: Respuesta recibida:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('notaVentaService: Error al obtener notas de venta:', error);
    console.error('notaVentaService: Error response:', error.response?.data);
    throw new Error(handleApiError(error));
  }
};

// Obtener nota de venta por ID
export const obtenerNotaVentaPorId = async (id) => {
  try {
    console.log('🌐 notaVentaService: Obteniendo nota de venta por ID:', id);
    const response = await apiClient.get(`/notas-venta/${id}`);
    console.log('📦 notaVentaService: Respuesta del backend:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ notaVentaService: Error al obtener nota de venta:', error);
    throw new Error(handleApiError(error));
  }
};

// Crear nueva nota de venta
export const crearNotaVenta = async (notaVentaData) => {
  try {
    console.log('🌐 notaVentaService: Creando nota de venta:', notaVentaData);
    const response = await apiClient.post('/notas-venta', notaVentaData);
    console.log('📦 notaVentaService: Nota de venta creada:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ notaVentaService: Error al crear nota de venta:', error);
    throw new Error(handleApiError(error));
  }
};

// Actualizar nota de venta
export const actualizarNotaVenta = async (id, notaVentaData) => {
  try {
    console.log('🌐 notaVentaService: Actualizando nota de venta:', id, notaVentaData);
    const response = await apiClient.put(`/notas-venta/${id}`, notaVentaData);
    console.log('📦 notaVentaService: Nota de venta actualizada:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ notaVentaService: Error al actualizar nota de venta:', error);
    throw new Error(handleApiError(error));
  }
};

// Anular nota de venta
export const anularNotaVenta = async (id, motivoAnulacion, revertirInventario = false) => {
  try {
    console.log('🌐 notaVentaService: Anulando nota de venta:', id, motivoAnulacion);
    const response = await apiClient.put(`/notas-venta/${id}/anular`, { 
      motivoAnulacion,
      revertirInventario 
    });
    console.log('📦 notaVentaService: Nota de venta anulada:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ notaVentaService: Error al anular nota de venta:', error);
    throw new Error(handleApiError(error));
  }
};

// Obtener reporte de notas de venta
export const obtenerReporteNotasVenta = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
    if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);
    if (filtros.sucursalId) params.append('sucursalId', filtros.sucursalId);
    if (filtros.usuarioId) params.append('usuarioId', filtros.usuarioId);
    
    const response = await apiClient.get(`/notas-venta/reporte?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Obtener estado SUNAT de nota de venta (si aplica)
export const obtenerEstadoSunat = async (id) => {
  try {
    const response = await apiClient.get(`/notas-venta/${id}/estado-sunat`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Generar PDF de nota de venta
export const generarPdfNotaVenta = async (id, formato = 'A4') => {
  try {
    const response = await apiClient.get(`/notas-venta/${id}/pdf?formato=${formato}`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Enviar nota de venta por WhatsApp
export const enviarNotaVentaWhatsApp = async (id, telefono, mensaje) => {
  try {
    const response = await apiClient.post(`/notas-venta/${id}/whatsapp`, {
      telefono,
      mensaje
    });
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};