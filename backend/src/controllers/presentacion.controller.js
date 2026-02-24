const { Presentacion, Producto, sequelize} = require('../models');
const { Op } = require('sequelize');

// Obtener todas las presentaciones con Id de  producto
exports.obtenerPresentaciones = async (req, res) => {
  const { productoId } = req.query; // Obtener el productoId de los parámetros de consulta
  try {
    const whereClause = { estado: true };
    if (productoId) {
      whereClause.productoId = productoId; // Añadir el filtro productoId si está presente
    }
    const presentaciones = await Presentacion.findAll({
      where: whereClause,
      include: [
        { model: Producto, attributes: ['id', 'nombre', 'unidadMedida'] }
      ]
    });
    res.json({ presentaciones });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener presentaciones', error: error.message });
  }
};



// Obtener una presentación por ID
exports.obtenerPresentacionPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const presentacion = await Presentacion.findOne({
      where: { id, estado: true },
      include: [
        { model: Producto, attributes: ['id', 'nombre', 'unidadMedida'] }
      ]
    });

    if (!presentacion) {
      return res.status(404).json({ mensaje: 'Presentación no encontrada' });
    }

    res.json({ presentacion });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener la presentación', error: error.message });
  }
};

// Crear una nueva presentación
// Crear una nueva presentación
exports.crearPresentacion = async (req, res) => {
  const { 
    descripcion, 
    factor, 
    productoId, 
    precio1, 
    precio2, 
    precio3,
    codigoBarras,
    unidadMedida,
    esDefecto
  } = req.body;

  try {
    // Verificar permisos (solo SuperAdmin, Admin y Almacenero pueden crear presentaciones)
    if (req.usuario && 
        req.usuario.rol !== 'SuperAdmin' && 
        req.usuario.rol !== 'Admin' && 
        req.usuario.rol !== 'Almacenero') {
      return res.status(403).json({ mensaje: 'No tiene permisos para crear presentaciones' });
    }

    // Verificar si el producto existe
    const productoExiste = await Producto.findOne({ 
      where: { id: productoId, estado: true } 
    });
    
    if (!productoExiste) {
      return res.status(400).json({ mensaje: 'El producto seleccionado no existe o está inactivo' });
    }

    // Verificar si el código de barras ya existe (si se proporciona)
    if (codigoBarras && codigoBarras.trim() !== '') {
      const codigoExiste = await Presentacion.findOne({
        where: { codigoBarras: codigoBarras.trim() }
      });
      
      if (codigoExiste) {
        return res.status(400).json({ 
          mensaje: 'El código de barras ya existe en otra presentación' 
        });
      }
    }

    // Si se marca como defecto, desmarcar otras presentaciones del mismo producto
    if (esDefecto) {
      await Presentacion.update(
        { esDefecto: false },
        { where: { productoId: productoId } }
      );
    }

    // Crear la presentación
    const nuevaPresentacion = await Presentacion.create({
      descripcion: descripcion || null,
      factor: factor || 1.0,
      productoId,
      precio1: precio1 || null,
      precio2: precio2 || null,
      precio3: precio3 || null,
      codigoBarras: codigoBarras && codigoBarras.trim() !== '' ? codigoBarras.trim() : null,
      unidadMedida: unidadMedida || 'unidad',
      esDefecto: esDefecto || false
    });

    res.status(201).json({
      mensaje: 'Presentación creada exitosamente',
      presentacion: nuevaPresentacion
    });
  } catch (error) {
    console.error('Error al crear presentación:', error);
    res.status(500).json({ mensaje: 'Error al crear la presentación', error: error.message });
  }
};

