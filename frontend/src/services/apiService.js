// src/services/apiService.js
import axios from 'axios';

// Configuración base de la API
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:4000/api';
//const API_URL = 'https://ferreteriafcturacion.onrender.com/api';

// Crear instancia de axios con configuración base
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a todas las peticiones
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      const isLoginRequest = error.config?.url?.includes('/login');
      // No redirigir en login (para mostrar "credenciales incorrectas" en el formulario)
      if (!isLoginRequest) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        // Usar evento para que React Router redirija sin recargar la página
        window.dispatchEvent(new CustomEvent('auth:logout'));
      }
    }
    return Promise.reject(error);
  }
);

// Función helper para manejar errores
export const handleApiError = (error) => {
  if (error.response) {
    // El servidor respondió con un código de estado fuera del rango 2xx
    return error.response.data.mensaje || 'Error en el servidor';
  } else if (error.request) {
    // La solicitud se hizo pero no se recibió respuesta
    return 'No se recibió respuesta del servidor';
  } else {
    // Algo sucedió al configurar la solicitud
    return 'Error al configurar la solicitud';
  }
};

export default apiClient;