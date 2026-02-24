const sequelize = require('../src/config/database');

async function agregarColumnaDocumentoRelacionadoId() {
  try {
    console.log('🔄 Iniciando migración para agregar columna documentoRelacionadoId...');
    
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión establecida.');

    // Verificar si la columna ya existe
    const [columnas] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM information_schema.columns 
      WHERE table_schema = '${process.env.DB_NAME}' 
      AND table_name = 'MovimientoInventarios' 
      AND column_name = 'documentoRelacionadoId'
    `);

    if (columnas.length > 0) {
      console.log('✅ La columna documentoRelacionadoId ya existe.');
      return;
    }

    // Agregar la columna documentoRelacionadoId
    await sequelize.query(`
      ALTER TABLE MovimientoInventarios 
      ADD COLUMN documentoRelacionadoId INT NULL 
      COMMENT 'ID del documento relacionado'
    `);
    
    console.log('✅ Columna documentoRelacionadoId agregada exitosamente.');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    await sequelize.close();
    console.log('🔌 Conexión cerrada.');
    process.exit();
  }
}

// Ejecutar si este archivo es llamado directamente
if (require.main === module) {
  agregarColumnaDocumentoRelacionadoId();
}

module.exports = agregarColumnaDocumentoRelacionadoId;