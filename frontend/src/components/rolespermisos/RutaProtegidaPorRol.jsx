// src/components/RutaProtegidaPorRol.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const RutaProtegidaPorRol = ({ children, rolesPermitidos }) => {
  const token = localStorage.getItem('token');
  const usuarioData = localStorage.getItem('usuario');

  // Si no hay token, redirigir al login
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Si no hay datos de usuario, redirigir al login
  if (!usuarioData) {
    return <Navigate to="/" replace />;
  }

  try {
    const usuario = JSON.parse(usuarioData);
    
    // Verificar si el rol del usuario está en los roles permitidos
    if (!rolesPermitidos.includes(usuario.rol)) {
      // Redirigir al dashboard unificado
      return <Navigate to="/dashboard" replace />;
    }

    return children;
  } catch (error) {
    // Si hay error al parsear los datos, redirigir al login
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    return <Navigate to="/" replace />;
  }
};

export default RutaProtegidaPorRol;