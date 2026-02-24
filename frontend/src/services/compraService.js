// src/services/compraService.js
import apiClient, { handleApiError } from './apiService';

// Función simple para probar conectividad
export const probarConectividad = async () => {
  try {
    const response = await apiClient.get('/proveedores');
    console.log('✅ Backend conectado correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error de conectividad:', error.message);
    return false;
  }
};

// Obtener todas las compras
export const obtenerCompras = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    if (filtros.sucursalId) params.append('sucursalId', filtros.sucursalId);
    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
    if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);
    
    const response = await apiClient.get(`/compras?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Obtener compra por ID
export const obtenerCompraPorId = async (id) => {
  try {
    const response = await apiClient.get(`/compras/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Crear una nueva compra
export const crearCompra = async (datosCompra) => {
  try {
    console.log('📤 Enviando datos de compra:', datosCompra);
    // Nuevo endpoint para órdenes de compra desde el formulario
    const response = await apiClient.post('/compras/orden', datosCompra);
    console.log('✅ Respuesta del servidor:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al crear compra:', error);
    console.error('❌ Detalles del error:', error.response?.data);
    throw new Error(handleApiError(error));
  }
};

// Actualizar compra
export const actualizarCompra = async (id, compraData) => {
  try {
    const response = await apiClient.patch(`/compras/${id}`, compraData);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Anular compra
export const anularCompra = async (id) => {
  try {
    const response = await apiClient.patch(`/compras/${id}/anular`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Eliminar compra
export const eliminarCompra = async (id) => {
  try {
    const response = await apiClient.delete(`/compras/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Subir archivo XML de compra (automático)
export const subirXmlCompra = async (formData) => {
  try {
    const response = await apiClient.post('/compras/upload-xml-auto', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};



// Descargar PDF de compra
export const descargarPdfCompra = async (id) => {
  try {
    const response = await apiClient.get(`/compras/${id}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Validar datos de compra antes de enviar
export const validarCompra = (compraData) => {
  const errores = {};

  if (!compraData.proveedorId) {
    errores.proveedorId = 'El proveedor es requerido';
  }

  if (!compraData.sucursalId) {
    errores.sucursalId = 'La sucursal es requerida';
  }

  if (!compraData.tipoComprobante) {
    errores.tipoComprobante = 'El tipo de comprobante es requerido';
  }

  if (!compraData.fechaCompra) {
    errores.fechaCompra = 'La fecha de compra es requerida';
  }

  if (!compraData.detalles || compraData.detalles.length === 0) {
    errores.detalles = 'Debe agregar al menos un producto';
  }

  if (compraData.detalles) {
    compraData.detalles.forEach((detalle, index) => {
      if (!detalle.productoId) {
        errores[`detalle_${index}_producto`] = `Producto requerido en línea ${index + 1}`;
      }
      if (!detalle.cantidad || detalle.cantidad <= 0) {
        errores[`detalle_${index}_cantidad`] = `Cantidad inválida en línea ${index + 1}`;
      }
      if (!detalle.precioUnitario || detalle.precioUnitario <= 0) {
        errores[`detalle_${index}_precio`] = `Precio inválido en línea ${index + 1}`;
      }
    });
  }

  return {
    esValido: Object.keys(errores).length === 0,
    errores
  };
};

// Calcular totales de compra
export const calcularTotales = (detalles) => {
  const subtotal = detalles.reduce((sum, detalle) => {
    return sum + (detalle.cantidad * detalle.precioUnitario);
  }, 0);
  
  const igv = subtotal * 0.18; // 18% de IGV
  const total = subtotal + igv;

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    igv: parseFloat(igv.toFixed(2)),
    total: parseFloat(total.toFixed(2))
  };
}; 






// Obtener reporte de compras totales con filtros específicos
export const obtenerReporteComprasTotales = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    
    // Filtros específicos para el reporte
    if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
    if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);
    if (filtros.proveedorId) params.append('proveedorId', filtros.proveedorId);
    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.sucursalId) params.append('sucursalId', filtros.sucursalId);
    
    const response = await apiClient.get(`/compras/reporte?${params.toString()}`);
    
    // El backend ya devuelve los datos procesados con estadísticas
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Exportar compras a Excel
export const exportarComprasExcel = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    
    // Filtros para la exportación
    if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
    if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);
    if (filtros.proveedorId) params.append('proveedorId', filtros.proveedorId);
    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.sucursalId) params.append('sucursalId', filtros.sucursalId);
    
    const response = await apiClient.get(`/compras/exportar-excel?${params.toString()}`, {
      responseType: 'blob'
    });
    
    // Crear un enlace de descarga
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // Generar nombre del archivo con fecha actual
    const fechaActual = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `reporte_compras_${fechaActual}.xlsx`);
    
    // Simular click para descargar
    document.body.appendChild(link);
    link.click();
    
    // Limpiar
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true, mensaje: 'Reporte exportado exitosamente' };
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};