// src/services/proveedorService.js
import apiClient, { handleApiError } from './apiService';

// Obtener todos los proveedores
export const obtenerProveedores = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    if (filtros.nombre) params.append('nombre', filtros.nombre);
    if (filtros.ruc) params.append('ruc', filtros.ruc);
    if (filtros.activo !== undefined) params.append('activo', filtros.activo);
    
    const response = await apiClient.get(`/proveedores?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Buscar proveedores
export const buscarProveedores = async (termino) => {
  try {
    const response = await apiClient.get(`/proveedores/buscar?q=${encodeURIComponent(termino)}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Obtener proveedor por ID
export const obtenerProveedorPorId = async (id) => {
  try {
    const response = await apiClient.get(`/proveedores/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Crear nuevo proveedor
export const crearProveedor = async (proveedorData) => {
  try {
    const response = await apiClient.post('/proveedores', proveedorData);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Actualizar proveedor
export const actualizarProveedor = async (id, proveedorData) => {
  try {
    const response = await apiClient.put(`/proveedores/${id}`, proveedorData);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Eliminar proveedor
export const eliminarProveedor = async (id) => {
  try {
    const response = await apiClient.delete(`/proveedores/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Consultar RENIEC/SUNAT
export const consultarRENIEC = async (tipoDocumento, numeroDocumento) => {
  try {
    const response = await apiClient.get(`/proveedores/reniec/${tipoDocumento}/${numeroDocumento}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Función auxiliar para obtener información de API RENIEC/SUNAT
export const obtenerInfoAPIRENIEC = async (tipoDocumento, numeroDocumento) => {
  try {
    const resultado = await consultarRENIEC(tipoDocumento, numeroDocumento);
    
    if (resultado && resultado.datos) {
      let nombreCompleto = '';
      let direccion = '';
      
      if (tipoDocumento === 'DNI') {
        // Para DNI (RENIEC)
        if (resultado.datos.nombres && resultado.datos.apellidoPaterno) {
          nombreCompleto = `${resultado.datos.nombres} ${resultado.datos.apellidoPaterno}`;
          if (resultado.datos.apellidoMaterno) {
            nombreCompleto += ` ${resultado.datos.apellidoMaterno}`;
          }
        }
        direccion = resultado.datos.direccion || '';
      } else if (tipoDocumento === 'RUC') {
        // Para RUC (SUNAT)
        nombreCompleto = resultado.datos.razonSocial || resultado.datos.nombre || '';
        direccion = resultado.datos.direccion || '';
      }
      
      return {
        exito: true,
        datos: resultado.datos,
        nombreCompleto: nombreCompleto.trim(),
        direccion: direccion.trim(),
        mensaje: resultado.mensaje || 'Consulta exitosa'
      };
    }
    
    return {
      exito: false,
      mensaje: 'No se pudieron obtener los datos'
    };
  } catch (error) {
    console.error('Error al consultar RENIEC/SUNAT:', error);
    return {
      exito: false,
      mensaje: error.message || 'Error al consultar RENIEC/SUNAT'
    };
  }
};

// Validar datos de proveedor
export const validarProveedor = (proveedorData) => {
  const errores = {};

  if (!proveedorData.nombre || proveedorData.nombre.trim() === '') {
    errores.nombre = 'El nombre es requerido';
  }

  if (!proveedorData.ruc || proveedorData.ruc.trim() === '') {
    errores.ruc = 'El RUC es requerido';
  } else if (!/^\d{11}$/.test(proveedorData.ruc)) {
    errores.ruc = 'El RUC debe tener 11 dígitos';
  }

  if (proveedorData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(proveedorData.email)) {
    errores.email = 'El email no tiene un formato válido';
  }

  if (proveedorData.telefono && !/^\d{9}$/.test(proveedorData.telefono)) {
    errores.telefono = 'El teléfono debe tener 9 dígitos';
  }

  return {
    esValido: Object.keys(errores).length === 0,
    errores
  };
};