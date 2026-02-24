// src/services/ventaService.js
import apiClient, { handleApiError } from './apiService';

// Obtener todas las ventas
export const obtenerVentas = async (filtros = {}) => {
  try {
    console.log('ventaService: Obteniendo ventas con filtros:', filtros);
    
    // Verificar token de autenticación
    const token = localStorage.getItem('token');
    console.log('ventaService: Token presente:', !!token);
    
    const params = new URLSearchParams();
    if (filtros.sucursalId) params.append('sucursalId', filtros.sucursalId);
    if (filtros.clienteId) params.append('clienteId', filtros.clienteId);
    if (filtros.fechaVenta) params.append('fechaVenta', filtros.fechaVenta);
    if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
    if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);
    if (filtros.estado) params.append('estado', filtros.estado);
    
    const url = `/ventas?${params.toString()}`;
    console.log('ventaService: URL de solicitud:', url);
    
    const response = await apiClient.get(url);
    console.log('ventaService: Respuesta recibida:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('ventaService: Error al obtener ventas:', error);
    console.error('ventaService: Error response:', error.response?.data);
    throw new Error(handleApiError(error));
  }
};

// Obtener venta por ID
export const obtenerVentaPorId = async (id) => {
  try {
    console.log('🌐 ventaService: Obteniendo venta por ID:', id);
    const response = await apiClient.get(`/ventas/${id}`);
    console.log('📦 ventaService: Respuesta del backend:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ ventaService: Error al obtener venta:', error);
    throw new Error(handleApiError(error));
  }
};

// Crear nueva venta
export const crearVenta = async (ventaData) => {
  try {
    const response = await apiClient.post('/ventas', ventaData);
    return response.data;
  } catch (error) {
    // Propagar el error original para preservar error.response y
    // permitir que el consumidor muestre el mensaje específico del backend.
    throw error;
  }
};

