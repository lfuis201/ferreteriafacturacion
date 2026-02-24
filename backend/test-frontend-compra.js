const axios = require('axios');

async function testFrontendCompra() {
  try {
    // Datos exactos que envía el frontend
    const compraData = {
      tipoComprobante: 'FACTURA ELECTRÓNICA',
      serie: 'F001',
      numero: '00000001',
      fechaEmision: new Date().toISOString().split('T')[0],
      fechaVencimiento: new Date().toISOString().split('T')[0],
      proveedor: '1', // ID del proveedor
      moneda: 'Soles',
      tipoCambio: '3.511',
      ordenCompra: '',
      observaciones: 'Compra de prueba desde frontend',
      constDetraccion: '',
      fechaDetraccion: '',
      porcentajeDetraccion: '',
      periodoCompra: new Date().toISOString().slice(0, 7),
      condicionPago: 'Contado',
      sucursalId: '1',
      estado: 'PENDIENTE',
      detalles: [
        {
          productoId: '1',
          cantidad: 1,
          precioUnitario: 100,
          subtotal: 100
        }
      ],
      subtotal: 100,
      igv: 18,
      total: 118,
      pagos: []
    };

    console.log('Enviando datos al backend:', JSON.stringify(compraData, null, 2));

    // Simular petición POST al backend
    const response = await axios.post('http://127.0.0.1:4000/api/compras', compraData, {
      headers: {
        'Content-Type': 'application/json',
        // Aquí deberías agregar el token de autenticación si es necesario
        // 'Authorization': 'Bearer tu_token_aqui'
      }
    });

    console.log('Respuesta exitosa:', response.data);

  } catch (error) {
    console.error('Error al crear compra:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('No se recibió respuesta del servidor');
      console.error('Request:', error.request);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testFrontendCompra();