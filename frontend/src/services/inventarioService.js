// src/services/inventarioService.js
import apiClient, { handleApiError } from './apiService';

// Obtener inventario
const obtenerInventario = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    if (filtros.sucursalId) params.append('sucursalId', filtros.sucursalId);
    if (filtros.productoId) params.append('productoId', filtros.productoId);
    if (filtros.stockMinimo) params.append('stockMinimo', filtros.stockMinimo);
    if (filtros.search) params.append('search', filtros.search);
    
    const response = await apiClient.get(`/inventario?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Obtener inventario por producto y sucursal
const obtenerInventarioPorProducto = async (productoId, sucursalId) => {
  try {
    const response = await apiClient.get(`/inventario/producto/${productoId}/sucursal/${sucursalId}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Actualizar stock
const actualizarStock = async (inventarioData) => {
  try {
    const { productoId, sucursalId, ...bodyData } = inventarioData;
    const response = await apiClient.put(`/inventario/stock/${productoId}/${sucursalId}`, bodyData);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Obtener movimientos de inventario
const obtenerMovimientosInventario = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    if (filtros.sucursalId) params.append('sucursalId', filtros.sucursalId);
    if (filtros.productoId) params.append('productoId', filtros.productoId);
    if (filtros.tipoMovimiento) params.append('tipoMovimiento', filtros.tipoMovimiento);
    if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
    if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);
    
    const response = await apiClient.get(`/inventario/movimientos?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};





// Consultar kardex de un producto específico
const consultarKardex = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    if (filtros.productoId) params.append('productoId', filtros.productoId);
    if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
    if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);
    if (filtros.sucursalId) params.append('sucursalId', filtros.sucursalId);
    
    const response = await apiClient.get(`/inventario/movimientos?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};





// Crear movimiento de inventario
const crearMovimientoInventario = async (movimientoData) => {
  try {
    const response = await apiClient.post('/inventario/movimientos', movimientoData);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Transferir stock entre sucursales
const transferirStock = async (transferenciaData) => {
  try {
    const response = await apiClient.post('/inventario/transferir', transferenciaData);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Obtener productos con stock bajo
const obtenerProductosStockBajo = async (sucursalId) => {
  try {
    const params = sucursalId ? `?sucursalId=${sucursalId}` : '';
    const response = await apiClient.get(`/inventario/stock-bajo${params}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Obtener reporte de inventario
const obtenerReporteInventario = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    if (filtros.sucursalId) params.append('sucursalId', filtros.sucursalId);
    if (filtros.categoriaId) params.append('categoriaId', filtros.categoriaId);
    if (filtros.incluirSinStock) params.append('incluirSinStock', filtros.incluirSinStock);
    
    const response = await apiClient.get(`/inventario/reporte?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Ajustar inventario
const ajustarInventario = async (ajusteData) => {
  try {
    const response = await apiClient.post('/inventario/ajustar', ajusteData);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// ===== FUNCIONES PARA REFERENCIAS DE INVENTARIO =====

// Obtener todas las referencias de inventario
const obtenerReferenciasInventario = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filtros.search) params.append('search', filtros.search);
    if (filtros.page) params.append('page', filtros.page);
    if (filtros.limit) params.append('limit', filtros.limit);
    
    const response = await apiClient.get(`/referencias-inventario?${params}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Obtener una referencia por ID
const obtenerReferenciaPorId = async (id) => {
  try {
    const response = await apiClient.get(`/referencias-inventario/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Crear una nueva referencia
const crearReferencia = async (datosReferencia) => {
  try {
    const response = await apiClient.post('/referencias-inventario', datosReferencia);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Actualizar una referencia existente
const actualizarReferencia = async (id, datosReferencia) => {
  try {
    const response = await apiClient.put(`/referencias-inventario/${id}`, datosReferencia);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Eliminar una referencia
const eliminarReferencia = async (id) => {
  try {
    const response = await apiClient.delete(`/referencias-inventario/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Obtener referencias activas para selects
const obtenerReferenciasActivas = async () => {
  try {
    const response = await apiClient.get('/referencias-inventario?activo=true&limit=1000');
    return {
      data: response.data.referencias || response.data || []
    };
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// ===== NUEVAS FUNCIONES PARA MOVIMIENTO INVENTARIO =====

// Obtener inventario con búsqueda y paginación
const obtenerInventarioConBusqueda = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filtros.search) params.append('search', filtros.search);
    if (filtros.sucursalId) params.append('sucursalId', filtros.sucursalId);
    if (filtros.page) params.append('page', filtros.page);
    if (filtros.limit) params.append('limit', filtros.limit);
    
    const response = await apiClient.get(`/inventario/busqueda?${params}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Obtener productos activos para selects
const obtenerProductosActivos = async () => {
  try {
    const response = await apiClient.get('/inventario/productos-activos');
    return {
      data: response.data.productos || []
    };
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Obtener sucursales activas para selects
const obtenerSucursalesActivas = async () => {
  try {
    const response = await apiClient.get('/inventario/sucursales-activas');
    return {
      data: response.data.sucursales || []
    };
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Obtener traslados
const obtenerTraslados = async (filtros = {}) => {
  try {
    const params = {
      tipoMovimiento: 'TRASLADO',
      ...filtros
    };
    const response = await apiClient.get('/inventario/movimientos', { params });
    return {
      success: true,
      data: response.data.movimientos || []
    };
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Trasladar producto entre sucursales
const trasladarProducto = async (datosTraslado) => {
  try {
    const response = await apiClient.post('/inventario/trasladar', datosTraslado);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Remover producto del inventario
const removerProducto = async (datosRemocion) => {
  try {
    const response = await apiClient.post('/inventario/remover', datosRemocion);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Ajustar stock de producto
const ajustarStockProducto = async (datosAjuste) => {
  try {
    const response = await apiClient.post('/inventario/ajustar', datosAjuste);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Ingresar producto al inventario
const ingresarProducto = async (datosIngreso) => {
  try {
    const response = await apiClient.post('/inventario/ingresar', datosIngreso);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Descargar PDF de traslado
const descargarPdfTraslado = async (trasladoId) => {
  try {
    const response = await apiClient.get(`/inventario/traslado/${trasladoId}/pdf`, {
      responseType: 'blob'
    });
    
    // Crear un blob con el PDF
    const blob = new Blob([response.data], { type: 'application/pdf' });
    
    // Crear URL temporal para el blob
    const url = window.URL.createObjectURL(blob);
    
    // Crear elemento de descarga temporal
    const link = document.createElement('a');
    link.href = url;
    link.download = `traslado-${trasladoId}.pdf`;
    
    // Agregar al DOM, hacer clic y remover
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Limpiar URL temporal
    window.URL.revokeObjectURL(url);
    
    return {
      success: true,
      message: 'PDF descargado exitosamente'
    };
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Exportar revisión de inventario a Excel
const exportarRevisionInventarioExcel = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    if (filtros.sucursalId) params.append('sucursalId', filtros.sucursalId);
    if (filtros.categoriaId) params.append('categoriaId', filtros.categoriaId);
    if (filtros.search) params.append('search', filtros.search);

    const response = await apiClient.get(`/inventario/exportar-revision-excel?${params.toString()}`, {
      responseType: 'blob'
    });

    // Crear URL para descargar el archivo
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Obtener nombre del archivo desde los headers o usar uno por defecto
    const contentDisposition = response.headers['content-disposition'];
    let filename = `revision_inventario_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }
    
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return { mensaje: 'Archivo Excel exportado exitosamente' };
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Exportar revisión de inventario a PDF
const exportarRevisionInventarioPdf = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    if (filtros.sucursalId) params.append('sucursalId', filtros.sucursalId);
    if (filtros.categoriaId) params.append('categoriaId', filtros.categoriaId);
    if (filtros.search) params.append('search', filtros.search);

    const response = await apiClient.get(`/inventario/exportar-revision-pdf?${params.toString()}`, {
      responseType: 'blob'
    });

    // Crear URL para descargar el archivo
    const blob = new Blob([response.data], {
      type: 'application/pdf'
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Obtener nombre del archivo desde los headers o usar uno por defecto
    const contentDisposition = response.headers['content-disposition'];
    let filename = `revision_inventario_${new Date().toISOString().split('T')[0]}.pdf`;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }
    
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return { mensaje: 'Archivo PDF exportado exitosamente' };
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Obtener stock histórico
const obtenerStockHistorico = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    
    // Parámetros requeridos
    if (filtros.fechaDesde) params.append('fechaDesde', filtros.fechaDesde);
    if (filtros.fechaHasta) params.append('fechaHasta', filtros.fechaHasta);
    
    // Parámetros opcionales
    if (filtros.sucursalId) params.append('sucursalId', filtros.sucursalId);
    if (filtros.search) params.append('search', filtros.search);
    if (filtros.page) params.append('page', filtros.page);
    if (filtros.limit) params.append('limit', filtros.limit);
    
    const response = await apiClient.get(`/inventario/stock-historico?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Exportar stock histórico a Excel
const exportarStockHistoricoExcel = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    
    // Parámetros requeridos
    if (filtros.fechaDesde) params.append('fechaDesde', filtros.fechaDesde);
    if (filtros.fechaHasta) params.append('fechaHasta', filtros.fechaHasta);
    
    // Parámetros opcionales
    if (filtros.sucursalId) params.append('sucursalId', filtros.sucursalId);
    if (filtros.search) params.append('search', filtros.search);

    const response = await apiClient.get(`/inventario/exportar-stock-historico-excel?${params.toString()}`, {
      responseType: 'blob'
    });

    // Crear URL para descargar el archivo
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Obtener nombre del archivo desde los headers o usar uno por defecto
    const contentDisposition = response.headers['content-disposition'];
    let filename = `stock_historico_${filtros.fechaDesde || 'fecha'}_${filtros.fechaHasta || 'fecha'}.xlsx`;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/); 
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }
    
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return { mensaje: 'Archivo Excel exportado exitosamente' };
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Exportar kardex a Excel
const exportarKardexExcel = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    if (filtros.productoId) params.append('productoId', filtros.productoId);
    if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
    if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);
    if (filtros.sucursalId) params.append('sucursalId', filtros.sucursalId);
    
    const response = await apiClient.get(`/inventario/exportar-kardex-excel?${params.toString()}`, {
      responseType: 'blob'
    });
    
    // Crear un blob con el archivo Excel
    const blob = new Blob([response.data], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    // Crear un enlace temporal para descargar
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Obtener el nombre del archivo desde los headers o usar uno por defecto
    let filename = 'kardex.xlsx';
    const contentDisposition = response.headers['content-disposition'];
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/); 
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }
    
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return { mensaje: 'Archivo Excel exportado exitosamente' };
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Exportar kardex a PDF
const exportarKardexPdf = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    if (filtros.productoId) params.append('productoId', filtros.productoId);
    if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
    if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);
    if (filtros.sucursalId) params.append('sucursalId', filtros.sucursalId);
    
    const response = await apiClient.get(`/inventario/exportar-kardex-pdf?${params.toString()}`, {
      responseType: 'blob'
    });
    
    // Crear un blob con el archivo PDF
    const blob = new Blob([response.data], { 
      type: 'application/pdf' 
    });
    
    // Crear un enlace temporal para descargar
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Obtener el nombre del archivo desde los headers o usar uno por defecto
    let filename = 'kardex.pdf';
    const contentDisposition = response.headers['content-disposition'];
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/); 
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }
    
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return { mensaje: 'Archivo PDF exportado exitosamente' };
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export {
  obtenerInventario,
  obtenerInventarioPorProducto,
  actualizarStock,
  obtenerMovimientosInventario,
  consultarKardex,
  crearMovimientoInventario,
  transferirStock,
  obtenerProductosStockBajo,
  obtenerReporteInventario,
  ajustarInventario,
  obtenerReferenciasInventario,
  obtenerReferenciaPorId,
  crearReferencia,
  actualizarReferencia,
  eliminarReferencia,
  obtenerReferenciasActivas,
  obtenerInventarioConBusqueda,
  obtenerProductosActivos,
  obtenerSucursalesActivas,
  obtenerTraslados,
  trasladarProducto,
  removerProducto,
  ajustarStockProducto,
  ingresarProducto,
  descargarPdfTraslado,
  exportarRevisionInventarioExcel,
  exportarRevisionInventarioPdf,
  obtenerStockHistorico,
  exportarStockHistoricoExcel,
  exportarKardexExcel,
  exportarKardexPdf
};