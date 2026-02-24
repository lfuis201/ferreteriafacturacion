// src/services/productoService.js
import apiClient, { handleApiError } from './apiService';
import { obtenerCategorias, crearCategoria } from './categoriaService';
import { obtenerPresentaciones, crearPresentacion } from './presentacionService';

// Obtener todos los productos
export const obtenerProductos = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    if (filtros.categoriaId) params.append('categoriaId', filtros.categoriaId);
    if (filtros.nombre) params.append('nombre', filtros.nombre);
    
    const response = await apiClient.get(`/productos?${params.toString()}`);
    return {
      productos: response.data.productos || [],
      data: response.data.productos || []
    };
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Obtener productos con información de inventario
export const obtenerProductosConInventario = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    if (filtros.categoriaId) params.append('categoriaId', filtros.categoriaId);
    if (filtros.nombre) params.append('nombre', filtros.nombre);
    if (filtros.sucursalId) params.append('sucursalId', filtros.sucursalId);
    
    const response = await apiClient.get(`/productos/con-inventario?${params.toString()}`);
    return {
      productos: response.data.productos || [],
      data: response.data.productos || []
    };
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Obtener producto por ID
export const obtenerProductoPorId = async (id) => {
  try {
    const response = await apiClient.get(`/productos/${id}`);
    return response.data.producto;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Crear nuevo producto - CORREGIDO
export const crearProducto = async (formData) => {
  try {
    // NO reconstruir el FormData, ya viene construido desde el componente
    const response = await apiClient.post('/productos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Actualizar producto - CORREGIDO
export const actualizarProducto = async (id, formData) => {
  try {
    // NO reconstruir el FormData, ya viene construido desde el componente
    const response = await apiClient.put(`/productos/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Eliminar producto
export const eliminarProducto = async (id) => {
  try {
    const response = await apiClient.delete(`/productos/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Buscar productos
export const buscarProductos = async (filtros) => {
  try {
    // Si es un string, convertirlo a objeto con nombre
    if (typeof filtros === 'string') {
      filtros = { nombre: filtros };
    }
    
    const params = new URLSearchParams();
    if (filtros.categoriaId) params.append('categoriaId', filtros.categoriaId);
    if (filtros.nombre) params.append('nombre', filtros.nombre);
    
    const response = await apiClient.get(`/productos?${params.toString()}`);
    return {
      productos: response.data.productos || [],
      data: response.data.productos || []
    };
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Importar productos desde Excel
export const importarProductosExcel = async (archivo) => {
  try {
    // Crear FormData para enviar el archivo
    const formData = new FormData();
    formData.append('archivo', archivo);

    // Usar apiClient con configuración correcta para multipart/form-data
    const response = await apiClient.post('/productos/importar-excel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Exportar productos a Excel
export const exportarProductosExcel = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    if (filtros.categoriaId) params.append('categoriaId', filtros.categoriaId);
    if (filtros.sucursalId) params.append('sucursalId', filtros.sucursalId);
    if (filtros.fechaDesde) params.append('fechaDesde', filtros.fechaDesde);
    if (filtros.fechaHasta) params.append('fechaHasta', filtros.fechaHasta);

    console.log('URL de exportación:', `/productos/exportar-excel?${params.toString()}`);
    console.log('Parámetros enviados:', Object.fromEntries(params));

    const response = await apiClient.get(`/productos/exportar-excel?${params.toString()}`, {
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
    let filename = 'productos.xlsx';
    
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
    
    return { mensaje: 'Archivo exportado exitosamente' };
   } catch (error) {
     throw new Error(handleApiError(error));
   }
 };

// Exportación por defecto del objeto productoService
export const productoService = {
  obtenerProductos,
  obtenerProductosConInventario,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  buscarProductos,
  obtenerCategorias,
  obtenerPresentaciones,
  crearCategoria,
  crearPresentacion,
  exportarProductos: exportarProductosExcel
};

export default productoService;

