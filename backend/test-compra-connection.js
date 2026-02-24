const axios = require('axios');

// Configuración de la API
const API_URL = 'http://127.0.0.1:4000/api';

// Datos de prueba para crear una compra
const compraData = {
  proveedorId: 1, // Asumiendo que existe un proveedor con ID 1
  sucursalId: 1,  // Asumiendo que existe una sucursal con ID 1
  serie: 'F001',
  numero: '000001',
  tipoComprobante: 'FACTURA',
  fechaEmision: new Date().toISOString().split('T')[0],
  fechaVencimiento: new Date().toISOString().split('T')[0],
  moneda: 'PEN',
  observaciones: 'Compra de prueba desde script',
  detalles: [
    {
      productoId: 1, // Asumiendo que existe un producto con ID 1
      cantidad: 5,
      precioUnitario: 10.00,
      descuento: 0
    }
  ],
  subtotal: 50.00,
  igv: 9.00,
  total: 59.00,
  estado: 'PENDIENTE'
};

async function testCompraConnection() {
  console.log('🔍 Probando conexión para crear compra...\n');
  
  try {
    // 1. Verificar que el servidor esté ejecutándose
    console.log('1. Verificando servidor backend...');
    const healthCheck = await axios.get(`${API_URL}/health`).catch(() => null);
    
    if (!healthCheck) {
      console.log('❌ El servidor backend no está respondiendo');
      console.log('   Asegúrate de que esté ejecutándose en el puerto 4000');
      return false;
    }
    
    console.log('✅ Servidor backend respondiendo');
    
    // 2. Verificar endpoint de compras
    console.log('\n2. Verificando endpoint de compras...');
    
    try {
      const response = await axios.post(`${API_URL}/compras`, compraData, {
        headers: {
          'Content-Type': 'application/json',
          // Agregar token si es necesario
          // 'Authorization': 'Bearer tu_token_aqui'
        },
        timeout: 10000
      });
      
      console.log('✅ Compra creada exitosamente!');
      console.log('📋 Respuesta del servidor:');
      console.log(JSON.stringify(response.data, null, 2));
      
      return true;
      
    } catch (error) {
      console.log('❌ Error al crear compra:');
      
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Mensaje: ${error.response.data?.mensaje || error.response.data?.error || 'Error desconocido'}`);
        console.log('   Datos de respuesta:', JSON.stringify(error.response.data, null, 2));
      } else if (error.request) {
        console.log('   No se recibió respuesta del servidor');
        console.log('   Verifica que el backend esté ejecutándose');
      } else {
        console.log(`   Error de configuración: ${error.message}`);
      }
      
      return false;
    }
    
  } catch (error) {
    console.log('💥 Error general:', error.message);
    return false;
  }
}

// Función para probar diferentes URLs
async function testMultipleUrls() {
  const urls = [
    'http://127.0.0.1:4000/api',
    'http://localhost:4000/api',
    'http://0.0.0.0:4000/api'
  ];
  
  console.log('🔍 Probando diferentes URLs...\n');
  
  for (const url of urls) {
    console.log(`Probando: ${url}`);
    try {
      const response = await axios.get(`${url}/health`, { timeout: 5000 });
      console.log(`✅ ${url} - Funciona!`);
      return url;
    } catch (error) {
      console.log(`❌ ${url} - No responde`);
    }
  }
  
  return null;
}

// Ejecutar las pruebas
async function runTests() {
  console.log('🧪 PRUEBA DE CONECTIVIDAD PARA COMPRAS\n');
  console.log('=====================================\n');
  
  // Primero probar URLs
  const workingUrl = await testMultipleUrls();
  
  if (!workingUrl) {
    console.log('\n❌ Ninguna URL del backend está respondiendo');
    console.log('\n🔧 Pasos para solucionar:');
    console.log('1. Asegúrate de que el backend esté ejecutándose: npm start');
    console.log('2. Verifica que esté en el puerto 4000');
    console.log('3. Revisa los logs del backend para errores');
    return;
  }
  
  console.log(`\n✅ URL funcional encontrada: ${workingUrl}\n`);
  
  // Actualizar la URL y probar la creación de compra
  const originalUrl = API_URL;
  global.API_URL = workingUrl;
  
  const success = await testCompraConnection();
  
  if (success) {
    console.log('\n🎉 ¡Conexión exitosa! El backend puede crear compras.');
    console.log('\n📋 Recomendaciones:');
    console.log(`1. Asegúrate de que el frontend use: ${workingUrl}`);
    console.log('2. Verifica que el token de autenticación sea correcto si es necesario');
    console.log('3. Revisa que los IDs de proveedor, sucursal y producto existan');
  } else {
    console.log('\n❌ Hay problemas con la creación de compras');
    console.log('\n🔧 Posibles soluciones:');
    console.log('1. Verifica que existan datos de prueba (proveedores, sucursales, productos)');
    console.log('2. Revisa si se requiere autenticación (token)');
    console.log('3. Verifica la estructura de datos esperada por el backend');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testCompraConnection, testMultipleUrls };