import apiClient, { handleApiError } from './apiService';

// Obtener todos los pagadores de flete
export const obtenerPagadoresFlete = async () => {
  try {
    const response = await apiClient.get('/pagadores-flete');
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Obtener pagador de flete por ID
export const obtenerPagadorFletePorId = async (id) => {
  try {
    const response = await apiClient.get(`/pagadores-flete/${id}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Crear nuevo pagador de flete
export const crearPagadorFlete = async (datosFormulario) => {
  try {
    const response = await apiClient.post('/pagadores-flete', datosFormulario);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Actualizar pagador de flete
export const actualizarPagadorFlete = async (id, datosFormulario) => {
  try {
    const response = await apiClient.put(`/pagadores-flete/${id}`, datosFormulario);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Eliminar pagador de flete
export const eliminarPagadorFlete = async (id) => {
  try {
    const response = await apiClient.delete(`/pagadores-flete/${id}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Buscar pagadores de flete
export const buscarPagadoresFlete = async (parametrosBusqueda) => {
  try {
    const params = new URLSearchParams();
    
    if (parametrosBusqueda.nombre) {
      params.append('nombre', parametrosBusqueda.nombre);
    }
    if (parametrosBusqueda.tipoDocumento) {
      params.append('tipoDocumento', parametrosBusqueda.tipoDocumento);
    }
    if (parametrosBusqueda.numeroDocumento) {
      params.append('numeroDocumento', parametrosBusqueda.numeroDocumento);
    }

    const response = await apiClient.get(`/pagadores-flete/buscar?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Consultar RENIEC/SUNAT
export const consultarRENIEC = async (tipoDocumento, numeroDocumento) => {
  try {
    const response = await apiClient.get(`/pagadores-flete/reniec/${tipoDocumento}/${numeroDocumento}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
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

export default {
  obtenerPagadoresFlete,
  obtenerPagadorFletePorId,
  crearPagadorFlete,
  actualizarPagadorFlete,
  eliminarPagadorFlete,
  buscarPagadoresFlete,
  consultarRENIEC,
  obtenerInfoAPIRENIEC
};