// Actualizar venta
export const actualizarVenta = async (id, ventaData) => {
  try {
    const response = await apiClient.put(`/ventas/${id}`, ventaData);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Anular venta
export const anularVenta = async (id, motivo) => {
  try {
    const response = await apiClient.put(`/ventas/anular/${id}`, { motivoAnulacion: motivo });
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Obtener reporte de ventas
export const obtenerReporteVentas = async (filtros = {}) => {
  try {
    // Adaptado: el backend de /ventas/reporte espera 'fechaVenta' (día único).
    // Para permitir rango y vendedor, usamos /ventas con rango y filtramos por usuario en cliente.
    const params = new URLSearchParams();
    if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
    if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);
    if (filtros.sucursalId) params.append('sucursalId', filtros.sucursalId);

    const response = await apiClient.get(`/ventas?${params.toString()}`);
    const data = response.data || {};

    // Si se especifica usuarioId, filtrar ventas por vendedor en cliente
    let ventas = Array.isArray(data.ventas) ? data.ventas : [];
    if (filtros.usuarioId) {
      const usuarioIdNum = Number(filtros.usuarioId);
      ventas = ventas.filter(v => Number(v.Usuario?.id || v.usuarioId) === usuarioIdNum);
    }

    // Devolver en formato esperado por el componente (con propiedad ventas)
    return { ventas };
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Obtener consolidado de ítems de ventas
export const obtenerConsolidadoItemsVentas = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
    if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);
    if (filtros.sucursalId) params.append('sucursalId', filtros.sucursalId);
    if (filtros.productoId) params.append('productoId', filtros.productoId);
    
    const response = await apiClient.get(`/ventas/consolidado-items?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Generar PDF de venta
export const obtenerEstadoSunat = async (id) => {
  try {
    const response = await apiClient.get(`/ventas/${id}/estado-sunat`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Obtener siguiente número de comprobante
export const obtenerSiguienteNumero = async (serieComprobante, sucursalId) => {
  try {
    const params = new URLSearchParams({
      serieComprobante,
      sucursalId
    });
    const response = await apiClient.get(`/ventas/siguiente-numero?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Convertir cotización a venta
export const convertirCotizacionAVenta = async (cotizacionId, ventaData) => {
  try {
    const response = await apiClient.post(`/ventas/convertir-cotizacion/${cotizacionId}`, ventaData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Funciones SUNAT
export const descargarXMLVenta = async (id) => {
  try {
    const response = await apiClient.get(`/ventas/${id}/xml`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Generar/descargar PDF de venta en formato especificado
export const generarPdfVenta = async (id, formato = 'A4') => {
  try {
    const response = await apiClient.get(`/ventas/${id}/pdf?formato=${formato}`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const reenviarVentaSunat = async (id) => {
  try {
    const response = await apiClient.post(`/ventas/${id}/reenviar-sunat`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Obtener ventas por cliente
export const obtenerVentasPorCliente = async (clienteId, filtros = {}) => {
  try {
    console.log('ventaService: Obteniendo ventas del cliente:', clienteId, 'con filtros:', filtros);
    
    const params = new URLSearchParams();
    params.append('clienteId', clienteId);
    if (filtros.periodo) params.append('periodo', filtros.periodo);
    if (filtros.mes) params.append('mes', filtros.mes);
    if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
    if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);
    
    const url = `/ventas/cliente/${clienteId}?${params.toString()}`;
    console.log('ventaService: URL de solicitud historial cliente:', url);
    
    const response = await apiClient.get(url);
    console.log('ventaService: Historial cliente recibido:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('ventaService: Error al obtener historial del cliente:', error);
    throw new Error(handleApiError(error));
  }
};

// Obtener comprobantes no enviados a SUNAT
export const obtenerComprobantesNoEnviados = async (filtros = {}) => {
  try {
    console.log('ventaService: Obteniendo comprobantes no enviados con filtros:', filtros);
    
    const params = new URLSearchParams();
    if (filtros.sucursalId) params.append('sucursalId', filtros.sucursalId);
    if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
    if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);
    if (filtros.tipoComprobante) params.append('tipoComprobante', filtros.tipoComprobante);
    if (filtros.serie) params.append('serie', filtros.serie);
    if (filtros.numero) params.append('numero', filtros.numero);
    if (filtros.page) params.append('page', filtros.page);
    if (filtros.limit) params.append('limit', filtros.limit);
    
    const url = `/ventas/comprobantes-no-enviados?${params.toString()}`;
    console.log('ventaService: URL de solicitud comprobantes no enviados:', url);
    
    const response = await apiClient.get(url);
    console.log('ventaService: Respuesta comprobantes no enviados:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('ventaService: Error al obtener comprobantes no enviados:', error);
    console.error('ventaService: Error response:', error.response?.data);
    throw new Error(handleApiError(error));
  }
};

// Obtener comprobantes pendientes de rectificación
export const obtenerComprobantesPendientesRectificacion = async (filtros = {}) => {
  try {
    console.log('ventaService: Obteniendo comprobantes pendientes de rectificación con filtros:', filtros);
    
    const params = new URLSearchParams();
    if (filtros.sucursalId) params.append('sucursalId', filtros.sucursalId);
    if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
    if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);
    if (filtros.tipoComprobante) params.append('tipoComprobante', filtros.tipoComprobante);
    if (filtros.serie) params.append('serie', filtros.serie);
    if (filtros.numero) params.append('numero', filtros.numero);
    if (filtros.page) params.append('page', filtros.page);
    if (filtros.limit) params.append('limit', filtros.limit);
    
    const url = `/ventas/comprobantes-pendientes-rectificacion?${params.toString()}`;
    console.log('ventaService: URL de solicitud comprobantes pendientes rectificación:', url);
    
    const response = await apiClient.get(url);
    console.log('ventaService: Respuesta comprobantes pendientes rectificación:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('ventaService: Error al obtener comprobantes pendientes de rectificación:', error);
    console.error('ventaService: Error response:', error.response?.data);
    throw new Error(handleApiError(error));
  }
};

// Exportación por defecto del objeto ventaService
export const ventaService = {
  obtenerVentas,
  obtenerVentaPorId,
  crearVenta,
  actualizarVenta,
  anularVenta,
  obtenerReporteVentas,
  obtenerConsolidadoItemsVentas,
  convertirCotizacionAVenta,
  descargarXMLVenta,
  generarPdfVenta,
  reenviarVentaSunat,
  obtenerEstadoSunat,
  obtenerSiguienteNumero,
  obtenerVentasPorCliente,
  obtenerComprobantesNoEnviados,
  obtenerComprobantesPendientesRectificacion
};

export default ventaService;