// Actualizar una presentación existente
exports.actualizarPresentacion = async (req, res) => {
  const { id } = req.params;
  const { 
    descripcion, 
    factor, 
    precio1, 
    precio2, 
    precio3,
    codigoBarras,
    unidadMedida,
    esDefecto
  } = req.body;

  try {
    // Verificar permisos
    if (req.usuario && 
        req.usuario.rol !== 'SuperAdmin' && 
        req.usuario.rol !== 'Admin' && 
        req.usuario.rol !== 'Almacenero') {
      return res.status(403).json({ mensaje: 'No tiene permisos para actualizar presentaciones' });
    }

    // Buscar la presentación
    const presentacion = await Presentacion.findOne({
      where: { id, estado: true }
    });

    if (!presentacion) {
      return res.status(404).json({ mensaje: 'Presentación no encontrada' });
    }

    // Verificar si el código de barras ya existe en otra presentación (si se proporciona y es diferente)
    if (codigoBarras && codigoBarras.trim() !== '' && codigoBarras.trim() !== presentacion.codigoBarras) {
      const codigoExiste = await Presentacion.findOne({
        where: { 
          codigoBarras: codigoBarras.trim(),
          id: { [Op.ne]: id } // Excluir la presentación actual
        }
      });
      
      if (codigoExiste) {
        return res.status(400).json({ 
          mensaje: 'El código de barras ya existe en otra presentación' 
        });
      }
    }

    // Si se marca como defecto, desmarcar otras presentaciones del mismo producto
    if (esDefecto) {
      await Presentacion.update(
        { esDefecto: false },
        { where: { productoId: presentacion.productoId, id: { [Op.ne]: id } } }
      );
    }

    // Actualizar la presentación
    await presentacion.update({
      descripcion: descripcion !== undefined ? descripcion : presentacion.descripcion,
      factor: factor !== undefined ? factor : presentacion.factor,
      precio1: precio1 !== undefined ? precio1 : presentacion.precio1,
      precio2: precio2 !== undefined ? precio2 : presentacion.precio2,
      precio3: precio3 !== undefined ? precio3 : presentacion.precio3,
      codigoBarras: codigoBarras !== undefined ? 
        (codigoBarras && codigoBarras.trim() !== '' ? codigoBarras.trim() : null) : 
        presentacion.codigoBarras,
      unidadMedida: unidadMedida !== undefined ? unidadMedida : presentacion.unidadMedida,
      esDefecto: esDefecto !== undefined ? esDefecto : presentacion.esDefecto
    });

    res.json({
      mensaje: 'Presentación actualizada exitosamente',
      presentacion
    });
  } catch (error) {
    console.error('Error al actualizar presentación:', error);
    res.status(500).json({ mensaje: 'Error al actualizar la presentación', error: error.message });
  }
};
// Actualizar una presentación
exports.actualizarPresentacion = async (req, res) => {
  const { id } = req.params;
  const { 
    descripcion, 
    factor, 
    productoId, 
    precio1, 
    precio2, 
    precio3,
    codigoBarras,
    unidadMedida,
    esDefecto
  } = req.body;

  try {
    // Verificar permisos (solo SuperAdmin, Admin y Almacenero pueden actualizar presentaciones)
    if (req.usuario && 
        req.usuario.rol !== 'SuperAdmin' && 
        req.usuario.rol !== 'Admin' && 
        req.usuario.rol !== 'Almacenero') {
      return res.status(403).json({ mensaje: 'No tiene permisos para actualizar presentaciones' });
    }

    // Verificar si la presentación existe
    const presentacion = await Presentacion.findByPk(id);
    if (!presentacion) {
      return res.status(404).json({ mensaje: 'Presentación no encontrada' });
    }

    // Si se está cambiando el producto, verificar que exista
    if (productoId && productoId !== presentacion.productoId) {
      const productoExiste = await Producto.findOne({ 
        where: { id: productoId, estado: true } 
      });
      
      if (!productoExiste) {
        return res.status(400).json({ mensaje: 'El producto seleccionado no existe o está inactivo' });
      }
    }

    // Verificar si el código de barras ya existe en otra presentación (si se proporciona y es diferente)
    if (codigoBarras && codigoBarras.trim() !== '' && codigoBarras.trim() !== presentacion.codigoBarras) {
      const codigoExiste = await Presentacion.findOne({
        where: { 
          codigoBarras: codigoBarras.trim(),
          id: { [Op.ne]: id } // Excluir la presentación actual
        }
      });
      
      if (codigoExiste) {
        return res.status(400).json({ 
          mensaje: 'El código de barras ya existe en otra presentación' 
        });
      }
    }

    // Si se marca como defecto, desmarcar otras presentaciones del mismo producto
    if (esDefecto) {
      await Presentacion.update(
        { esDefecto: false },
        { 
          where: { 
            productoId: presentacion.productoId, 
            id: { [Op.ne]: id } 
          } 
        }
      );
    }

    // Actualizar la presentación
    await presentacion.update({
      descripcion: descripcion !== undefined ? descripcion : presentacion.descripcion,
      factor: factor !== undefined ? factor : presentacion.factor,
      productoId: productoId !== undefined ? productoId : presentacion.productoId,
      precio1: precio1 !== undefined ? precio1 : presentacion.precio1,
      precio2: precio2 !== undefined ? precio2 : presentacion.precio2,
      precio3: precio3 !== undefined ? precio3 : presentacion.precio3,
      codigoBarras: codigoBarras !== undefined ? 
        (codigoBarras && codigoBarras.trim() !== '' ? codigoBarras.trim() : null) : 
        presentacion.codigoBarras,
      unidadMedida: unidadMedida !== undefined ? unidadMedida : presentacion.unidadMedida,
      esDefecto: esDefecto !== undefined ? esDefecto : presentacion.esDefecto
    });

    // Recargar la presentación para obtener los datos actualizados
    await presentacion.reload();

    res.json({
      mensaje: 'Presentación actualizada exitosamente',
      presentacion
    });
  } catch (error) {
    console.error('Error al actualizar presentación:', error);
    res.status(500).json({ mensaje: 'Error al actualizar la presentación', error: error.message });
  }
};


