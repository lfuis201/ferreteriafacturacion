// Servicio para consultas RENIEC y SUNAT
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Consultar DNI en RENIEC
export const consultarReniec = async (dni) => {
  try {
    const response = await fetch(`${API_BASE_URL}/proveedores/reniec/DNI/${dni}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transformar la respuesta para que tenga la estructura esperada
    return {
      success: true,
      datos: data.datos,
      mensaje: data.mensaje
    };
  } catch (error) {
    console.error('Error al consultar RENIEC:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Consultar RUC en SUNAT
export const consultarSunat = async (ruc) => {
  try {
    const response = await fetch(`${API_BASE_URL}/proveedores/reniec/RUC/${ruc}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transformar la respuesta para que tenga la estructura esperada
    return {
      success: true,
      datos: data.datos,
      mensaje: data.mensaje
    };
  } catch (error) {
    console.error('Error al consultar SUNAT:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Función genérica para consultar documentos
export const consultarDocumento = async (tipoDocumento, numeroDocumento) => {
  if (tipoDocumento === 'DNI') {
    return await consultarReniec(numeroDocumento);
  } else if (tipoDocumento === 'RUC') {
    return await consultarSunat(numeroDocumento);
  } else {
    throw new Error('Tipo de documento no válido');
  }
};