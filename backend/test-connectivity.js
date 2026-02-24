const axios = require('axios');

// Configuración exacta del frontend
const API_URL = 'http://localhost:4000/api';

async function testConnectivity() {
  console.log('🔍 === PRUEBA DE CONECTIVIDAD FRONTEND-BACKEND ===\n');
  
  try {
    // 1. Probar conexión básica al servidor
    console.log('1. 🌐 Probando conexión al servidor...');
    const healthResponse = await axios.get(`${API_URL}/health`, { timeout: 5000 });
    console.log('✅ Servidor respondiendo correctamente');
    console.log('   Respuesta:', healthResponse.data);
  } catch (error) {
    console.log('❌ Error de conexión al servidor:');
    console.log('   Error:', error.code || error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('   💡 El servidor no está ejecutándose en el puerto 4000');
      return;
    }
  }

  try {
    // 2. Probar autenticación (login)
    console.log('\n2. 🔐 Probando autenticación...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@ferreteria.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login exitoso');
    console.log('   Token obtenido:', token ? 'Sí' : 'No');

    // 3. Probar endpoint de compras con autenticación
    console.log('\n3. 📋 Probando endpoint de compras...');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Probar GET /compras
    const comprasResponse = await axios.get(`${API_URL}/compras`, { headers });
    console.log('✅ Endpoint GET /compras funciona');
    console.log('   Compras encontradas:', comprasResponse.data.data?.length || 0);

    // 4. Probar datos mínimos para crear compra
    console.log('\n4. 🧪 Probando datos mínimos para crear compra...');
    
    // Verificar proveedores
    const proveedoresResponse = await axios.get(`${API_URL}/proveedores`, { headers });
    const proveedores = proveedoresResponse.data.data || [];
    console.log('   Proveedores disponibles:', proveedores.length);
    
    // Verificar sucursales
    const sucursalesResponse = await axios.get(`${API_URL}/sucursales`, { headers });
    const sucursales = sucursalesResponse.data.data || [];
    console.log('   Sucursales disponibles:', sucursales.length);
    
    // Verificar productos
    const productosResponse = await axios.get(`${API_URL}/productos`, { headers });
    const productos = productosResponse.data.data || [];
    console.log('   Productos disponibles:', productos.length);

    if (proveedores.length === 0) {
      console.log('⚠️  No hay proveedores disponibles');
    }
    if (sucursales.length === 0) {
      console.log('⚠️  No hay sucursales disponibles');
    }
    if (productos.length === 0) {
      console.log('⚠️  No hay productos disponibles');
    }

    // 5. Intentar crear compra con datos válidos
    if (proveedores.length > 0 && sucursales.length > 0 && productos.length > 0) {
      console.log('\n5. 💾 Intentando crear compra de prueba...');
      
      const compraData = {
        proveedorId: proveedores[0].id,
        sucursalId: sucursales[0].id,
        tipoComprobante: 'FACTURA ELECTRÓNICA',
        serieComprobante: 'TEST',
        numeroComprobante: Date.now().toString(),
        fechaCompra: new Date().toISOString().split('T')[0],
        moneda: 'PEN',
        tipoCambio: 1.00,
        condicionPago: 'CONTADO',
        detalles: [
          {
            productoId: productos[0].id,
            cantidad: 1,
            precioUnitario: 10.00,
            subtotal: 10.00
          }
        ],
        subtotal: 10.00,
        igv: 1.80,
        total: 11.80,
        estado: 'PENDIENTE',
        pagos: []
      };

      const crearResponse = await axios.post(`${API_URL}/compras`, compraData, { headers });
      console.log('✅ Compra creada exitosamente');
      console.log('   ID de compra:', crearResponse.data.data?.id);
    } else {
      console.log('\n5. ⚠️  No se puede crear compra de prueba (faltan datos básicos)');
    }

    console.log('\n🎉 Todas las pruebas completadas exitosamente');
    console.log('💡 El problema puede estar en el frontend o en los datos específicos que estás enviando');

  } catch (error) {
    console.log('\n❌ Error durante las pruebas:');
    console.log('   Status:', error.response?.status);
    console.log('   Mensaje:', error.response?.data?.mensaje || error.message);
    
    if (error.response?.data?.errors) {
      console.log('   Errores de validación:', error.response.data.errors);
    }
  }
}

testConnectivity().catch(console.error);