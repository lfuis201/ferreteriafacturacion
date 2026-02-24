const axios = require('axios');

const API_URL = 'http://127.0.0.1:4000/api';

async function testFrontendExactSimulation() {
    try {
        console.log('🧪 === SIMULACIÓN EXACTA DEL FRONTEND ===');
        console.log('📊 Estado inicial esperado: Stock = 100');
        
        // 1. Login (igual que el frontend)
        console.log('\n🔐 Paso 1: Iniciando sesión...');
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@ferreteria.com',
            password: 'admin123'
        });
        
        const token = loginResponse.data.token;
        console.log('✅ Login exitoso');
        
        // 2. Configurar headers con token (igual que el frontend)
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
        
        // 3. Verificar stock inicial
        console.log('\n📋 Paso 2: Verificando stock inicial...');
        const stockResponse = await axios.get(`${API_URL}/inventario`, { headers });
        const inventarioInicial = stockResponse.data.data.find(item => 
            item.productoId === 1 && item.sucursalId === 1
        );
        console.log(`📊 Stock inicial: ${inventarioInicial ? inventarioInicial.stock : 'No encontrado'}`);
        
        // 4. Ingresar producto (exactamente como el frontend)
        console.log('\n📦 Paso 3: Ingresando producto...');
        const ingressData = {
            productoId: 1,
            sucursalId: 1,
            cantidad: 10,
            motivo: 'Compra',
            observacion: 'Prueba desde simulación frontend',
            comentarios: 'Test de sincronización',
            fechaRegistro: new Date().toISOString(),
            referenciaId: null
        };
        
        console.log('📤 Datos enviados:', JSON.stringify(ingressData, null, 2));
        
        const ingressResponse = await axios.post(`${API_URL}/inventario/ingresar`, ingressData, { headers });
        
        console.log('✅ Respuesta del servidor:', JSON.stringify(ingressResponse.data, null, 2));
        
        // 5. Verificar stock final
        console.log('\n📋 Paso 4: Verificando stock final...');
        const stockFinalResponse = await axios.get(`${API_URL}/inventario`, { headers });
        const inventarioFinal = stockFinalResponse.data.data.find(item => 
            item.productoId === 1 && item.sucursalId === 1
        );
        console.log(`📊 Stock final: ${inventarioFinal ? inventarioFinal.stock : 'No encontrado'}`);
        
        // 6. Verificar que el incremento sea correcto
        if (inventarioFinal && inventarioInicial) {
            const incremento = inventarioFinal.stock - inventarioInicial.stock;
            console.log(`\n🔢 Análisis:`);
            console.log(`   Stock inicial: ${inventarioInicial.stock}`);
            console.log(`   Cantidad ingresada: ${ingressData.cantidad}`);
            console.log(`   Stock final: ${inventarioFinal.stock}`);
            console.log(`   Incremento real: ${incremento}`);
            
            if (incremento === ingressData.cantidad) {
                console.log('✅ ¡PERFECTO! El incremento es correcto');
            } else {
                console.log('❌ ERROR: El incremento no coincide');
            }
        }
        
        console.log('\n🎉 === SIMULACIÓN COMPLETADA ===');
        
    } catch (error) {
        console.error('❌ Error en la simulación:', error.response?.data || error.message);
        if (error.response?.data) {
            console.error('📋 Detalles del error:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

// Ejecutar la simulación
testFrontendExactSimulation();