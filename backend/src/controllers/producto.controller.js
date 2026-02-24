const { Producto, Categoria, Presentacion, Sucursal, Almacen, InventarioAlmacen, Inventario, sequelize } = require('../models');
const { Op } = require('sequelize');

// Obtener todos los productos
// Obtener todos los productos
exports.obtenerProductos = async (req, res) => {
  try {
    const { categoriaId, nombre } = req.query;

    // Construir el objeto de condiciones para el filtro
    const whereConditions = { estado: true };

    if (categoriaId) {
      whereConditions.categoriaId = categoriaId;
    }

    if (nombre) {
      whereConditions.nombre = {
        [Op.like]: `%${nombre}%`
      };
    }

    const productos = await Producto.findAll({
      where: whereConditions,
      include: [
        { association: 'Categorium', attributes: ['id', 'nombre'] },
        { model: Sucursal, attributes: ['id', 'nombre'] }
      ]
    });

    res.json({ productos });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener productos', error: error.message });
  }
};

// Obtener un producto por ID
exports.obtenerProductoPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const producto = await Producto.findOne({
      where: { id, estado: true },
      include: [
        { association: 'Categorium', attributes: ['id', 'nombre'] },
        { model: Sucursal, attributes: ['id', 'nombre'] },
        { model: Presentacion, where: { estado: true }, required: false }
      ]
    });

    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    res.json({ producto });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener el producto', error: error.message });
  }
};




