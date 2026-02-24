const axios = require('axios');

async function testCompraEndpoint() {
  try {
    console.log('🔍 Probando endpoint de compras...');
    
    // Datos de prueba similares a los del frontend
    const compraData = {
      tipoComprobante: 'BOLETA DE VENTA ELECT',
      serie: 'T001',
      numero: '42871938',
      fechaEmision: '2025-01-26',
      fechaVencimiento: '2025-01-26',
      proveedor: '1', // ID del proveedor
      moneda: 'Soles',
      tipoCambio: '3.511',
      ordenCompra: '',
      observaciones: 'Observaciones Listas',
      constDetraccion: '',
      fechaDetraccion: '',
      porcentajeDetraccion: '',
      periodoCompra: '2025-01',
      condicionPago: 'Contado',
      sucursalId: '1',
      estado: 'PENDIENTE',
      detalles: [
        {
          productoId: '1',
          cantidad: 3,
          precioUnitario: 0.00,
          subtotal: 0.00
        }
      ],
      subtotal: 0.00,
      igv: 0.00,
      total: 0.01,
      pagos: []
    };

    console.log('📤 Enviando datos:', JSON.stringify(compraData, null, 2));

    // Hacer la petición al backend
    const response = await axios.post('http://127.0.0.1:4000/api/compras', compraData, {
      headers: {
        'Content-Type': 'application/json',
        // Nota: En producción necesitarías un token válido
        // 'Authorization': 'Bearer tu_token_aqui'
      },
      timeout: 10000
    });

    console.log('✅ Respuesta exitosa:', response.data);

  } catch (error) {
    console.error('❌ Error al probar endpoint:');
    
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📋 Data:', JSON.stringify(error.response.data, null, 2));
      console.error('📝 Headers:', error.response.headers);
    } else if (error.request) {
      console.error('🔌 No se recibió respuesta del servidor');
      console.error('📡 Request:', error.request);
    } else {
      console.error('⚙️ Error de configuración:', error.message);
    }
  }
}

// Ejecutar la prueba
testCompraEndpoint();