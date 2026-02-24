// Script para crear solo el usuario de prueba (SuperAdmin)
// La contraseña se pasa en texto plano: el modelo Usuario tiene beforeCreate que la hashea.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const { Usuario } = require('../models');

async function inicializarDatosBasicos() {
  try {
    console.log('🚀 Creando usuario de prueba...');

    const [usuario, created] = await Usuario.findOrCreate({
      where: { correo: 'admin@ferreteria.com' },
      defaults: {
        nombre: 'Administrador',
        apellido: 'Sistema',
        correo: 'admin@ferreteria.com',
        password: 'admin123', // texto plano; el hook beforeCreate del modelo lo hashea
        rol: 'SuperAdmin',
        sucursalId: null,
        estado: true
      }
    });

    if (!created) {
      await usuario.update({ password: 'admin123' }); // actualizar por si estaba mal hasheado
    }

    console.log('✅ Usuario SuperAdmin creado/verificado:', usuario.correo);
    console.log('');
    console.log('📋 Credenciales:');
    console.log('   Correo:      admin@ferreteria.com');
    console.log('   Contraseña:  admin123');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

module.exports = { inicializarDatosBasicos };

if (require.main === module) {
  inicializarDatosBasicos()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
