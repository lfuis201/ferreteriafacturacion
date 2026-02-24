const axios = require('axios');

// Configuración
const API_URL = 'http://127.0.0.1:4000/api';

// Función para probar la conectividad básica
async function probarConectividad() {
  console.log('🔍 1. Probando conectividad básica...');
  
  // Probar diferentes endpoints
  const endpoints = [
    '/health',
    '/api-docs',
    '/auth/login',
    '/proveedores',
    '/sucursales'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`   Probando: ${API_URL}${endpoint}`);
      const response = await axios.get(`${API_URL}${endpoint}`, { timeout: 5000 });
      console.log(`✅ Servidor respondiendo en ${endpoint}`);
      return true;
    } catch (error) {
      console.log(`   ❌ ${endpoint}: ${error.response?.status || error.message}`);
    }
  }
  
  console.log('❌ Servidor backend NO responde en ningún endpoint');
  return false;
}

// Función para probar autenticación
async function probarAutenticacion() {
  console.log('\n🔍 2. Probando autenticación...');
  
  try {
    // Intentar login con credenciales de prueba
    const loginData = {
      email: 'admin@ferreteria.com', // Ajustar según tus datos
      password: 'admin123' // Ajustar según tus datos
    };
    
    const response = await axios.post(`${API_URL}/auth/login`, loginData);
    
    if (response.data.token) {
      console.log('✅ Autenticación exitosa');
      console.log('   Token obtenido:', response.data.token.substring(0, 20) + '...');
      return response.data.token;
    } else {
      console.log('❌ No se obtuvo token en la respuesta');
      return null;
    }
    
  } catch (error) {
    console.log('❌ Error en autenticación');
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Mensaje:', error.response.data?.mensaje || error.response.data?.message);
    } else {
      console.log('   Error:', error.message);
    }
    return null;
  }
}

// Función para obtener datos necesarios
async function obtenerDatosNecesarios(token) {
  console.log('\n🔍 3. Obteniendo datos necesarios...');
  
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  
  try {
    // Obtener proveedores
    console.log('   - Obteniendo proveedores...');
    const proveedoresRes = await axios.get(`${API_URL}/proveedores`, { headers });
    const proveedores = proveedoresRes.data.data || proveedoresRes.data;
    console.log(`   ✅ ${proveedores.length} proveedores encontrados`);
    
    // Obtener sucursales
    console.log('   - Obteniendo sucursales...');
    const sucursalesRes = await axios.get(`${API_URL}/sucursales`, { headers });
    const sucursales = sucursalesRes.data.data || sucursalesRes.data;
    console.log(`   ✅ ${sucursales.length} sucursales encontradas`);
    
    // Obtener productos
    console.log('   - Obteniendo productos...');
    const productosRes = await axios.get(`${API_URL}/productos`, { headers });
    const productos = productosRes.data.data || productosRes.data;
    console.log(`   ✅ ${productos.length} productos encontrados`);
    
    return {
      proveedor: proveedores[0],
      sucursal: sucursales[0],
      producto: productos[0]
    };
    
  } catch (error) {
    console.log('❌ Error obteniendo datos necesarios');
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   URL:', error.config.url);
      console.log('   Mensaje:', error.response.data?.mensaje || error.response.data?.message);
    } else {
      console.log('   Error:', error.message);
    }
    return null;
  }
}

