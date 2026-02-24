// src/services/usuarioService.js
import apiClient, { handleApiError } from './apiService';

// Obtener todos los usuarios
export const obtenerUsuarios = async () => {
  try {
    const response = await apiClient.get('/usuarios');
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Obtener un usuario por ID
export const obtenerUsuarioPorId = async (id) => {
  try {
    const response = await apiClient.get(`/usuarios/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Crear un nuevo usuario
export const crearUsuario = async (datosUsuario) => {
  try {
    const response = await apiClient.post('/usuarios', datosUsuario);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Actualizar un usuario
export const actualizarUsuario = async (id, datosUsuario) => {
  try {
    const response = await apiClient.patch(`/usuarios/${id}`, datosUsuario);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Eliminar un usuario
export const eliminarUsuario = async (id) => {
  try {
    const response = await apiClient.delete(`/usuarios/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Obtener roles disponibles
export const obtenerRoles = () => {
  return [
    { value: 'SuperAdmin', label: 'Super Administrador' },
    { value: 'Admin', label: 'Administrador' },
    { value: 'Cajero', label: 'Cajero' },
    { value: 'Almacenero', label: 'Almacenero' }
  ];
};

// Validar permisos de usuario
export const validarPermisos = (usuarioActual, accion, usuarioObjetivo = null) => {
  const { rol } = usuarioActual;
  
  switch (accion) {
    case 'crear_usuario':
      return rol === 'SuperAdmin' || rol === 'Admin';
    case 'editar_usuario':
      if (rol === 'SuperAdmin') return true;
      if (rol === 'Admin' && usuarioObjetivo) {
        return usuarioObjetivo.sucursalId === usuarioActual.sucursalId && usuarioObjetivo.rol !== 'SuperAdmin';
      }
      return false;
    case 'eliminar_usuario':
      if (rol === 'SuperAdmin') return true;
      if (rol === 'Admin' && usuarioObjetivo) {
        return usuarioObjetivo.sucursalId === usuarioActual.sucursalId && usuarioObjetivo.rol !== 'SuperAdmin';
      }
      return false;
    case 'ver_usuarios':
      return rol === 'SuperAdmin' || rol === 'Admin';
    default:
      return false;
  }
};

// Filtrar roles según permisos del usuario actual
export const obtenerRolesPermitidos = (usuarioActual) => {
  const todosLosRoles = obtenerRoles();
  
  if (usuarioActual.rol === 'SuperAdmin') {
    return todosLosRoles;
  }
  
  if (usuarioActual.rol === 'Admin') {
    return todosLosRoles.filter(rol => rol.value !== 'SuperAdmin');
  }
  
  return [];
};