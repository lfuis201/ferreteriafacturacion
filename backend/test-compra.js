const sequelize = require('./src/config/database');
const Compra = require('./src/models/Compra');

async function testCrearCompra() {
  try {
    console.log('Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('Conexión establecida exitosamente.');

    // Datos de prueba similares a los que envía el frontend
    const datosCompra = {
      tipoComprobante: 'FACTURA ELECTRÓNICA', // Valor que envía el frontend
      serieComprobante: 'F001',
      numeroComprobante: '00000001',
      fechaCompra: new Date(),
      fechaVencimiento: new Date(),
      moneda: 'PEN',
      tipoCambio: 1.00,
      ordenCompra: null,
      constDetraccion: null,
      fechaDetraccion: null,
      porcentajeDetraccion: 0,
      periodoCompra: new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0'),
      condicionPago: 'CONTADO',
      subtotal: 100.00,
      igv: 18.00,
      total: 118.00,
      estado: 'PENDIENTE',
      observacion: 'Compra de prueba',
      proveedorId: 1, // Asumiendo que existe un proveedor con ID 1
      sucursalId: 1,  // Asumiendo que existe una sucursal con ID 1
      usuarioId: 1    // Asumiendo que existe un usuario con ID 1
    };

    console.log('Intentando crear compra con datos:', JSON.stringify(datosCompra, null, 2));

    // Intentar crear la compra
    const nuevaCompra = await Compra.create(datosCompra);
    console.log('Compra creada exitosamente:', nuevaCompra.id);

  } catch (error) {
    console.error('Error al crear compra:', error.message);
    console.error('Detalles del error:', error);
  } finally {
    await sequelize.close();
    console.log('Conexión cerrada.');
  }
}

testCrearCompra();