// Eliminar una presentación
exports.eliminarPresentacion = async (req, res) => {
  const { id } = req.params;

  try {
    // Verificar permisos (solo SuperAdmin, Admin y Almacenero pueden eliminar presentaciones)
    if (req.usuario && 
        req.usuario.rol !== 'SuperAdmin' && 
        req.usuario.rol !== 'Admin' && 
        req.usuario.rol !== 'Almacenero') {
      return res.status(403).json({ mensaje: 'No tiene permisos para eliminar presentaciones' });
    }

    // Verificar si la presentación existe
    const presentacion = await Presentacion.findByPk(id);
    if (!presentacion) {
      return res.status(404).json({ mensaje: 'Presentación no encontrada' });
    }

    // Eliminar la presentación
    await presentacion.destroy();

    res.json({ mensaje: 'Presentación eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar la presentación', error: error.message });
  }
};

// Importar presentaciones desde Excel
// Importar presentaciones desde Excel
exports.importarExcel = async (req, res) => {
  const XLSX = require('xlsx');
  
  try {
    // Verificar permisos
    if (req.usuario &&
        req.usuario.rol !== 'SuperAdmin' &&
        req.usuario.rol !== 'Admin' &&
        req.usuario.rol !== 'Almacenero') {
      return res.status(403).json({ mensaje: 'No tiene permisos para importar presentaciones' });
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
      'codigo': ['Código Interno', 'CODIGO INTERNO', 'codigo', 'codigo interno', 'Codigo Interno', 'Código', 'CODIGO'],
      'descripcion1': ['Descripción - 1', 'DESCRIPCION - 1', 'descripcion - 1', 'Descripcion - 1'],
      'factor1': ['Factor - 1', 'FACTOR - 1', 'factor - 1', 'Factor-1', 'factor-1'],
      'unidadMedida1': ['Unidad de medida - 1', 'UNIDAD DE MEDIDA - 1', 'unidad de medida - 1', 'Unidad de Medida - 1'],
      'precio1': ['Precio - 1', 'PRECIO - 1', 'precio - 1', 'Precio-1', 'precio-1'],
      'descripcion2': ['Descripción - 2', 'DESCRIPCION - 2', 'descripcion - 2', 'Descripcion - 2'],
      'unidadMedida2': ['Unidad de medida - 2', 'UNIDAD DE MEDIDA - 2', 'unidad de medida - 2', 'Unidad de Medida - 2'],
      'factor2': ['Factor - 2', 'FACTOR - 2', 'factor - 2', 'Factor-2', 'factor-2'],
      'precio2': ['Precio - 2', 'PRECIO - 2', 'precio - 2', 'Precio-2', 'precio-2'],
      'descripcion3': ['Descripción - 3', 'DESCRIPCION - 3', 'descripcion - 3', 'Descripcion - 3'],
      'unidadMedida3': ['Unidad de medida - 3', 'UNIDAD DE MEDIDA - 3', 'unidad de medida - 3', 'Unidad de Medida - 3'],
      'factor3': ['Factor - 3', 'FACTOR - 3', 'factor - 3', 'Factor-3', 'factor-3'],
      'precio3': ['Precio - 3', 'PRECIO - 3', 'precio - 3', 'Precio-3', 'precio-3'],
      'codigoBarras1': ['Código Barras - 1', 'CODIGO BARRAS - 1', 'codigoBarras - 1', 'codigo barras - 1', 'Codigo Barras - 1'],
      'codigoBarras2': ['Código Barras - 2', 'CODIGO BARRAS - 2', 'codigoBarras - 2', 'codigo barras - 2', 'Codigo Barras - 2'],
      'codigoBarras3': ['Código Barras - 3', 'CODIGO BARRAS - 3', 'codigoBarras - 3', 'codigo barras - 3', 'Codigo Barras - 3']
    };
    
    // Crear mapeo de índices de columnas (solo para las que existen en el Excel)
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
    
    console.log('Columnas encontradas en el Excel:', Object.keys(indicesColumnas));
    
    // Solo validar columnas REALMENTE requeridas (mínimas para crear una presentación)
    const columnasObligatorias = ['codigo']; // Solo el código del producto es obligatorio
    const columnasFaltantes = columnasObligatorias.filter(col => indicesColumnas[col] === undefined);
    
    if (columnasFaltantes.length > 0) {
      const nombresEsperados = columnasFaltantes.map(campo => {
        const posiblesNombres = mapeoColumnas[campo] || [];
        return posiblesNombres[0] || campo;
      });
      return res.status(400).json({ 
        mensaje: `Falta la columna obligatoria: ${nombresEsperados.join(', ')}. Las demás columnas son opcionales.` 
      });
    }

    // Procesar datos fila por fila
    const filasDatos = jsonData.slice(1); // Omitir encabezados
    const resultados = [];
    const errores = [];
    let filasProcessadas = 0;
    let presentacionesTotalesCreadas = 0;

    // Iniciar transacción
    const transaction = await sequelize.transaction();

    try {
      for (let i = 0; i < filasDatos.length; i++) {
        const fila = filasDatos[i];
        const numeroFila = i + 2; // +2 porque empezamos desde la fila 1 (índice 0) y omitimos encabezados

        try {
          // Mapear datos de la fila usando los índices de columnas (solo las que existen)
          const datosFilas = {};
          Object.keys(indicesColumnas).forEach(campo => {
            const indice = indicesColumnas[campo];
            const valor = fila[indice];
            datosFilas[campo] = valor !== undefined && valor !== null ? valor.toString().trim() : '';
          });

          // Validar solo campos REALMENTE obligatorios
          if (!datosFilas.codigo) {
            errores.push(`Fila ${numeroFila}: Código interno es requerido`);
            continue;
          }

          // Buscar el producto
          const producto = await Producto.findOne({
            where: { codigo: datosFilas.codigo },
            transaction
          });

          if (!producto) {
            errores.push(`Fila ${numeroFila}: No se encontró el producto con código interno: ${datosFilas.codigo}`);
            continue;
          }

          // Procesar hasta 3 presentaciones por producto
          const presentacionesCreadas = [];
          const erroresPresentacion = [];
          
          for (let numPresentacion = 1; numPresentacion <= 3; numPresentacion++) {
            const descripcionKey = `descripcion${numPresentacion}`;
            const factorKey = `factor${numPresentacion}`;
            const unidadMedidaKey = `unidadMedida${numPresentacion}`;
            const precioKey = `precio${numPresentacion}`;
            const codigoBarrasKey = `codigoBarras${numPresentacion}`;
            
            // Solo procesar si hay al menos descripción o factor para esta presentación
            if (!datosFilas[descripcionKey] && !datosFilas[factorKey]) {
              continue;
            }
            
            try {
              // Validar factor de conversión (opcional, por defecto 1)
              let factorConversion = 1.0;
              if (datosFilas[factorKey] && datosFilas[factorKey] !== '') {
                factorConversion = parseFloat(datosFilas[factorKey]);
                if (isNaN(factorConversion) || factorConversion <= 0) {
                  erroresPresentacion.push(`Presentación ${numPresentacion}: Factor debe ser un número mayor a 0`);
                  continue;
                }
              }
              
              // Validar precio (opcional)
              let precio = 0;
              if (datosFilas[precioKey] && datosFilas[precioKey] !== '') {
                precio = parseFloat(datosFilas[precioKey]);
                if (isNaN(precio) || precio < 0) {
                  erroresPresentacion.push(`Presentación ${numPresentacion}: Precio debe ser un número mayor o igual a 0`);
                  continue;
                }
              }
              
              // Verificar código de barras duplicado (si se proporciona)
              let codigoBarras = null;
              if (datosFilas[codigoBarrasKey] && datosFilas[codigoBarrasKey] !== '') {
                codigoBarras = datosFilas[codigoBarrasKey];
                
                const codigoExiste = await Presentacion.findOne({
                  where: { codigoBarras: codigoBarras },
                  transaction
                });
                
                if (codigoExiste) {
                  erroresPresentacion.push(`Presentación ${numPresentacion}: Ya existe una presentación con el código de barras: ${codigoBarras}`);
                  continue;
                }
              }
              
              // Crear la presentación
              const nuevaPresentacion = await Presentacion.create({
                productoId: producto.id,
                descripcion: datosFilas[descripcionKey] || `Presentación ${numPresentacion} de ${producto.nombre}`,
                unidadMedida: datosFilas[unidadMedidaKey] || 'unidad',
                factor: factorConversion,
                precio1: precio,
                precio2: precio,
                precio3: precio,
                codigoBarras: codigoBarras,
                estado: true
              }, { transaction });
              
              presentacionesCreadas.push({
                id: nuevaPresentacion.id,
                descripcion: nuevaPresentacion.descripcion,
                factor: factorConversion,
                unidadMedida: nuevaPresentacion.unidadMedida,
                precio: precio,
                codigoBarras: codigoBarras
              });
              
              presentacionesTotalesCreadas++;
              
            } catch (errorPresentacion) {
              console.error(`Error creando presentación ${numPresentacion} en fila ${numeroFila}:`, errorPresentacion);
              
              if (errorPresentacion.name === 'SequelizeUniqueConstraintError') {
                erroresPresentacion.push(`Presentación ${numPresentacion}: Ya existe una presentación con estos datos únicos`);
              } else if (errorPresentacion.name === 'SequelizeValidationError') {
                const mensajesValidacion = errorPresentacion.errors.map(err => err.message).join(', ');
                erroresPresentacion.push(`Presentación ${numPresentacion}: Error de validación - ${mensajesValidacion}`);
              } else {
                erroresPresentacion.push(`Presentación ${numPresentacion}: Error - ${errorPresentacion.message}`);
              }
            }
          }
          
          // Agregar resultados y errores de esta fila
          if (presentacionesCreadas.length > 0) {
            resultados.push({
              fila: numeroFila,
              producto_codigo: datosFilas.codigo,
              producto_nombre: producto.nombre,
              presentaciones: presentacionesCreadas,
              total_presentaciones: presentacionesCreadas.length
            });
            filasProcessadas++;
          }
          
          // Agregar errores de presentaciones individuales
          if (erroresPresentacion.length > 0) {
            errores.push(`Fila ${numeroFila}: ${erroresPresentacion.join('; ')}`);
          }
          
          // Si no se creó ninguna presentación y no hay errores específicos, agregar error general
          if (presentacionesCreadas.length === 0 && erroresPresentacion.length === 0) {
            errores.push(`Fila ${numeroFila}: No se encontraron datos válidos para crear presentaciones`);
          }

        } catch (error) {
          console.error(`Error procesando fila ${numeroFila}:`, error);
          if (error.name === 'SequelizeValidationError') {
            const mensajesValidacion = error.errors.map(err => err.message).join(', ');
            errores.push(`Fila ${numeroFila}: Error de validación - ${mensajesValidacion}`);
          } else if (error.name === 'SequelizeUniqueConstraintError') {
            errores.push(`Fila ${numeroFila}: Ya existe una presentación con estos datos`);
          } else {
            errores.push(`Fila ${numeroFila}: Error al procesar - ${error.message}`);
          }
        }
      }

      // Confirmar transacción
      await transaction.commit();

      // Respuesta con resultados
      const respuesta = {
        mensaje: filasProcessadas > 0 ? 
          `Importación completada: ${presentacionesTotalesCreadas} presentaciones creadas desde ${filasProcessadas} filas` : 
          'No se procesaron presentaciones',
        filasProcessadas: filasProcessadas,
        presentacionesCreadas: presentacionesTotalesCreadas,
        totalFilas: filasDatos.length,
        errores: errores.length,
        columnasEncontradas: Object.keys(indicesColumnas),
        columnasObligatorias: columnasObligatorias,
        detalles_errores: errores
      };

      if (filasProcessadas > 0) {
        respuesta.resultados = resultados;
      }

      const statusCode = errores.length > 0 ? 207 : 200; // 207 Multi-Status si hay errores parciales
      res.status(statusCode).json(respuesta);

    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('Error en importarExcel:', error);
    res.status(500).json({ 
      mensaje: 'Error interno del servidor', 
      error: error.message 
    });
  }
};

// Exportar presentaciones a Excel
exports.exportarExcel = async (req, res) => {
  try {
    const { productoId, fechaDesde, fechaHasta } = req.query;
    
    console.log('Parámetros recibidos en backend:', req.query);
    console.log('productoId:', productoId);
    
    // Construir filtros - Solo aplicar filtro de estado si hay otros filtros específicos
    const filtros = {
      where: {},
      include: [
        {
          model: Producto,
          attributes: ['id', 'nombre', 'codigo', 'descripcion', 'precioCompra', 'precioVenta']
        }
      ]
    };
    
    // Si no hay filtros específicos, exportar todas las presentaciones (incluyendo inactivas)
    // Si hay filtros específicos, solo exportar las activas
    if (productoId || fechaDesde || fechaHasta) {
      filtros.where.estado = true;
    }
    
    if (productoId) {
      filtros.where.productoId = productoId;
      console.log('Filtro productoId aplicado:', productoId);
    }
    
    if (fechaDesde || fechaHasta) {
      filtros.where.createdAt = {};
      if (fechaDesde) {
        filtros.where.createdAt[Op.gte] = new Date(fechaDesde);
      }
      if (fechaHasta) {
        filtros.where.createdAt[Op.lte] = new Date(fechaHasta + ' 23:59:59');
      }
    }
    
    console.log('Filtros finales aplicados:', JSON.stringify(filtros, null, 2));
    
    // Obtener presentaciones
    const presentaciones = await Presentacion.findAll(filtros);
    
    console.log('Número de presentaciones encontradas:', presentaciones.length);
    
    // Verificar si se encontraron presentaciones
    if (presentaciones.length === 0) {
      return res.status(404).json({ mensaje: 'No se encontraron presentaciones con los filtros especificados' });
    }
    
    // Preparar datos para Excel
    const datosExcel = presentaciones.map(presentacion => ({
      'ID Presentación': presentacion.id,
      'Código Producto': presentacion.Producto ? presentacion.Producto.codigo : '',
      'Nombre Producto': presentacion.Producto ? presentacion.Producto.nombre : '',
      'Descripción Producto': presentacion.Producto ? presentacion.Producto.descripcion : '',
      'Precio Compra Producto': presentacion.Producto ? presentacion.Producto.precioCompra : '',
      'Precio Venta Producto': presentacion.Producto ? presentacion.Producto.precioVenta : '',
      'Descripción Presentación': presentacion.descripcion,
      'Factor de Conversión': presentacion.factor,
      'Unidad de Medida': presentacion.unidadMedida,
      'Precio 1': presentacion.precio1,
      'Precio 2': presentacion.precio2,
      'Precio 3': presentacion.precio3,
      'Código de Barras': presentacion.codigoBarras || '',
      'Es Predeterminada': presentacion.esDefecto ? 'Sí' : 'No',
      'Estado': presentacion.estado ? 'Activo' : 'Inactivo',
      'Fecha Creación': presentacion.createdAt && presentacion.createdAt instanceof Date ? presentacion.createdAt.toISOString().split('T')[0] : ''
    }));
    
    // Crear libro de Excel
    const XLSX = require('xlsx');
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(datosExcel);
    
    // Configurar ancho de columnas
    const columnWidths = [
      { wch: 15 }, // ID Presentación
      { wch: 15 }, // Código Producto
      { wch: 30 }, // Nombre Producto
      { wch: 40 }, // Descripción Producto
      { wch: 15 }, // Precio Compra Producto
      { wch: 15 }, // Precio Venta Producto
      { wch: 25 }, // Descripción Presentación
      { wch: 15 }, // Factor de Conversión
      { wch: 15 }, // Unidad de Medida
      { wch: 12 }, // Precio 1
      { wch: 12 }, // Precio 2
      { wch: 12 }, // Precio 3
      { wch: 20 }, // Código de Barras
      { wch: 15 }, // Es Predeterminada
      { wch: 10 }, // Estado
      { wch: 15 }  // Fecha Creación
    ];
    
    worksheet['!cols'] = columnWidths;
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Presentaciones');
    
    // Generar buffer del archivo Excel
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    // Configurar headers para descarga
    const fechaActual = new Date().toISOString().split('T')[0];
    const nombreArchivo = `presentaciones_${fechaActual}.xlsx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
    res.setHeader('Content-Length', excelBuffer.length);
    
    res.send(excelBuffer);
    
  } catch (error) {
     console.error('Error en exportación de Excel:', error);
     res.status(500).json({ 
       mensaje: 'Error al exportar presentaciones a Excel', 
       error: error.message 
     });
   }
};
