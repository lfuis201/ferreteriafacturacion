// Script para inicializar datos básicos necesarios para el funcionamiento del sistema
const { Proveedor, Sucursal, Producto, Categoria, Usuario } = require('../models');
const bcrypt = require('bcryptjs');

async function inicializarDatosBasicos() {
  try {
    console.log('🚀 Iniciando inicialización de datos básicos...');

    // 1. Crear categoría por defecto
    const [categoria] = await Categoria.findOrCreate({
      where: { id: 1 },
      defaults: {
        nombre: 'General',
        descripcion: 'Categoría general para productos',
        estado: true
      }
    });
    console.log('✅ Categoría creada/verificada:', categoria.nombre);

    // 2. Crear sucursal por defecto
    const [sucursal] = await Sucursal.findOrCreate({
      where: { id: 1 },
      defaults: {
        nombre: 'Sucursal Principal',
        direccion: 'Dirección Principal',
        telefono: '123456789',
        email: 'principal@ferreteria.com',
        estado: true
      }
    });
    console.log('✅ Sucursal creada/verificada:', sucursal.nombre);

    // 3. Crear usuario SuperAdmin por defecto
    const passwordHash = await bcrypt.hash('admin123', 10);
    const [usuario] = await Usuario.findOrCreate({
      where: { correo: 'admin@ferreteria.com' },
      defaults: {
        nombre: 'Administrador',
        apellido: 'Sistema',
        correo: 'admin@ferreteria.com',
        password: passwordHash,
        rol: 'SuperAdmin',
        sucursalId: 1,
        estado: true
      }
    });
    console.log('✅ Usuario SuperAdmin creado/verificado:', usuario.correo);

    // 4. Crear proveedor por defecto
    const [proveedor] = await Proveedor.findOrCreate({
      where: { numeroDocumento: '20123456789' },
      defaults: {
        nombre: 'Proveedor de Prueba S.A.C.',
        tipoDocumento: 'RUC',
        numeroDocumento: '20123456789',
        direccion: 'Av. Principal 123',
        telefono: '987654321',
        email: 'proveedor@test.com',
        estado: true
      }
    });
    console.log('✅ Proveedor creado/verificado:', proveedor.nombre);

    // 5. Crear productos de prueba
    const productos = [
      {
        codigo: 'PROD001',
        nombre: 'Tornillo 1/4"',
        descripcion: 'Tornillo de acero inoxidable 1/4 pulgada',
        precioCompra: 0.50,
        precioVenta: 0.75,
        unidadMedida: 'unidad',
        categoriaId: 1
      },
      {
        codigo: 'PROD002', 
        nombre: 'Tuerca 1/4"',
        descripcion: 'Tuerca de acero inoxidable 1/4 pulgada',
        precioCompra: 0.30,
        precioVenta: 0.45,
        unidadMedida: 'unidad',
        categoriaId: 1
      },
      {
        codigo: 'PROD003',
        nombre: 'Arandela plana',
        descripcion: 'Arandela plana de acero',
        precioCompra: 0.10,
        precioVenta: 0.15,
        unidadMedida: 'unidad',
        categoriaId: 1
      }
    ];

    for (const prodData of productos) {
      const [producto] = await Producto.findOrCreate({
        where: { codigo: prodData.codigo },
        defaults: {
          ...prodData,
          iscActivo: 0,
          sujetoDetraccion: 0,
          estado: true
        }
      });
      console.log('✅ Producto creado/verificado:', producto.nombre);
    }

    console.log('🎉 Datos básicos inicializados correctamente!');
    console.log('');
    console.log('📋 Datos creados:');
    console.log('- Usuario: admin@ferreteria.com / admin123');
    console.log('- Sucursal: Sucursal Principal (ID: 1)');
    console.log('- Proveedor: Proveedor de Prueba S.A.C. (ID: 1)');
    console.log('- Productos: 3 productos de prueba');
    console.log('');
    console.log('✨ Ahora puedes crear compras desde el frontend!');

  } catch (error) {
    console.error('❌ Error al inicializar datos básicos:', error);
    throw error;
  }
}

module.exports = { inicializarDatosBasicos };

// Si se ejecuta directamente
if (require.main === module) {
  inicializarDatosBasicos()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}