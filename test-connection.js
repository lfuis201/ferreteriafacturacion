// Script para probar la conectividad entre frontend y backend
import axios from 'axios';

async function testConnection() {
    console.log('🔍 Probando conectividad frontend-backend...\n');
    
    const API_URL = 'http://127.0.0.1:4000/api';
    
    try {
        console.log(`📡 Probando conexión con: ${API_URL}`);
        
        // Test 1: Probar endpoint de compras
        console.log('✅ Probando endpoint de compras...');
        const response = await axios.get(`${API_URL}/compras`, {
            timeout: 5000,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`✅ Conexión exitosa!`);
        console.log(`📊 Status: ${response.status}`);
        console.log(`📋 Compras encontradas: ${response.data.length || 0}`);
        
        console.log('\n🎉 ¡Frontend y Backend están sincronizados correctamente!');
        console.log('✅ El formulario de compras debería funcionar ahora.');
        
    } catch (error) {
        console.log('❌ Error de conectividad:');
        
        if (error.code === 'ECONNREFUSED') {
            console.log('🔌 El backend no está ejecutándose');
            console.log('💡 Solución: Ejecuta "npm start" en la carpeta backend');
        } else if (error.response && error.response.status === 401) {
            console.log('🔐 Error de autenticación (esto es normal para endpoints protegidos)');
            console.log('✅ El backend está funcionando correctamente');
        } else if (error.response) {
            console.log(`📡 Respuesta del servidor: ${error.response.status} - ${error.response.statusText}`);
        } else {
            console.log(`🚫 Error: ${error.message}`);
        }
    }
}

testConnection();