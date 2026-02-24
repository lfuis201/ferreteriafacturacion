import apiClient, { handleApiError } from './apiService';

// Obtener todos los remitentes
export const obtenerRemitentes = async () => {
  try {
    const response = await apiClient.get('/remitentes');
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Obtener remitente por ID
export const obtenerRemitentePorId = async (id) => {
  try {
    const response = await apiClient.get(`/remitentes/${id}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Crear nuevo remitente
export const crearRemitente = async (datosFormulario) => {
  try {
    const response = await apiClient.post('/remitentes', datosFormulario);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Actualizar remitente
export const actualizarRemitente = async (id, datosFormulario) => {
  try {
    const response = await apiClient.put(`/remitentes/${id}`, datosFormulario);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Eliminar remitente
export const eliminarRemitente = async (id) => {
  try {
    const response = await apiClient.delete(`/remitentes/${id}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Buscar remitentes
export const buscarRemitentes = async (parametrosBusqueda) => {
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

    const response = await apiClient.get(`/remitentes/buscar?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Consultar RENIEC/SUNAT
export const consultarRENIEC = async (tipoDocumento, numeroDocumento) => {
  try {
    const response = await apiClient.get(`/remitentes/reniec/${tipoDocumento}/${numeroDocumento}`);
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
  obtenerRemitentes,
  obtenerRemitentePorId,
  crearRemitente,
  actualizarRemitente,
  eliminarRemitente,
  buscarRemitentes,
  consultarRENIEC,
  obtenerInfoAPIRENIEC
};