const axios = require('axios');

// Configuración
const API_URL = 'http://127.0.0.1:4000/api';

// Datos de prueba para crear una compra
const compraData = {
  tipoComprobante: 'FACTURA ELECTRÓNICA',
  serie: 'F001',
  numero: '00000001',
  fechaEmision: '2024-01-15',
  fechaVencimiento: '2024-01-15',
  proveedor: '1', // ID del proveedor
  moneda: 'Soles',
  tipoCambio: '3.511',
  ordenCompra: '',
  observaciones: 'Compra de prueba',
  constDetraccion: '',
  fechaDetraccion: '',
  porcentajeDetraccion: '',
  periodoCompra: '2024-01',
  condicionPago: 'Contado',
  sucursalId: '1', // ID de la sucursal
  estado: 'PENDIENTE',
  detalles: [
    {
      productoId: '1',
      cantidad: 1,
      precioUnitario: 10.00,
      subtotal: 10.00
    }
  ],
  subtotal: 10.00,
  igv: 1.80,
  total: 11.80,
  pagos: []
};

async function probarCrearCompra() {
  try {
    console.log('🔍 Probando conectividad con el backend...');
    
    // Primero verificar que el backend esté disponible
    const healthCheck = await axios.get(`${API_URL}/health`).catch(() => null);
    if (!healthCheck) {
      console.log('❌ Backend no disponible en', API_URL);
      return;
    }
    
    console.log('✅ Backend disponible');
    console.log('📤 Enviando datos de compra...');
    console.log('Datos:', JSON.stringify(compraData, null, 2));
    
    // Intentar crear la compra
    const response = await axios.post(`${API_URL}/compras`, compraData, {
      headers: {
        'Content-Type': 'application/json',
        // Agregar token si es necesario
        // 'Authorization': 'Bearer YOUR_TOKEN_HERE'
      }
    });
    
    console.log('✅ Compra creada exitosamente!');
    console.log('Respuesta:', response.data);
    
  } catch (error) {
    console.error('❌ Error al crear compra:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('No se recibió respuesta del servidor');
      console.error('Request:', error.request);
    } else {
      console.error('Error de configuración:', error.message);
    }
  }
}

// Ejecutar la prueba
probarCrearCompra();