// Función para crear compra de prueba
async function crearCompraPrueba(token, datos) {
  console.log('\n🔍 4. Creando compra de prueba...');
  
  if (!datos || !datos.proveedor || !datos.sucursal || !datos.producto) {
    console.log('❌ Faltan datos necesarios para crear la compra');
    return false;
  }
  
  const compraData = {
    proveedorId: datos.proveedor.id,
    sucursalId: datos.sucursal.id,
    serie: 'F001',
    numero: `${Date.now()}`, // Número único basado en timestamp
    tipoComprobante: 'FACTURA',
    fechaEmision: new Date().toISOString().split('T')[0],
    fechaVencimiento: new Date().toISOString().split('T')[0],
    moneda: 'PEN',
    observaciones: 'Compra de prueba - diagnóstico',
    detalles: [
      {
        productoId: datos.producto.id,
        cantidad: 1,
        precioUnitario: 10.00,
        descuento: 0
      }
    ],
    subtotal: 10.00,
    igv: 1.80,
    total: 11.80,
    estado: 'PENDIENTE'
  };
  
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  try {
    console.log('   Datos de la compra:');
    console.log('   - Proveedor ID:', compraData.proveedorId);
    console.log('   - Sucursal ID:', compraData.sucursalId);
    console.log('   - Producto ID:', compraData.detalles[0].productoId);
    console.log('   - Total:', compraData.total);
    
    const response = await axios.post(`${API_URL}/compras`, compraData, { 
      headers,
      timeout: 10000 
    });
    
    console.log('✅ Compra creada exitosamente!');
    console.log('   ID de compra:', response.data.data?.id || response.data.id);
    console.log('   Estado:', response.data.data?.estado || response.data.estado);
    
    return true;
    
  } catch (error) {
    console.log('❌ Error al crear compra');
    
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Status Text:', error.response.statusText);
      console.log('   Datos de error:', JSON.stringify(error.response.data, null, 2));
      
      // Mostrar detalles específicos del error
      if (error.response.data.errors) {
        console.log('   Errores de validación:');
        Object.entries(error.response.data.errors).forEach(([field, messages]) => {
          console.log(`     - ${field}: ${messages.join(', ')}`);
        });
      }
      
    } else if (error.request) {
      console.log('   No se recibió respuesta del servidor');
      console.log('   Request config:', error.config);
      
    } else {
      console.log('   Error de configuración:', error.message);
    }
    
    return false;
  }
}

// Función principal de diagnóstico
async function ejecutarDiagnostico() {
  console.log('🧪 DIAGNÓSTICO COMPLETO DE COMPRAS');
  console.log('=====================================\n');
  
  // 1. Probar conectividad
  const conectividad = await probarConectividad();
  if (!conectividad) {
    console.log('\n❌ DIAGNÓSTICO FALLIDO: Backend no disponible');
    console.log('\n🔧 Solución: Ejecuta "npm start" en el directorio backend');
    return;
  }
  
  // 2. Probar autenticación
  const token = await probarAutenticacion();
  
  // 3. Obtener datos necesarios
  const datos = await obtenerDatosNecesarios(token);
  if (!datos) {
    console.log('\n❌ DIAGNÓSTICO FALLIDO: No se pudieron obtener datos necesarios');
    return;
  }
  
  // 4. Crear compra de prueba
  const compraCreada = await crearCompraPrueba(token, datos);
  
  // Resumen final
  console.log('\n📋 RESUMEN DEL DIAGNÓSTICO');
  console.log('==========================');
  console.log('✅ Conectividad:', conectividad ? 'OK' : 'FALLO');
  console.log('✅ Autenticación:', token ? 'OK' : 'FALLO');
  console.log('✅ Datos necesarios:', datos ? 'OK' : 'FALLO');
  console.log('✅ Creación de compra:', compraCreada ? 'OK' : 'FALLO');
  
  if (compraCreada) {
    console.log('\n🎉 ¡DIAGNÓSTICO EXITOSO!');
    console.log('El backend puede crear compras correctamente.');
    console.log('\n📋 Próximos pasos:');
    console.log('1. Verifica que el frontend esté usando la URL correcta');
    console.log('2. Asegúrate de que el usuario esté autenticado en el frontend');
    console.log('3. Revisa la consola del navegador para errores específicos');
  } else {
    console.log('\n❌ DIAGNÓSTICO FALLIDO');
    console.log('Revisa los errores específicos mostrados arriba.');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  ejecutarDiagnostico().catch(console.error);
}

module.exports = { ejecutarDiagnostico };