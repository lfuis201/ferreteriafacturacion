const API_BASE_URL = 'http://localhost:4000/api'; 
//const API_BASE_URL = 'https://ferreteriafcturacion.onrender.com/api';

class ConfiguracionSunatService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/configuracion-sunat`;
  }

  // Obtener token de autorización
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`
    };
  }

  // Obtener configuración SUNAT por sucursal
  async obtenerConfiguracion(sucursalId = 1) {
    try {
      const response = await fetch(`${this.baseURL}/${sucursalId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        const err = new Error(errorData.message || 'Error al obtener configuración');
        err.status = response.status;
        throw err;
      }

      return await response.json();
    } catch (error) {
      console.error('Error al obtener configuración SUNAT:', error);
      throw error;
    }
  }

  // Crear configuración SUNAT
  async crearConfiguracion(sucursalId, configuracionData) {
    try {
      const response = await fetch(`${this.baseURL}/${sucursalId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        body: JSON.stringify(configuracionData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        const err = new Error(errorData.message || 'Error al crear configuración');
        err.status = response.status;
        throw err;
      }

      return await response.json();
    } catch (error) {
      console.error('Error al crear configuración SUNAT:', error);
      throw error;
    }
  }

  // Actualizar configuración SUNAT
  async actualizarConfiguracion(sucursalId, configuracionData) {
    try {
      const response = await fetch(`${this.baseURL}/${sucursalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        body: JSON.stringify(configuracionData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        const err = new Error(errorData.message || 'Error al actualizar configuración');
        err.status = response.status;
        throw err;
      }

      return await response.json();
    } catch (error) {
      console.error('Error al actualizar configuración SUNAT:', error);
      throw error;
    }
  }

  // Subir certificado PFX
  async subirCertificado(sucursalId, certificadoFile, passwordCertificado) {
    try {
      const formData = new FormData();
      formData.append('certificado', certificadoFile);
      formData.append('passwordCertificado', passwordCertificado);

      const response = await fetch(`${this.baseURL}/${sucursalId}/certificado`, {
        method: 'POST',
        headers: {
          ...this.getAuthHeaders()
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        const err = new Error(errorData.message || 'Error al subir certificado');
        err.status = response.status;
        throw err;
      }

      return await response.json();
    } catch (error) {
      console.error('Error al subir certificado:', error);
      throw error;
    }
  }

  // Probar conexión con SUNAT
  async probarConexion(sucursalId) {
    try {
      const response = await fetch(`${this.baseURL}/${sucursalId}/probar-conexion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        const err = new Error(errorData.message || 'Error al probar conexión');
        err.status = response.status;
        throw err;
      }

      return await response.json();
    } catch (error) {
      console.error('Error al probar conexión:', error);
      throw error;
    }
  }

  // Obtener series y correlativos
  async obtenerSeriesCorrelativos(sucursalId) {
    try {
      const response = await fetch(`${this.baseURL}/${sucursalId}/series-correlativos`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        const err = new Error(errorData.message || 'Error al obtener series y correlativos');
        err.status = response.status;
        throw err;
      }

      return await response.json();
    } catch (error) {
      console.error('Error al obtener series y correlativos:', error);
      throw error;
    }
  }

  // Actualizar series y correlativos
  async actualizarSeriesCorrelativos(sucursalId, seriesData) {
    try {
      const response = await fetch(`${this.baseURL}/${sucursalId}/series-correlativos`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        body: JSON.stringify(seriesData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        const err = new Error(errorData.message || 'Error al actualizar series y correlativos');
        err.status = response.status;
        throw err;
      }

      return await response.json();
    } catch (error) {
      console.error('Error al actualizar series y correlativos:', error);
      throw error;
    }
  }
}

export default new ConfiguracionSunatService();