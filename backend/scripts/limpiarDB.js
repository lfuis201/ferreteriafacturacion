const sequelize = require('../src/config/database');

async function limpiarBaseDatos() {
  try {
    console.log('🔄 Iniciando limpieza completa de la base de datos...');
    
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión establecida.');

    // Desactivar verificación de claves foráneas
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    console.log('🔓 Restricciones de clave foránea desactivadas.');

    // Obtener todas las tablas
    const [tablas] = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM information_schema.tables 
      WHERE table_schema = '${process.env.DB_NAME}'
    `);
    
    console.log(`📋 Encontradas ${tablas.length} tablas para eliminar.`);

    // Eliminar todas las tablas una por una
    for (const tabla of tablas) {
      const nombreTabla = tabla.TABLE_NAME;
      try {
        await sequelize.query(`DROP TABLE IF EXISTS \`${nombreTabla}\``);
        console.log(`🗑️  Tabla ${nombreTabla} eliminada.`);
      } catch (error) {
        console.log(`⚠️  Error eliminando ${nombreTabla}:`, error.message);
      }
    }

    // Reactivar verificación de claves foráneas
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('🔒 Restricciones de clave foránea reactivadas.');

    console.log('✅ Base de datos limpiada exitosamente.');

  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
  } finally {
    await sequelize.close();
    console.log('🔌 Conexión cerrada.');
    process.exit();
  }
}

// Ejecutar si este archivo es llamado directamente
if (require.main === module) {
  limpiarBaseDatos();
}
 
module.exports = limpiarBaseDatos; 




//node scripts/limpiarDB.js // Para limpiar la base de datos