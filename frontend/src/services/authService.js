// src/services/authService.js
import apiClient, { handleApiError } from './apiService';

// Registrar un nuevo SuperAdmin (sin token)
export const registrarSuperAdmin = async (datos) => {
  try {
    const response = await apiClient.post('/usuarios/register-superadmin', datos);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Registrar un nuevo usuario normal (con token)
export const registrarUsuario = async (datos) => {
  try {
    const response = await apiClient.post('/usuarios', datos);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Verificar si existe al menos un SuperAdmin
export const verificarSuperAdmin = async () => {
  try {
    const response = await apiClient.get('/usuarios/verificar-superadmin');
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Iniciar sesión
export const iniciarSesion = async (credenciales) => {
  try {
    const response = await apiClient.post('/usuarios/login', credenciales);
    // Guardar el token en localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
    }
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Cerrar sesión y limpiar el token
export const cerrarSesion = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
};