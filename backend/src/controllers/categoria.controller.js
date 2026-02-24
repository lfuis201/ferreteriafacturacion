const { Categoria } = require('../models');

// Obtener todas las categorías
exports.obtenerCategorias = async (req, res) => {
  try {
    const categorias = await Categoria.findAll({
      order: [['nombre', 'ASC']]
    });
    
    // Convertir el campo estado de boolean a string para el frontend
    const categoriasFormateadas = categorias.map(categoria => ({
      ...categoria.toJSON(),
      estado: categoria.estado ? 'activo' : 'inactivo'
    }));
    
    res.json(categoriasFormateadas);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener una categoría por ID
exports.obtenerCategoriaPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const categoria = await Categoria.findOne({
      where: { id, estado: true }
    });

    if (!categoria) {
      return res.status(404).json({ mensaje: 'Categoría no encontrada' });
    }

    // Convertir el campo estado de boolean a string para el frontend
    const categoriaFormateada = {
      ...categoria.toJSON(),
      estado: categoria.estado ? 'activo' : 'inactivo'
    };

    res.json(categoriaFormateada);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener la categoría', error: error.message });
  }
};

// Crear una nueva categoría
exports.crearCategoria = async (req, res) => {
  const { nombre, descripcion, estado = 'activo' } = req.body;
  try {
    // Verificar permisos (solo SuperAdmin y Admin pueden crear categorías)
    if (req.usuario && req.usuario.rol !== 'SuperAdmin' && req.usuario.rol !== 'Admin') {
      return res.status(403).json({ mensaje: 'No tiene permisos para crear categorías' });
    }
    // Verificar si ya existe una categoría con el mismo nombre
    const categoriaExistente = await Categoria.findOne({ where: { nombre } });
    if (categoriaExistente) {
      return res.status(400).json({ mensaje: 'Ya existe una categoría con ese nombre' });
    }
    
    // Convertir estado de string a boolean para la base de datos
    const estadoBoolean = estado === 'activo';
    
    // Crear la categoría
    const nuevaCategoria = await Categoria.create({
      nombre,
      descripcion,
      estado: estadoBoolean
    });
    
    // Convertir el estado de vuelta a string para la respuesta
    const categoriaRespuesta = {
      ...nuevaCategoria.toJSON(),
      estado: nuevaCategoria.estado ? 'activo' : 'inactivo'
    };
    
    res.status(201).json({
      mensaje: 'Categoría creada exitosamente',
      categoria: categoriaRespuesta
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear la categoría', error: error.message });
  }
};

// Actualizar una categoría
exports.actualizarCategoria = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, estado } = req.body;

  try {
    // Verificar permisos (solo SuperAdmin y Admin pueden actualizar categorías)
    if (req.usuario && req.usuario.rol !== 'SuperAdmin' && req.usuario.rol !== 'Admin') {
      return res.status(403).json({ mensaje: 'No tiene permisos para actualizar categorías' });
    }

    // Verificar si la categoría existe
    const categoria = await Categoria.findByPk(id);
    if (!categoria) {
      return res.status(404).json({ mensaje: 'Categoría no encontrada' });
    }

    // Verificar si ya existe otra categoría con el mismo nombre
    if (nombre && nombre !== categoria.nombre) {
      const categoriaExistente = await Categoria.findOne({ where: { nombre } });
      if (categoriaExistente) {
        return res.status(400).json({ mensaje: 'Ya existe otra categoría con ese nombre' });
      }
    }

    // Convertir estado de string a boolean si se proporciona
    let estadoBoolean;
    if (estado !== undefined) {
      estadoBoolean = estado === 'activo';
    }

    // Actualizar la categoría
    await categoria.update({
      nombre: nombre || categoria.nombre,
      descripcion: descripcion || categoria.descripcion,
      estado: estado !== undefined ? estadoBoolean : categoria.estado
    });

    // Convertir el estado de vuelta a string para la respuesta
    const categoriaRespuesta = {
      ...categoria.toJSON(),
      estado: categoria.estado ? 'activo' : 'inactivo'
    };

    res.json({
      mensaje: 'Categoría actualizada exitosamente',
      categoria: categoriaRespuesta
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar la categoría', error: error.message });
  }
};

// Eliminar una categoría 
exports.eliminarCategoria = async (req, res) => {
  const { id } = req.params;
  try {
    // Verificar permisos (solo SuperAdmin y Admin pueden eliminar categorías)
    if (req.usuario && req.usuario.rol !== 'SuperAdmin' && req.usuario.rol !== 'Admin') {
      return res.status(403).json({ mensaje: 'No tiene permisos para eliminar categorías' });
    }

    // Verificar si la categoría existe
    const categoria = await Categoria.findByPk(id);
    if (!categoria) {
      return res.status(404).json({ mensaje: 'Categoría no encontrada' });
    }

    // Eliminar la categoría por completo de la base de datos
    await categoria.destroy();

    res.json({ mensaje: 'Categoría eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar la categoría', error: error.message });
  }
};