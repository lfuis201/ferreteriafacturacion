// Script para verificar el estado de autenticación
console.log('🔍 Verificando estado de autenticación...');

// Verificar si hay token en localStorage
const token = localStorage.getItem('token');
const usuario = localStorage.getItem('usuario');

console.log('Token presente:', !!token);
console.log('Usuario presente:', !!usuario);

if (token) {
  console.log('Token:', token.substring(0, 20) + '...');
}

if (usuario) {
  try {
    const usuarioData = JSON.parse(usuario);
    console.log('Datos del usuario:', usuarioData);
  } catch (e) {
    console.log('Error al parsear usuario:', e);
  }
}

// Hacer una petición de prueba al inventario
fetch('http://127.0.0.1:4000/api/inventario', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  }
})
.then(response => {
  console.log('Status de respuesta:', response.status);
  return response.json();
})
.then(data => {
  console.log('Respuesta del servidor:', data);
})
.catch(error => {
  console.error('Error en la petición:', error);
});