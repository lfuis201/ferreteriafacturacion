const { ConfiguracionWhatsapp, Sucursal } = require('../models');
const { sequelize } = require('../config/database');

async function inicializarConfiguracionWhatsApp() {
  try {
    console.log('🔄 Inicializando configuraciones de WhatsApp...');
    
    // Obtener todas las sucursales
    const sucursales = await Sucursal.findAll();
    
    if (sucursales.length === 0) {
      console.log('⚠️ No se encontraron sucursales. Creando sucursal por defecto...');
      
      // Crear sucursal por defecto si no existe
      const sucursalDefault = await Sucursal.create({
        nombre: 'Sucursal Principal',
        direccion: 'Dirección Principal',
        telefono: '999999999',
        email: 'principal@ferreteria.com',
        activo: true
      });
      
      sucursales.push(sucursalDefault);
    }
    
    // Crear configuración de WhatsApp para cada sucursal
    for (const sucursal of sucursales) {
      const configuracionExistente = await ConfiguracionWhatsapp.findOne({
        where: { sucursalId: sucursal.id }
      });
      
      if (!configuracionExistente) {
        console.log(`📱 Creando configuración WhatsApp para sucursal ${sucursal.id} - ${sucursal.nombre}`);
        
        await ConfiguracionWhatsapp.create({
          sucursalId: sucursal.id,
          usuarioId: null,
          proveedor: 'baileys',
          activo: true,
          apiKey: 'BAILEYS_FREE',
          apiSecret: null,
          apiUrl: 'local://baileys',
          numeroTelefono: '+51999999999', // Número por defecto - debe cambiarse
          plantillaMensaje: 'Hola {{cliente}}, adjunto encontrarás tu comprobante {{tipo}} {{numero}} por un total de S/ {{total}}. Gracias por tu compra en {{empresa}}.',
          mensajeSaludo: '¡Hola! Te enviamos tu comprobante de compra.',
          mensajeDespedida: 'Gracias por tu preferencia. ¡Que tengas un buen día!',
          envioAutomatico: false,
          tiposComprobante: ['factura', 'boleta'],
          formatosEnvio: ['pdf'],
          horarioInicio: '08:00:00',
          horarioFin: '18:00:00',
          limiteMensajesDia: 999999
        });
        
        console.log(`✅ Configuración WhatsApp creada para sucursal ${sucursal.id}`);
      } else {
        console.log(`ℹ️ Configuración WhatsApp ya existe para sucursal ${sucursal.id}`);
      }
    }
    
    console.log('✅ Configuraciones de WhatsApp inicializadas correctamente');
    
    // Mostrar resumen
    const totalConfiguraciones = await ConfiguracionWhatsapp.count();
    console.log(`📊 Total de configuraciones WhatsApp: ${totalConfiguraciones}`);
    
  } catch (error) {
    console.error('❌ Error al inicializar configuraciones WhatsApp:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  inicializarConfiguracionWhatsApp()
    .then(() => {
      console.log('🎉 Proceso completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en el proceso:', error);
      process.exit(1);
    });
}

module.exports = { inicializarConfiguracionWhatsApp };