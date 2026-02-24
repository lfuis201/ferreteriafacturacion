// src/services/documentoRecurrenciaService.js
import apiClient, { handleApiError } from './apiService';

// Obtener documentos de recurrencia con filtros
export const obtenerDocumentosRecurrencia = async (filtros = {}) => {
  try {
    console.log('documentoRecurrenciaService: Obteniendo documentos de recurrencia con filtros:', filtros);
    
    // Verificar token de autenticación
    const token = localStorage.getItem('token');
    console.log('documentoRecurrenciaService: Token presente:', !!token);
    
    const params = new URLSearchParams();
    if (filtros.fechaEmision) params.append('fechaEmision', filtros.fechaEmision);
    if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
    if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);
    if (filtros.busqueda) params.append('busqueda', filtros.busqueda);
    if (filtros.tipoDocumento) params.append('tipoDocumento', filtros.tipoDocumento);
    if (filtros.serie) params.append('serie', filtros.serie);
    if (filtros.numero) params.append('numero', filtros.numero);
    if (filtros.cliente) params.append('cliente', filtros.cliente);
    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.page) params.append('page', filtros.page);
    if (filtros.limit) params.append('limit', filtros.limit);
    
    const url = `/documentos-recurrencia?${params.toString()}`;
    console.log('documentoRecurrenciaService: URL de solicitud:', url);
    
    const response = await apiClient.get(url);
    console.log('documentoRecurrenciaService: Respuesta recibida:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('documentoRecurrenciaService: Error al obtener documentos de recurrencia:', error);
    console.error('documentoRecurrenciaService: Error response:', error.response?.data);
    throw new Error(handleApiError(error));
  }
};

// Obtener documento de recurrencia por ID
export const obtenerDocumentoRecurrenciaPorId = async (id) => {
  try {
    console.log('documentoRecurrenciaService: Obteniendo documento de recurrencia por ID:', id);
    const response = await apiClient.get(`/documentos-recurrencia/${id}`);
    console.log('documentoRecurrenciaService: Respuesta del backend:', response.data);
    return response.data;
  } catch (error) {
    console.error('documentoRecurrenciaService: Error al obtener documento de recurrencia:', error);
    throw new Error(handleApiError(error));
  }
};

// Crear nuevo documento de recurrencia
export const crearDocumentoRecurrencia = async (documentoData) => {
  try {
    console.log('documentoRecurrenciaService: Creando documento de recurrencia:', documentoData);
    const response = await apiClient.post('/documentos-recurrencia', documentoData);
    console.log('documentoRecurrenciaService: Documento de recurrencia creado:', response.data);
    return response.data;
  } catch (error) {
    console.error('documentoRecurrenciaService: Error al crear documento de recurrencia:', error);
    throw new Error(handleApiError(error));
  }
};

// Actualizar documento de recurrencia
export const actualizarDocumentoRecurrencia = async (id, documentoData) => {
  try {
    console.log('documentoRecurrenciaService: Actualizando documento de recurrencia:', id, documentoData);
    const response = await apiClient.put(`/documentos-recurrencia/${id}`, documentoData);
    console.log('documentoRecurrenciaService: Documento de recurrencia actualizado:', response.data);
    return response.data;
  } catch (error) {
    console.error('documentoRecurrenciaService: Error al actualizar documento de recurrencia:', error);
    throw new Error(handleApiError(error));
  }
};

// Eliminar documento de recurrencia
export const eliminarDocumentoRecurrencia = async (id) => {
  try {
    console.log('documentoRecurrenciaService: Eliminando documento de recurrencia:', id);
    const response = await apiClient.delete(`/documentos-recurrencia/${id}`);
    console.log('documentoRecurrenciaService: Documento de recurrencia eliminado:', response.data);
    return response.data;
  } catch (error) {
    console.error('documentoRecurrenciaService: Error al eliminar documento de recurrencia:', error);
    throw new Error(handleApiError(error));
  }
};

// Procesar recurrencia de documento
export const procesarRecurrenciaDocumento = async (id) => {
  try {
    console.log('documentoRecurrenciaService: Procesando recurrencia de documento:', id);
    const response = await apiClient.post(`/documentos-recurrencia/${id}/procesar`);
    console.log('documentoRecurrenciaService: Recurrencia procesada:', response.data);
    return response.data;
  } catch (error) {
    console.error('documentoRecurrenciaService: Error al procesar recurrencia:', error);
    throw new Error(handleApiError(error));
  }
};

// Exportación por defecto del objeto documentoRecurrenciaService
export const documentoRecurrenciaService = {
  obtenerDocumentosRecurrencia,
  obtenerDocumentoRecurrenciaPorId,
  crearDocumentoRecurrencia,
  actualizarDocumentoRecurrencia,
  eliminarDocumentoRecurrencia,
  procesarRecurrenciaDocumento
};

export default documentoRecurrenciaService;