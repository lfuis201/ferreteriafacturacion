const { sequelize } = require('../src/models');
const ContabilidadController = require('../src/controllers/contabilidad.controller');

/**
 * Script para inicializar el módulo de contabilidad
 * Crea el plan de cuentas básico y datos de ejemplo
 */

async function inicializarContabilidad() {
  try {
    console.log('🚀 Iniciando configuración del módulo de contabilidad...');

    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');

    // Sincronizar modelos (crear tablas si no existen)
    await sequelize.sync({ alter: true });
    console.log('✅ Tablas de contabilidad sincronizadas');

    // Crear un objeto request/response mock para usar el controlador
    const mockReq = {
      body: {},
      query: {},
      params: {}
    };

    const mockRes = {
      status: (code) => ({
        json: (data) => {
          if (code === 200 || code === 201) {
            console.log('✅ Plan de cuentas inicializado exitosamente');
            console.log(`📊 Cuentas creadas: ${data.cuentasCreadas}`);
          } else {
            console.log('⚠️ ', data.message);
          }
          return data;
        }
      }),
      json: (data) => {
        if (data.success) {
          console.log('✅ Plan de cuentas inicializado exitosamente');
          console.log(`📊 Cuentas creadas: ${data.cuentasCreadas}`);
        } else {
          console.log('⚠️ ', data.message);
        }
        return data;
      }
    };

    // Inicializar plan de cuentas
    console.log('📋 Inicializando plan de cuentas básico...');
    await ContabilidadController.inicializarPlanCuentas(mockReq, mockRes);

    console.log('\n🎉 ¡Módulo de contabilidad configurado exitosamente!');
    console.log('\n📚 Funcionalidades disponibles:');
    console.log('   • Plan de cuentas según PCGE');
    console.log('   • Libro diario automático');
    console.log('   • Libro mayor');
    console.log('   • Balance de comprobación');
    console.log('   • Reportes SUNAT (Formatos 5.1, 6.1, 8.1, 14.1)');
    console.log('   • Asientos contables automáticos para ventas y compras');

    console.log('\n🔗 Endpoints disponibles:');
    console.log('   GET  /api/contabilidad/plan-cuentas');
    console.log('   POST /api/contabilidad/plan-cuentas');
    console.log('   GET  /api/contabilidad/libro-diario');
    console.log('   GET  /api/contabilidad/libro-mayor');
    console.log('   GET  /api/contabilidad/balance-comprobacion');
    console.log('   GET  /api/contabilidad/reportes-sunat/libro-diario');
    console.log('   GET  /api/contabilidad/reportes-sunat/libro-mayor');
    console.log('   GET  /api/contabilidad/reportes-sunat/registro-ventas');
    console.log('   GET  /api/contabilidad/reportes-sunat/registro-compras');
    console.log('   GET  /api/contabilidad/reportes-sunat/declaracion-mensual');

    console.log('\n📖 Documentación disponible en: http://localhost:4000/api-docs');

  } catch (error) {
    console.error('❌ Error al inicializar contabilidad:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
    console.log('🔌 Conexión a la base de datos cerrada');
    process.exit(0);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  inicializarContabilidad();
}

module.exports = { inicializarContabilidad };