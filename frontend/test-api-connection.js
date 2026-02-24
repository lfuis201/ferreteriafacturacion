// Script para probar la conectividad con el backend
import axios from 'axios';

async function testApiConnection() {
    console.log('🔍 Probando conectividad con el backend...\n');
    
    const urls = [
        'http://localhost:4000/api',
        'http://127.0.0.1:4000/api'
    ];
    
    for (const baseUrl of urls) {
        console.log(`📡 Probando: ${baseUrl}`);
        
        try {
            // Test 1: Endpoint de compras (GET)
            console.log('  ✅ Probando endpoint de compras...');
            const comprasResponse = await axios.get(`${baseUrl}/compras`, {
                timeout: 5000,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log(`  ✅ Endpoint de compras exitoso: ${comprasResponse.status}`);
            console.log(`  📊 Compras encontradas: ${comprasResponse.data.length || 0}`);
            
            // Test 2: Crear compra de prueba
            console.log('  ✅ Probando crear compra...');
            const compraData = {
                proveedor: 'Proveedor Test',
                sucursal: 'Sucursal Test',
                serie: 'TEST',
                numero: '001',
                fecha: new Date().toISOString().split('T')[0],
                subtotal: 100,
                igv: 18,
                total: 118,
                detalles: [
                    {
                        producto: 'Producto Test',
                        cantidad: 1,
                        precio: 100,
                        subtotal: 100
                    }
                ]
            };
            
            const createResponse = await axios.post(`${baseUrl}/compras`, compraData, {
                timeout: 5000,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log(`  ✅ Crear compra exitoso: ${createResponse.status}`);
            console.log(`  📝 ID de compra creada: ${createResponse.data.id || 'N/A'}`);
            
            console.log(`\n🎉 ¡Conectividad exitosa con ${baseUrl}!\n`);
            return baseUrl;
            
        } catch (error) {
            console.log(`  ❌ Error con ${baseUrl}:`);
            if (error.code === 'ECONNREFUSED') {
                console.log('    🔌 Conexión rechazada - El servidor no está ejecutándose');
            } else if (error.code === 'ETIMEDOUT') {
                console.log('    ⏰ Timeout - El servidor no responde');
            } else if (error.response) {
                console.log(`    📡 Respuesta del servidor: ${error.response.status} - ${error.response.statusText}`);
                console.log(`    📄 Datos: ${JSON.stringify(error.response.data, null, 2)}`);
            } else {
                console.log(`    🚫 Error: ${error.message}`);
            }
            console.log('');
        }
    }
    
    console.log('❌ No se pudo conectar con ninguna URL del backend');
    return null;
}

// Ejecutar el test
testApiConnection()
    .then(workingUrl => {
        if (workingUrl) {
            console.log(`✅ URL funcional encontrada: ${workingUrl}`);
            console.log('\n📋 Recomendaciones:');
            console.log(`1. Asegúrate de que el frontend use: ${workingUrl}`);
            console.log('2. Verifica que el backend esté ejecutándose');
            console.log('3. Revisa la configuración de CORS si es necesario');
        } else {
            console.log('\n🔧 Pasos para solucionar:');
            console.log('1. Inicia el servidor backend: npm start');
            console.log('2. Verifica que esté ejecutándose en el puerto 4000');
            console.log('3. Revisa los logs del backend para errores');
        }
    })
    .catch(error => {
        console.error('💥 Error ejecutando el test:', error.message);
    });