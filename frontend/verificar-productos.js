const axios = require('axios');

async function verificarProductos() {
  try {
    console.log('🔍 Verificando productos disponibles...');
    
    // Obtener productos del backend
    const response = await axios.get('http://127.0.0.1:4000/api/productos', {
      timeout: 10000
    });

    console.log('📊 Respuesta del servidor:', response.status);
    
    if (response.data && response.data.productos) {
      const productos = response.data.productos;
      console.log(`📦 Total de productos encontrados: ${productos.length}`);
      
      // Filtrar productos activos
      const productosActivos = productos.filter(p => p.estado === true);
      console.log(`✅ Productos activos: ${productosActivos.length}`);
      
      // Mostrar algunos productos activos
      if (productosActivos.length > 0) {
        console.log('\n🏷️ Primeros 5 productos activos:');
        productosActivos.slice(0, 5).forEach((producto, index) => {
          console.log(`${index + 1}. ID: ${producto.id}, Código: ${producto.codigo}, Nombre: ${producto.nombre}, Estado: ${producto.estado}`);
        });
      } else {
        console.log('⚠️ No se encontraron productos activos');
      }
      
      // Verificar productos inactivos
      const productosInactivos = productos.filter(p => p.estado === false);
      if (productosInactivos.length > 0) {
        console.log(`\n❌ Productos inactivos: ${productosInactivos.length}`);
        console.log('🔧 Estos productos no aparecerán en el formulario de compras');
      }
      
    } else {
      console.log('❌ No se encontraron productos en la respuesta');
    }

  } catch (error) {
    console.error('❌ Error al verificar productos:');
    
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📋 Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('🔌 No se recibió respuesta del servidor');
      console.error('🔧 Verifica que el backend esté ejecutándose en el puerto 4000');
    } else {
      console.error('⚙️ Error de configuración:', error.message);
    }
  }
}

// Ejecutar la verificación
verificarProductos();