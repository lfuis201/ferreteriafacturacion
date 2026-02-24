const axios = require('axios');

// Configuración similar al frontend
const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:4000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Función para simular el login y obtener token
async function login() {
  try {
    console.log('🔐 Intentando iniciar sesión...');
    const response = await apiClient.post('/login', {
      correo: 'super@gmail.com',
      password: '123456'
    });
    
    console.log('✅ Login exitoso');
    return response.data.token;
  } catch (error) {
    console.log('❌ Error en login:', error.response?.data || error.message);
    throw error;
  }
}

// Función para simular el ingreso de producto
async function ingresarProducto(token, datosIngreso) {
  try {
    console.log('📦 Intentando ingresar producto...');
    console.log('Datos a enviar:', JSON.stringify(datosIngreso, null, 2));
    
    const response = await apiClient.post('/inventario/ingresar', datosIngreso, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Ingreso exitoso');
    console.log('Respuesta del servidor:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.log('❌ Error en ingreso:');
    console.log('Status:', error.response?.status);
    console.log('Data:', JSON.stringify(error.response?.data, null, 2));
    console.log('Message:', error.message);
    throw error;
  }
}

// Función principal
async function main() {
  try {
    // 1. Obtener token
    const token = await login();
    
    // 2. Datos de prueba (similares a los del frontend)
    const datosIngreso = {
      productoId: 1, // Usar un ID que sepas que existe
      sucursalId: 1, // Usar un ID que sepas que existe
      cantidad: 10,
      motivo: 'Compra',
      observacion: 'Prueba desde script',
      comentarios: 'Comentario de prueba',
      fechaRegistro: new Date().toISOString(),
      referenciaId: null
    };
    
    // 3. Intentar ingresar producto
    const resultado = await ingresarProducto(token, datosIngreso);
    
    console.log('🎉 Proceso completado exitosamente');
    
  } catch (error) {
    console.log('💥 Error general:', error.message);
  }
}

// Ejecutar
main();