// Crear un nuevo producto
// Crear un nuevo producto
exports.crearProducto = async (req, res) => {
  try {
    // Verificar permisos (solo SuperAdmin, Admin y Almacenero pueden crear productos)
    if (req.usuario &&
      req.usuario.rol !== 'SuperAdmin' &&
      req.usuario.rol !== 'Admin' &&
      req.usuario.rol !== 'Almacenero') {
      return res.status(403).json({ mensaje: 'No tiene permisos para crear productos' });
    }

    // Las imágenes son opcionales

    const {
      nombre,
      codigo,
      descripcion,
      precioCompra,
      precioVenta,
      productosRelacionados,
      codigoTipoMoneda,
      codigoTipoAfectacionIgvVenta,
      tieneIgv,
      codigoTipoAfectacionIgvCompra,
      stock,
      stockMinimo,
      unidadMedida,
      codigoBarras,
      tipodeAfectacion,
      modelo,
      marca,
      origen,
      codigosunat,
      codigoprovedorOEM,
      codigoCompetencia,
      rangoAnos,
      observaciones,
      categoriaId,
      sucursalId,
      iscActivo,
      tipoAplicacionISC,
      sujetoDetraccion,
      // Datos de presentaciones
    presentacion,
    presentaciones
  } = req.body;

  // Parsear presentaciones si vienen como string JSON
  let presentacionesData = [];
  
  // Manejar tanto el formato antiguo (presentacion) como el nuevo (presentaciones)
  if (presentaciones) {
    try {
      presentacionesData = typeof presentaciones === 'string' ? JSON.parse(presentaciones) : presentaciones;
      if (!Array.isArray(presentacionesData)) {
        presentacionesData = [presentacionesData];
      }
    } catch (error) {
      return res.status(400).json({ mensaje: 'Formato de presentaciones inválido' });
    }
  } else if (presentacion) {
    // Compatibilidad con formato antiguo
    try {
      const presentacionData = typeof presentacion === 'string' ? JSON.parse(presentacion) : presentacion;
      presentacionesData = [presentacionData];
    } catch (error) {
      return res.status(400).json({ mensaje: 'Formato de presentación inválido' });
    }
  }

    // Verificar si la categoría existe (solo si se proporciona)
    if (categoriaId) {
      const categoriaExiste = await Categoria.findOne({
        where: { id: categoriaId, estado: true }
      });
      if (!categoriaExiste) {
        return res.status(400).json({ mensaje: 'La categoría seleccionada no existe o está inactiva' });
      }
    }

    // Verificar si ya existe un producto con el mismo código
    if (codigo) {
      const productoExistente = await Producto.findOne({ where: { codigo } });
      if (productoExistente) {
        return res.status(400).json({ mensaje: 'Ya existe un producto con ese código' });
      }
    }

    // Generar URLs completas para las imágenes
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const imagenesUrls = [];

    // Agregar la primera imagen (opcional)
    if (req.files && req.files.imagen1 && req.files.imagen1.length > 0) {
      imagenesUrls.push(`${baseUrl}/uploads/${req.files.imagen1[0].filename}`);
    }

    // Agregar la segunda imagen (opcional)
    if (req.files && req.files.imagen2 && req.files.imagen2.length > 0) {
      imagenesUrls.push(`${baseUrl}/uploads/${req.files.imagen2[0].filename}`);
    }

    // Agregar la tercera imagen (opcional)
    if (req.files && req.files.imagen3 && req.files.imagen3.length > 0) {
      imagenesUrls.push(`${baseUrl}/uploads/${req.files.imagen3[0].filename}`);
    }

    // Crear el producto
    const nuevoProducto = await Producto.create({
      nombre,
      codigo,
      descripcion,
      precioCompra,
      precioVenta,
      productosRelacionados,
      codigoTipoMoneda,
      codigoTipoAfectacionIgvVenta,
      tieneIgv: tieneIgv !== undefined ? tieneIgv : true,
      codigoTipoAfectacionIgvCompra,
      stock: stock || 0,
      stockMinimo: stockMinimo || 0,
      unidadMedida,
      imagen: imagenesUrls.length > 0 ? imagenesUrls.join(',') : null, // Guardar las URLs completas separadas por comas o null si no hay imágenes
      codigoBarras,
      tipodeAfectacion,
      modelo,
      marca,
      origen,
      codigosunat,
      codigoprovedorOEM,
      codigoCompetencia,
      rangoAnos,
      observaciones,
      categoriaId,
      sucursalId,
      iscActivo: iscActivo || false,
      tipoAplicacionISC: iscActivo ? tipoAplicacionISC : null,
      sujetoDetraccion: sujetoDetraccion || false
    });

    // Crear inventario en almacén si se especifica una sucursal
    if (sucursalId) {
      try {
        // Buscar el almacén principal de la sucursal
        const almacenPrincipal = await Almacen.findOne({
          where: { 
            sucursalId: sucursalId, 
            estado: true,
            tipo: 'PRINCIPAL'
          }
        });
        
        if (almacenPrincipal) {
          await InventarioAlmacen.create({
            productoId: nuevoProducto.id,
            almacenId: almacenPrincipal.id,
            stock: stock || 0,
            stockMinimo: stockMinimo || 0,
            stockMaximo: null,
            precioVenta: precioVenta,
            ubicacionFisica: null,
            estado: true
          });
        }
      } catch (inventarioError) {
        console.log('Advertencia: No se pudo crear el inventario automáticamente:', inventarioError.message);
        // No fallar la creación del producto por esto
      }
    }

    // Crear presentaciones si se proporcionan datos
    let presentacionesCreadas = [];
    if (presentacionesData && presentacionesData.length > 0) {
      try {
        for (const presentacionData of presentacionesData) {
          if (presentacionData && (presentacionData.factor || presentacionData.descripcion)) {
            const nuevaPresentacion = await Presentacion.create({
              descripcion: presentacionData.descripcion || 'Presentación por defecto',
              factor: presentacionData.factor || 1,
              precio1: presentacionData.precio || precioVenta,
              unidadMedida: presentacionData.unidadMedida || 'NIU',
              codigoBarras: presentacionData.codigoBarras || null,
              productoId: nuevoProducto.id
            });
            presentacionesCreadas.push(nuevaPresentacion);
          }
        }
      } catch (presentacionError) {
        // Si falla la creación de alguna presentación, eliminar el producto creado
        await nuevoProducto.destroy();
        return res.status(500).json({ 
          mensaje: 'Error al crear las presentaciones del producto', 
          error: presentacionError.message 
        });
      }
    }

    res.status(201).json({
      mensaje: presentacionesCreadas.length > 0 ? 
        `Producto y ${presentacionesCreadas.length} presentación${presentacionesCreadas.length > 1 ? 'es' : ''} creados exitosamente` : 
        'Producto creado exitosamente',
      producto: nuevoProducto,
      presentaciones: presentacionesCreadas,
      // Mantener compatibilidad con código anterior
      presentacion: presentacionesCreadas.length > 0 ? presentacionesCreadas[0] : null
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear el producto', error: error.message });
  }
};





// Actualizar un producto
exports.actualizarProducto = async (req, res) => {
  const { id } = req.params;
  const {
    nombre,
    codigo,
    descripcion,
    precioCompra,
    precioVenta,
    productosRelacionados,
    codigoTipoMoneda,
    codigoTipoAfectacionIgvVenta,
    tieneIgv,
    codigoTipoAfectacionIgvCompra,
    stock,
    stockMinimo,
    unidadMedida,
    codigoBarras,
    tipodeAfectacion,
    modelo,
    marca,
    origen,
    codigosunat,
    codigoprovedorOEM,
    codigoCompetencia,
    rangoAnos,
    observaciones,
    categoriaId,
    sucursalId,
    iscActivo,
    tipoAplicacionISC,
    sujetoDetraccion,
    presentaciones,
    presentacion
  } = req.body;

  // Convertir campos booleanos de string a boolean si es necesario
  const iscActivoBool = iscActivo === 'true' || iscActivo === true;
  const sujetoDetraccionBool = sujetoDetraccion === 'true' || sujetoDetraccion === true;
  const tieneIgvBool = tieneIgv === 'true' || tieneIgv === true || tieneIgv === undefined ? true : false;

  // Procesar presentaciones
  let presentacionesData = [];
  if (presentaciones) {
    try {
      presentacionesData = typeof presentaciones === 'string' ? JSON.parse(presentaciones) : presentaciones;
      if (!Array.isArray(presentacionesData)) {
        presentacionesData = [presentacionesData];
      }
    } catch (error) {
      return res.status(400).json({ mensaje: 'Formato de presentaciones inválido' });
    }
  } else if (presentacion) {
    try {
      const presentacionData = typeof presentacion === 'string' ? JSON.parse(presentacion) : presentacion;
      presentacionesData = [presentacionData];
    } catch (error) {
      return res.status(400).json({ mensaje: 'Formato de presentación inválido' });
    }
  }

  try {
    // Verificar permisos (solo SuperAdmin, Admin y Almacenero pueden actualizar productos)
    if (req.usuario &&
      req.usuario.rol !== 'SuperAdmin' &&
      req.usuario.rol !== 'Admin' &&
      req.usuario.rol !== 'Almacenero') {
      return res.status(403).json({ mensaje: 'No tiene permisos para actualizar productos' });
    }

    // Verificar si el producto existe
    const producto = await Producto.findByPk(id);
    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    // Verificar si la categoría existe (si se está actualizando)
    if (categoriaId) {
      const categoriaExiste = await Categoria.findOne({
        where: { id: categoriaId, estado: true }
      });
      if (!categoriaExiste) {
        return res.status(400).json({ mensaje: 'La categoría seleccionada no existe o está inactiva' });
      }
    }

    // Verificar si ya existe otro producto con el mismo código
    if (codigo && codigo !== producto.codigo) {
      const productoExistente = await Producto.findOne({ where: { codigo } });
      if (productoExistente) {
        return res.status(400).json({ mensaje: 'Ya existe otro producto con ese código' });
      }
    }

    // Generar URLs completas para las imágenes
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const imagenesUrls = [];

    // Agregar la primera imagen (opcional)
    if (req.files && req.files.imagen1 && req.files.imagen1.length > 0) {
      imagenesUrls.push(`${baseUrl}/uploads/${req.files.imagen1[0].filename}`);
    }

    // Agregar la segunda imagen (opcional)
    if (req.files && req.files.imagen2 && req.files.imagen2.length > 0) {
      imagenesUrls.push(`${baseUrl}/uploads/${req.files.imagen2[0].filename}`);
    }

    // Agregar la tercera imagen (opcional)
    if (req.files && req.files.imagen3 && req.files.imagen3.length > 0) {
      imagenesUrls.push(`${baseUrl}/uploads/${req.files.imagen3[0].filename}`);
    }

    // Actualizar el producto
    await producto.update({
      nombre: nombre || producto.nombre,
      codigo: codigo || producto.codigo,
      descripcion: descripcion !== undefined ? descripcion : producto.descripcion,
      precioCompra: precioCompra || producto.precioCompra,
      precioVenta: precioVenta || producto.precioVenta,
      productosRelacionados: productosRelacionados !== undefined ? productosRelacionados : producto.productosRelacionados,
      codigoTipoMoneda: codigoTipoMoneda !== undefined ? codigoTipoMoneda : producto.codigoTipoMoneda,
      codigoTipoAfectacionIgvVenta: codigoTipoAfectacionIgvVenta !== undefined ? codigoTipoAfectacionIgvVenta : producto.codigoTipoAfectacionIgvVenta,
      tieneIgv: tieneIgv !== undefined ? tieneIgvBool : producto.tieneIgv,
      codigoTipoAfectacionIgvCompra: codigoTipoAfectacionIgvCompra !== undefined ? codigoTipoAfectacionIgvCompra : producto.codigoTipoAfectacionIgvCompra,
      stock: stock !== undefined ? stock : producto.stock,
      stockMinimo: stockMinimo !== undefined ? stockMinimo : producto.stockMinimo,
      unidadMedida: unidadMedida || producto.unidadMedida,
      imagen: imagenesUrls.length > 0 ? imagenesUrls.join(',') : producto.imagen,
      codigoBarras: codigoBarras !== undefined ? codigoBarras : producto.codigoBarras,
      tipodeAfectacion: tipodeAfectacion || producto.tipodeAfectacion,
      modelo: modelo !== undefined ? modelo : producto.modelo,
      marca: marca !== undefined ? marca : producto.marca,
      origen: origen !== undefined ? origen : producto.origen,
      codigosunat: codigosunat !== undefined ? codigosunat : producto.codigosunat,
      codigoprovedorOEM: codigoprovedorOEM !== undefined ? codigoprovedorOEM : producto.codigoprovedorOEM,
      codigoCompetencia: codigoCompetencia !== undefined ? codigoCompetencia : producto.codigoCompetencia,
      rangoAnos: rangoAnos !== undefined ? rangoAnos : producto.rangoAnos,
      observaciones: observaciones !== undefined ? observaciones : producto.observaciones,
      categoriaId: categoriaId || producto.categoriaId,
      sucursalId: sucursalId || producto.sucursalId,
      iscActivo: iscActivo !== undefined ? iscActivoBool : producto.iscActivo,
      tipoAplicacionISC: iscActivoBool ? tipoAplicacionISC : null,
      sujetoDetraccion: sujetoDetraccion !== undefined ? sujetoDetraccionBool : producto.sujetoDetraccion
    });

    // Sincronizar precio de venta en inventarios si se actualiza el precio del producto
    if (precioVenta !== undefined && precioVenta !== producto.precioVenta) {
      try {
        // Actualizar el precio de venta en todos los inventarios de este producto
        await Inventario.update(
          { precioVenta: precioVenta },
          { where: { productoId: producto.id } }
        );
        console.log(`Precio de venta sincronizado en inventarios para producto ${producto.id}: ${precioVenta}`);
      } catch (error) {
        console.error('Error al sincronizar precio de venta en inventarios:', error);
      }
    }

    // Actualizar inventario si se proporcionan stock y sucursalId
    if (sucursalId && (stock !== undefined || stockMinimo !== undefined)) {
      // Buscar el almacén principal de la sucursal
      const almacenPrincipal = await Almacen.findOne({
        where: { sucursalId: sucursalId, esPrincipal: true, estado: true }
      });

      if (almacenPrincipal) {
        // Buscar o crear el inventario del producto en el almacén
        const [inventario, created] = await InventarioAlmacen.findOrCreate({
          where: {
            productoId: producto.id,
            almacenId: almacenPrincipal.id
          },
          defaults: {
            stock: stock || 0,
            stockMinimo: stockMinimo || 0,
            stockMaximo: 0,
            precioVenta: precioVenta || producto.precioVenta,
            ubicacionFisica: '',
            estado: true
          }
        });

        // Si ya existía, actualizar solo los campos proporcionados
        if (!created) {
          const updateData = {};
          if (stock !== undefined) updateData.stock = stock;
          if (stockMinimo !== undefined) updateData.stockMinimo = stockMinimo;
          if (precioVenta !== undefined) updateData.precioVenta = precioVenta;
          
          if (Object.keys(updateData).length > 0) {
            await inventario.update(updateData);
          }
        }
      }
    }

    // Manejar presentaciones si se proporcionan
    let presentacionesActualizadas = [];
    if (presentacionesData && presentacionesData.length > 0) {
      try {
        // Eliminar presentaciones existentes del producto
        await Presentacion.destroy({
          where: { productoId: producto.id }
        });

        // Crear las nuevas presentaciones
        for (const presentacionData of presentacionesData) {
          if (presentacionData && (presentacionData.factor || presentacionData.descripcion)) {
            const nuevaPresentacion = await Presentacion.create({
              descripcion: presentacionData.descripcion || 'Presentación por defecto',
              factor: presentacionData.factor || 1,
              precio1: presentacionData.precio1 || presentacionData.precio || precioVenta || producto.precioVenta,
              precio2: presentacionData.precio2 || 0,
              precio3: presentacionData.precio3 || 0,
              unidadMedida: presentacionData.unidadMedida || 'NIU',
              codigoBarras: presentacionData.codigoBarras || null,
              esDefecto: presentacionData.esDefecto || false,
              productoId: producto.id
            });
            presentacionesActualizadas.push(nuevaPresentacion);
          }
        }
      } catch (presentacionError) {
        console.error('Error al actualizar presentaciones:', presentacionError);
        // No fallar la actualización del producto por errores en presentaciones
      }
    }

    res.json({
      mensaje: presentacionesActualizadas.length > 0 ? 
        `Producto actualizado exitosamente con ${presentacionesActualizadas.length} presentación${presentacionesActualizadas.length > 1 ? 'es' : ''}` : 
        'Producto actualizado exitosamente',
      producto,
      presentaciones: presentacionesActualizadas
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar el producto', error: error.message });
  }
};

// Eliminar un producto (eliminar completamente)
exports.eliminarProducto = async (req, res) => {
  const { id } = req.params;
  try {
    // Verificar permisos (solo SuperAdmin, Admin y Almacenero pueden eliminar productos)
    if (req.usuario &&
        req.usuario.rol !== 'SuperAdmin' &&
        req.usuario.rol !== 'Admin' &&
        req.usuario.rol !== 'Almacenero') {
      return res.status(403).json({ mensaje: 'No tiene permisos para eliminar productos' });
    }

    // Verificar si el producto existe
    const producto = await Producto.findByPk(id);
    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    // Eliminar el producto
    await producto.destroy();

    res.json({ mensaje: 'Producto eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar el producto', error: error.message });
  }
};

// Importar productos desde Excel
exports.importarExcel = async (req, res) => {
  const XLSX = require('xlsx');
  
  try {
    // Verificar permisos
    if (req.usuario &&
        req.usuario.rol !== 'SuperAdmin' &&
        req.usuario.rol !== 'Admin' &&
        req.usuario.rol !== 'Almacenero') {
      return res.status(403).json({ mensaje: 'No tiene permisos para importar productos' });
    }

    // Verificar que se haya subido un archivo
    if (!req.file) {
      return res.status(400).json({ mensaje: 'No se ha proporcionado ningún archivo' });
    }

    // Leer el archivo Excel
    const workbook = XLSX.read(req.file.buffer);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convertir a JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (jsonData.length < 2) {
      return res.status(400).json({ mensaje: 'El archivo debe contener al menos una fila de encabezados y una fila de datos' });
    }

    // Obtener encabezados (primera fila)
    const encabezadosOriginales = jsonData[0].map(col => col?.toString().trim());
    
    // Mapeo de columnas de Excel a campos de base de datos
    const mapeoColumnas = {
      'nombre': ['Nombre', 'NOMBRE', 'nombre'],
      'codigo': ['Código Interno', 'Codigo Interno', 'CODIGO INTERNO', 'codigo', 'CODIGO'],
      'codigo_proveedor_oem': ['Código Proveedor (OEM)', 'Codigo Proveedor (OEM)', 'CODIGO PROVEEDOR (OEM)'],
      'codigo_competencia': ['Código competencia', 'Codigo competencia', 'CODIGO COMPETENCIA'],
      'productos_relacionados': ['Productos relacionados', 'PRODUCTOS RELACIONADOS'],
      'aplicacion': ['Aplicación', 'Aplicacion', 'APLICACION'],
      'modelo': ['Modelo', 'MODELO'],
      'origen': ['Origen', 'ORIGEN'],
      'descripcion': ['Descripción', 'Descripcion', 'DESCRIPCION'],
      'codigo_sunat': ['Código Sunat', 'Codigo Sunat', 'CODIGO SUNAT'],
      'codigo_tipo_de_unidad': ['Código Tipo de Unidad', 'Codigo Tipo de Unidad', 'CODIGO TIPO DE UNIDAD'],
      'codigo_tipo_de_moneda': ['Código Tipo de Moneda', 'Codigo Tipo de Moneda', 'CODIGO TIPO DE MONEDA'],
      'precio_unitario_venta': ['Precio Unitario Venta', 'PRECIO UNITARIO VENTA', 'precio_venta', 'PRECIO_VENTA', 'precio venta'],
      'codigo_tipo_de_afectacion_del_igv_venta': ['Codigo Tipo de Afectación del Igv Venta', 'CODIGO TIPO DE AFECTACION DEL IGV VENTA'],
      'tiene_igv': ['Tiene Igv', 'TIENE IGV'],
      'precio_unitario_compra': ['Precio Unitario Compra', 'PRECIO UNITARIO COMPRA', 'precio_compra', 'PRECIO_COMPRA', 'precio compra'],
      'codigo_tipo_de_afectacion_del_igv_compra': ['Codigo Tipo de Afectación del Igv Compra', 'CODIGO TIPO DE AFECTACION DEL IGV COMPRA'],
      'stock': ['Stock', 'STOCK'],
      'stock_minimo': ['Stock Mínimo', 'Stock Minimo', 'STOCK MINIMO'],
      'categoria': ['Categoria', 'CATEGORIA'],
      'marca': ['Marca', 'MARCA'],
      'rango_anos': ['Rango años', 'Rango anos', 'RANGO ANOS'],
      'cod_barras': ['Cód barras', 'Cod barras', 'COD BARRAS', 'codigo_barras', 'CODIGO BARRAS']
    };
    
    // Crear mapeo de índices de columnas
    const indicesColumnas = {};
    Object.keys(mapeoColumnas).forEach(campo => {
      const posiblesNombres = mapeoColumnas[campo];
      const indice = encabezadosOriginales.findIndex(encabezado => 
        posiblesNombres.includes(encabezado)
      );
      if (indice !== -1) {
        indicesColumnas[campo] = indice;
      }
    });
    
    // Validar columnas requeridas
    const columnasRequeridas = ['nombre', 'codigo', 'precio_unitario_compra', 'precio_unitario_venta'];
    const columnasFaltantes = columnasRequeridas.filter(col => indicesColumnas[col] === undefined);
    
    if (columnasFaltantes.length > 0) {
      const nombresEsperados = columnasFaltantes.map(campo => {
        const posiblesNombres = mapeoColumnas[campo] || [];
        return posiblesNombres[0] || campo;
      });
      return res.status(400).json({ 
        mensaje: `Faltan las siguientes columnas requeridas: ${nombresEsperados.join(', ')}` 
      });
    }

    const transaction = await sequelize.transaction();
    
    try {
      let productosCreados = 0;
      let presentacionesCreadas = 0;
      const errores = [];
      
      // Obtener mapas de categorías, sucursales y almacenes para optimizar consultas
      const categorias = await Categoria.findAll({ transaction });
      const sucursales = await Sucursal.findAll({ transaction });
      const almacenes = await Almacen.findAll({ transaction });
      
      const mapaCategorias = {};
      const mapaSucursales = {};
      const mapaAlmacenes = {};
      
      categorias.forEach(cat => {
        mapaCategorias[cat.nombre.toLowerCase()] = cat.id;
      });
      
      sucursales.forEach(suc => {
        mapaSucursales[suc.nombre.toLowerCase()] = suc.id;
      });
      
      almacenes.forEach(alm => {
        mapaAlmacenes[alm.nombre.toLowerCase()] = alm.id;
      });

      // Procesar cada fila de datos
      for (let i = 1; i < jsonData.length; i++) {
        const fila = jsonData[i];
        
        // Saltar filas vacías
        if (fila.length === 0 || !fila.some(cell => cell !== null && cell !== undefined && cell !== '')) {
          continue;
        }

        try {
          const producto = {};
          
          // Mapear datos de la fila usando los índices de columnas
          Object.keys(indicesColumnas).forEach(campo => {
            const indice = indicesColumnas[campo];
            const valor = fila[indice];
            if (valor !== null && valor !== undefined && valor !== '') {
              producto[campo] = valor;
            }
          });

          // Validar campos requeridos (sucursal es opcional)
          const camposRequeridos = ['nombre', 'codigo', 'precio_unitario_compra', 'precio_unitario_venta'];
          const camposFaltantes = camposRequeridos.filter(campo => !producto[campo]);
          
          console.log(`Fila ${i + 1}: Producto:`, producto);
          console.log(`Fila ${i + 1}: Campos faltantes:`, camposFaltantes);
          
          if (camposFaltantes.length > 0) {
            console.log(`Fila ${i + 1}: Error - Campos requeridos faltantes`);
            errores.push({
              fila: i + 1,
              error: `Campos requeridos faltantes: ${camposFaltantes.join(', ')}`
            });
            continue;
          }

          // Validar y obtener/crear categoría (opcional)
          let categoriaId = null;
          if (producto.categoria && producto.categoria.trim() !== '') {
            const categoriaNombre = producto.categoria.toLowerCase();
            categoriaId = mapaCategorias[categoriaNombre];
            
            // Si la categoría no existe, crearla automáticamente
            if (!categoriaId) {
              try {
                const nuevaCategoria = await Categoria.create({
                  nombre: producto.categoria.trim(),
                  descripcion: `Categoría creada automáticamente durante importación`,
                  estado: true
                }, { transaction });
                
                categoriaId = nuevaCategoria.id;
                mapaCategorias[categoriaNombre] = categoriaId;
                
                console.log(`Categoría '${producto.categoria}' creada automáticamente con ID: ${categoriaId}`);
              } catch (categoriaError) {
                errores.push({
                  fila: i + 1,
                  error: `Error al crear categoría '${producto.categoria}': ${categoriaError.message}`
                });
                continue;
              }
            }
          }

          // Validar y obtener/crear sucursal (opcional)
          let sucursalId = null;
          if (producto.sucursal && producto.sucursal.trim() !== '') {
            const sucursalNombre = producto.sucursal.toLowerCase();
            sucursalId = mapaSucursales[sucursalNombre];
            
            // Si la sucursal no existe, crearla automáticamente
            if (!sucursalId) {
              try {
                const nuevaSucursal = await Sucursal.create({
                  nombre: producto.sucursal.trim(),
                  ubicacion: 'Por definir',
                  telefono: null,
                  email: null,
                  estado: true,
                  ruc: '00000000000',
                  razonSocial: `Sucursal ${producto.sucursal.trim()}`,
                  nombreComercial: producto.sucursal.trim(),
                  direccion: 'Dirección por definir',
                  ubigeo: '000000',
                  urbanizacion: 'Por definir',
                  distrito: 'Por definir',
                  provincia: 'Por definir',
                  departamento: 'Por definir'
                }, { transaction });
                
                sucursalId = nuevaSucursal.id;
                mapaSucursales[sucursalNombre] = sucursalId;
                
                console.log(`Sucursal '${producto.sucursal}' creada automáticamente con ID: ${sucursalId}`);
              } catch (sucursalError) {
                errores.push({
                  fila: i + 1,
                  error: `Error al crear sucursal '${producto.sucursal}': ${sucursalError.message}`
                });
                continue;
              }
            }
          }
          // Si no se especifica sucursal, sucursalId permanece como null (permitido por el modelo)

          // Validar y obtener/crear almacén (opcional)
          let almacenId = null;
          if (producto.almacen && producto.almacen.trim() !== '') {
            const almacenNombre = producto.almacen.toLowerCase();
            almacenId = mapaAlmacenes[almacenNombre];
            
            // Si el almacén no existe, crearlo automáticamente
            if (!almacenId) {
              try {
                const nuevoAlmacen = await Almacen.create({
                  nombre: producto.almacen.trim(),
                  descripcion: `Almacén creado automáticamente durante importación`,
                  ubicacion: 'Por definir',
                  estado: true,
                  sucursalId: sucursalId // Asignar la sucursal del producto
                }, { transaction });
                
                almacenId = nuevoAlmacen.id;
                mapaAlmacenes[almacenNombre] = almacenId;
                
                console.log(`Almacén '${producto.almacen}' creado automáticamente con ID: ${almacenId}`);
              } catch (almacenError) {
                errores.push({
                  fila: i + 1,
                  error: `Error al crear almacén '${producto.almacen}': ${almacenError.message}`
                });
                continue;
              }
            }
          }

          // Validar precios
          const precioCompra = parseFloat(producto.precio_unitario_compra);
          const precioVenta = parseFloat(producto.precio_unitario_venta);
          
          if (isNaN(precioCompra) || precioCompra <= 0) {
            errores.push({
              fila: i + 1,
              error: 'Precio de compra debe ser un número mayor a 0'
            });
            continue;
          }
          
          if (isNaN(precioVenta) || precioVenta <= 0) {
            errores.push({
              fila: i + 1,
              error: 'Precio de venta debe ser un número mayor a 0'
            });
            continue;
          }

          // Verificar si el producto ya existe por código
          const productoExistenteCodigo = await Producto.findOne({
            where: { codigo: producto.codigo },
            transaction
          });
          
          if (productoExistenteCodigo) {
            errores.push({
              fila: i + 1,
              error: `Producto con código '${producto.codigo}' ya existe`
            });
            continue;
          }

          // Verificar si el código de barras ya existe (solo si no está vacío)
          if (producto.cod_barras && producto.cod_barras.trim() !== '') {
            const productoExistenteCodigoBarras = await Producto.findOne({
              where: { codigoBarras: producto.cod_barras.trim() },
              transaction
            });
            
            if (productoExistenteCodigoBarras) {
              errores.push({
                fila: i + 1,
                error: `Producto con código de barras '${producto.cod_barras}' ya existe`
              });
              continue;
            }
          }

          // Crear el producto
          const datosProducto = {
            nombre: producto.nombre,
            codigo: producto.codigo,
            descripcion: producto.aplicacion || producto.descripcion || '',
            precioCompra: precioCompra,
            precioVenta: precioVenta,
            productosRelacionados: producto.productos_relacionados || '',
            codigoTipoMoneda: producto.codigo_tipo_de_moneda || 'PEN',
            codigoTipoAfectacionIgvVenta: producto.codigo_tipo_de_afectacion_del_igv_venta || '10',
            tieneIgv: producto.tiene_igv === 'Si' || producto.tiene_igv === 'si' || producto.tiene_igv === true || true,
            codigoTipoAfectacionIgvCompra: producto.codigo_tipo_de_afectacion_del_igv_compra || '10',
            stock: producto.stock ? parseInt(producto.stock) : 0,
            stockMinimo: producto.stock_minimo ? parseInt(producto.stock_minimo) : 0,
            unidadMedida: producto.codigo_tipo_de_unidad || 'NIU',
            tipodeAfectacion: producto.tipo_afectacion || 'Gravado_Operación_Onerosa',
            modelo: producto.modelo || '',
            marca: producto.marca || '',
            origen: producto.origen || 'PERU',
            codigosunat: producto.codigo_sunat || '',
            codigoprovedorOEM: producto.codigo_proveedor_oem || '',
            codigoCompetencia: producto.codigo_competencia || '',
            rangoAnos: producto.rango_anos || '',
            observaciones: producto.observaciones || '',
            iscActivo: producto.isc_activo === 'true' || producto.isc_activo === true || false,
            tipoAplicacionISC: producto.tipo_aplicacion_isc || 'Sistema al valor',
            sujetoDetraccion: producto.sujeto_detraccion === 'true' || producto.sujeto_detraccion === true || false
          };
          
          // Solo agregar codigoBarras si no está vacío
          if (producto.cod_barras && producto.cod_barras.trim() !== '') {
            datosProducto.codigoBarras = producto.cod_barras.trim();
          }
          
          // Agregar categoriaId solo si tiene valor
          if (categoriaId) {
            datosProducto.categoriaId = categoriaId;
          }
          
          // Agregar sucursalId solo si tiene valor
          if (sucursalId) {
            datosProducto.sucursalId = sucursalId;
          }
          
          const nuevoProducto = await Producto.create(datosProducto, { transaction });
          
          productosCreados++;

          // Crear inventario por almacén (solo si se especificó un almacén)
          if (almacenId) {
            const stockInicial = producto.stock_inicial ? parseInt(producto.stock_inicial) : 0;
            const stockMinimo = producto.stock_minimo ? parseInt(producto.stock_minimo) : 5;
            const stockMaximo = producto.stock_maximo ? parseInt(producto.stock_maximo) : null;
            const ubicacionFisica = producto.ubicacion_fisica || null;

            await InventarioAlmacen.create({
              productoId: nuevoProducto.id,
              almacenId: almacenId,
              stock: stockInicial,
              stockMinimo: stockMinimo,
              stockMaximo: stockMaximo,
              precioVenta: precioVenta,
              ubicacionFisica: ubicacionFisica,
              estado: true
            }, { transaction });
          }

          // Crear presentación si se proporcionan datos básicos
          if (producto.presentacion_descripcion || producto.presentacion_factor || 
              producto.presentacion_precio1 || producto.presentacion_precio2 || producto.presentacion_precio3) {
            
            const datosPresentacion = {
              productoId: nuevoProducto.id,
              descripcion: producto.presentacion_descripcion || null,
              factor: producto.presentacion_factor ? parseFloat(producto.presentacion_factor) : 1.0,
              unidadMedida: producto.presentacion_unidad_medida || 'unidad',
              estado: true
            };
            
            // Agregar precios si están disponibles
            if (producto.presentacion_precio1 && !isNaN(parseFloat(producto.presentacion_precio1))) {
              datosPresentacion.precio1 = parseFloat(producto.presentacion_precio1);
            }
            if (producto.presentacion_precio2 && !isNaN(parseFloat(producto.presentacion_precio2))) {
              datosPresentacion.precio2 = parseFloat(producto.presentacion_precio2);
            }
            if (producto.presentacion_precio3 && !isNaN(parseFloat(producto.presentacion_precio3))) {
              datosPresentacion.precio3 = parseFloat(producto.presentacion_precio3);
            }
            
            // Agregar código de barras si no está vacío
            if (producto.presentacion_codigo_barras && producto.presentacion_codigo_barras.trim() !== '') {
              datosPresentacion.codigoBarras = producto.presentacion_codigo_barras.trim();
            }
            
            try {
              await Presentacion.create(datosPresentacion, { transaction });
              presentacionesCreadas++;
            } catch (presentacionError) {
              console.log(`Error al crear presentación para producto ${producto.codigo}: ${presentacionError.message}`);
              // No agregamos a errores porque el producto principal se creó exitosamente
            }
          }
          
        } catch (error) {
          let mensajeError = error.message;
          
          // Manejar errores específicos de validación
          if (error.name === 'SequelizeUniqueConstraintError') {
            if (error.fields && error.fields.codigo) {
              const codigoError = (typeof producto !== 'undefined' && producto.codigo) ? producto.codigo : 'desconocido';
              mensajeError = `El código '${codigoError}' ya existe en la base de datos`;
            } else if (error.fields && error.fields.codigoBarras) {
              const codigoBarrasError = (typeof producto !== 'undefined' && producto.codigo_barras) ? producto.codigo_barras : 'desconocido';
              mensajeError = `El código de barras '${codigoBarrasError}' ya existe en la base de datos`;
            } else {
              mensajeError = 'Error de duplicación: ' + error.message;
            }
          } else if (error.name === 'SequelizeValidationError') {
            const erroresValidacion = error.errors.map(err => err.message).join(', ');
            mensajeError = `Errores de validación: ${erroresValidacion}`;
          } else if (error.name === 'SequelizeForeignKeyConstraintError') {
            mensajeError = 'Error de referencia: Verifique que la categoría o sucursal existan';
          }
          
          errores.push({
            fila: i + 1,
            error: mensajeError
          });
        }
      }
      
      await transaction.commit();
      
      res.json({
        mensaje: 'Importación completada',
        productosCreados,
        presentacionesCreadas,
        errores,
        resumen: {
          totalFilas: jsonData.length - 1,
          exitosos: productosCreados,
          conErrores: errores.length
        }
      });
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
    
  } catch (error) {
    console.error('Error en importación de Excel:', error);
    res.status(500).json({ 
      mensaje: 'Error al procesar el archivo Excel', 
      error: error.message 
    });
  }
};

// Exportar productos a Excel
exports.exportarExcel = async (req, res) => {
  try {
    const { categoriaId, sucursalId, fechaDesde, fechaHasta } = req.query;
    
    console.log('Parámetros recibidos en backend:', req.query);
    console.log('categoriaId:', categoriaId, 'sucursalId:', sucursalId);
    
    // Construir filtros
    const filtros = {
      include: [
        {
          model: Categoria,
          attributes: ['nombre']
        },
        {
          model: Sucursal,
          attributes: ['nombre']
        },
        {          model: Presentacion,          attributes: ['descripcion', 'precio1', 'precio2', 'precio3', 'factor', 'unidadMedida']        }
      ]
    };
    
    const where = {};
    
    if (categoriaId) {
      where.categoriaId = categoriaId;
      console.log('Filtro categoriaId aplicado:', categoriaId);
    }
    
    if (sucursalId) {
      where.sucursalId = sucursalId;
      console.log('Filtro sucursalId aplicado:', sucursalId);
    }
    
    if (fechaDesde || fechaHasta) {
      where.createdAt = {};
      if (fechaDesde) {
        where.createdAt[Op.gte] = new Date(fechaDesde);
      }
      if (fechaHasta) {
        where.createdAt[Op.lte] = new Date(fechaHasta + ' 23:59:59');
      }
    }
    
    filtros.where = where;
    
    console.log('Filtros finales aplicados:', JSON.stringify(filtros, null, 2));
    
    // Obtener productos
    const productos = await Producto.findAll(filtros);
    
    console.log('Número de productos encontrados:', productos.length);
    
    // Preparar datos para Excel usando el formato de la plantilla de importación
    const datosExcel = [];
    
    productos.forEach(producto => {
      if (producto.Presentacions && producto.Presentacions.length > 0) {
        // Si tiene presentaciones, crear una fila por cada presentación
        producto.Presentacions.forEach(presentacion => {
          datosExcel.push({
            'Nombre': producto.nombre,
            'Código Interno': producto.codigo,
            'Código Proveedor (OEM)': producto.codigo_proveedor_oem || '',
            'Código competencia': producto.codigo_competencia || '',
            'Productos relacionados': producto.productos_relacionados || '',
            'Aplicación': producto.aplicacion || '',
            'Modelo': producto.modelo || '',
            'Origen': producto.origen || '',
            'Descripción': producto.descripcion || '',
            'Código Sunat': producto.codigo_sunat || '',
            'Código Tipo de Unidad': producto.codigo_tipo_de_unidad || 'NIU',
            'Código Tipo de Moneda': producto.codigo_tipo_de_moneda || 'PEN',
            'Precio Unitario Venta': producto.precio_venta,
            'Codigo Tipo de Afectación del Igv Venta': producto.codigo_tipo_de_afectacion_del_igv_venta || '10',
            'Tiene Igv': producto.tiene_igv ? 'Sí' : 'No',
            'Precio Unitario Compra': producto.precio_compra,
            'Codigo Tipo de Afectación del Igv Compra': producto.codigo_tipo_de_afectacion_del_igv_compra || '10',
            'Stock': producto.stock || 0,
            'Stock Mínimo': producto.stock_minimo || 0,
            'Categoria': producto.Categoria ? producto.Categoria.nombre : '',
            'Marca': producto.marca || '',
            'Rango años': producto.rango_anos || '',
            'Cód barras': presentacion.codigoBarras || producto.codigo_barras || ''
          });
        });
      } else {
        // Si no tiene presentaciones, crear una fila simple
        datosExcel.push({
          'Nombre': producto.nombre,
          'Código Interno': producto.codigo,
          'Código Proveedor (OEM)': producto.codigo_proveedor_oem || '',
          'Código competencia': producto.codigo_competencia || '',
          'Productos relacionados': producto.productos_relacionados || '',
          'Aplicación': producto.aplicacion || '',
          'Modelo': producto.modelo || '',
          'Origen': producto.origen || '',
          'Descripción': producto.descripcion || '',
          'Código Sunat': producto.codigo_sunat || '',
          'Código Tipo de Unidad': producto.codigo_tipo_de_unidad || 'NIU',
          'Código Tipo de Moneda': producto.codigo_tipo_de_moneda || 'PEN',
          'Precio Unitario Venta': producto.precio_venta,
          'Codigo Tipo de Afectación del Igv Venta': producto.codigo_tipo_de_afectacion_del_igv_venta || '10',
          'Tiene Igv': producto.tiene_igv ? 'Sí' : 'No',
          'Precio Unitario Compra': producto.precio_compra,
          'Codigo Tipo de Afectación del Igv Compra': producto.codigo_tipo_de_afectacion_del_igv_compra || '10',
          'Stock': producto.stock || 0,
          'Stock Mínimo': producto.stock_minimo || 0,
          'Categoria': producto.Categoria ? producto.Categoria.nombre : '',
          'Marca': producto.marca || '',
          'Rango años': producto.rango_anos || '',
          'Cód barras': producto.codigo_barras || ''
        });
      }
    });
    
    // Crear libro de Excel
    const XLSX = require('xlsx');
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(datosExcel);
    
    // Configurar ancho de columnas
    const columnWidths = [
      { wch: 15 }, // Código
      { wch: 30 }, // Nombre
      { wch: 40 }, // Descripción
      { wch: 20 }, // Categoría
      { wch: 20 }, // Sucursal
      { wch: 15 }, // Precio Compra
      { wch: 15 }, // Precio Venta
      { wch: 20 }, // Presentación
      { wch: 20 }, // Precio Venta Presentación
      { wch: 15 }, // Stock Mínimo
      { wch: 15 }, // Stock Actual
      { wch: 10 }, // Estado
      { wch: 15 }  // Fecha Creación
    ];
    
    worksheet['!cols'] = columnWidths;
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Productos');
    
    // Generar buffer del archivo Excel
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    // Configurar headers para descarga
    const fechaActual = new Date().toISOString().split('T')[0];
    const nombreArchivo = `productos_${fechaActual}.xlsx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
    res.setHeader('Content-Length', excelBuffer.length);
    
    res.send(excelBuffer);
    
  } catch (error) {
     console.error('Error en exportación de Excel:', error);
     res.status(500).json({ 
       mensaje: 'Error al exportar productos a Excel', 
       error: error.message 
     });
   }
 };

// Obtener productos con información de inventario por sucursal
exports.obtenerProductosConInventario = async (req, res) => {
  try {
    const { categoriaId, nombre, sucursalId } = req.query;
    console.log('=== obtenerProductosConInventario ===');
    console.log('Query params:', { categoriaId, nombre, sucursalId });
    console.log('Usuario:', req.usuario);

    // Construir el objeto de condiciones para el filtro de productos
    const whereConditions = { estado: true };

    if (categoriaId) {
      whereConditions.categoriaId = categoriaId;
    }

    if (nombre) {
      whereConditions.nombre = {
        [Op.like]: `%${nombre}%`
      };
    }

    // Construir condiciones para el inventario
    const inventarioWhere = {};
    if (sucursalId) {
      inventarioWhere.sucursalId = sucursalId;
    }

    // Verificar permisos
    if (req.usuario && req.usuario.rol !== 'SuperAdmin') {
      // Si no es SuperAdmin, solo puede ver productos de su sucursal
      if (req.usuario.sucursalId) {
        inventarioWhere.sucursalId = req.usuario.sucursalId;
      }
    }

    const productos = await Producto.findAll({
      where: whereConditions,
      include: [
        { 
          association: 'Categorium', 
          attributes: ['id', 'nombre'] 
        },
        { 
          model: Sucursal, 
          attributes: ['id', 'nombre'] 
        },
        {
          model: Inventario,
          where: inventarioWhere,
          required: false, // LEFT JOIN para incluir productos sin inventario
          attributes: ['stock', 'stockMinimo', 'precioVenta'],
          include: [
            {
              model: Sucursal,
              attributes: ['id', 'nombre']
            }
          ]
        }
      ]
    });

    // Formatear la respuesta para incluir información de stock
    const productosConInventario = productos.map(producto => {
      const productoData = producto.toJSON();
      
      // Si tiene inventario, agregar la información de stock
      if (productoData.Inventarios && productoData.Inventarios.length > 0) {
        const inventario = productoData.Inventarios[0]; // Tomar el primer inventario (debería ser único por sucursal)
        productoData.stock = inventario.stock || 0;
        productoData.stockMinimo = inventario.stockMinimo || 0;
        productoData.precioVentaInventario = inventario.precioVenta || productoData.precioVenta;
      } else {
        // Si no tiene inventario, establecer stock en 0
        productoData.stock = 0;
        productoData.stockMinimo = 0;
        productoData.precioVentaInventario = productoData.precioVenta;
      }
      
      // Limpiar el array de inventarios para no duplicar información
      delete productoData.Inventarios;
      
      return productoData;
    });

    console.log('Productos con inventario a devolver:', productosConInventario.length);
    console.log('Primer producto con stock:', productosConInventario.find(p => p.stock > 0));
    
    res.json({ productos: productosConInventario });
  } catch (error) {
    console.error('Error al obtener productos con inventario:', error);
    res.status(500).json({ 
      mensaje: 'Error al obtener productos con inventario', 
      error: error.message 
    });
  }
};