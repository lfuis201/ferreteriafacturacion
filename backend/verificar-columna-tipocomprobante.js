const sequelize = require('./src/config/database');

async function verificarValoresEnum() {
  try {
    console.log('Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('Conexión establecida exitosamente.');

    // Verificar los valores ENUM de tipoComprobante
    console.log('Verificando valores ENUM de tipoComprobante...');
    const [results] = await sequelize.query(`
      SELECT COLUMN_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'compra' 
      AND COLUMN_NAME = 'tipoComprobante'
    `);

    if (results.length > 0) {
      console.log('Valores ENUM actuales:', results[0].COLUMN_TYPE);
      
      // Verificar si necesitamos actualizar los valores ENUM
      const columnType = results[0].COLUMN_TYPE;
      const expectedValues = [
        'FACTURA ELECTRÓNICA',
        'BOLETA DE VENTA ELECTRONICA', 
        'NOTA DE CREDITO',
        'NOTA DE DEBITO',
        'GUÍA',
        'NOTA DE VENTA',
        'RECIBO POR HONORARIOS',
        'SERVICIOS PÚBLICOS'
      ];

      // Verificar si todos los valores esperados están presentes
      let needsUpdate = false;
      for (const value of expectedValues) {
        if (!columnType.includes(value)) {
          console.log(`Valor faltante: ${value}`);
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        console.log('Actualizando valores ENUM...');
        await sequelize.query(`
          ALTER TABLE compra 
          MODIFY COLUMN tipoComprobante ENUM(
            'FACTURA ELECTRÓNICA', 
            'BOLETA DE VENTA ELECTRONICA', 
            'NOTA DE CREDITO', 
            'NOTA DE DEBITO', 
            'GUÍA', 
            'NOTA DE VENTA', 
            'RECIBO POR HONORARIOS', 
            'SERVICIOS PÚBLICOS'
          ) NOT NULL
        `);
        console.log('Valores ENUM actualizados exitosamente.');
      } else {
        console.log('Los valores ENUM están correctos.');
      }
    } else {
      console.log('No se encontró la columna tipoComprobante.');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
    console.log('Conexión cerrada.');
  }
}

verificarValoresEnum();