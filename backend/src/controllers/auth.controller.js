const { Usuario, Sucursal } = require('../models');
const jwt = require('jsonwebtoken');
require('dotenv').config();



// Registro de usuario (solo para SuperAdmin sin token)
// Registro de SuperAdmin (sin token)
exports.registerSuperAdmin = async (req, res) => {
  const { nombre, apellido, correo, password, rol, sucursalId } = req.body;
  try {
    // Verificar si el correo ya está registrado
    const usuarioExistente = await Usuario.findOne({ where: { correo } });
    if (usuarioExistente) {
      return res.status(400).json({ mensaje: 'El correo ya está registrado' });
    }

    // Verificar si la sucursal existe (si se proporciona)
    if (sucursalId) {
      const sucursal = await Sucursal.findByPk(sucursalId);
      if (!sucursal) {
        return res.status(404).json({ mensaje: 'La sucursal no existe' });
      }
    }

    // Crear el usuario
    const nuevoUsuario = await Usuario.create({
      nombre,
      apellido,
      correo,
      password,
      rol,
      sucursalId: sucursalId || null // Permitir que SuperAdmin tenga sucursal o no
    });

    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      usuario: {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        apellido: nuevoUsuario.apellido,
        correo: nuevoUsuario.correo,
        rol: nuevoUsuario.rol,
        sucursalId: nuevoUsuario.sucursalId
      }
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

// Registro de usuario
exports.register = async (req, res) => {
  const { nombre, apellido, correo, password, rol, sucursalId } = req.body;

   try {
    // Verificar permisos para crear usuarios
    if (req.usuario && req.usuario.rol !== 'SuperAdmin' && req.usuario.rol !== 'Admin') {
      return res.status(403).json({ mensaje: 'No tiene permisos para crear usuarios' });
    }

    // Verificar si el Admin está intentando crear un SuperAdmin
    if (req.usuario && req.usuario.rol === 'Admin' && rol === 'SuperAdmin') {
      return res.status(403).json({ mensaje: 'No tiene permisos para crear usuarios SuperAdmin' });
    }

    // Verificar si el Admin está intentando asignar a otra sucursal
    if (req.usuario && req.usuario.rol === 'Admin' && sucursalId !== req.usuario.sucursalId) {
      return res.status(403).json({ mensaje: 'Solo puede crear usuarios para su sucursal' });
    }

    // Verificar si el correo ya está registrado
    const usuarioExistente = await Usuario.findOne({ where: { correo } });
    if (usuarioExistente) {
      return res.status(400).json({ mensaje: 'El correo ya está registrado' });
    }

    // Verificar si la sucursal existe
    if (sucursalId) {
      const sucursal = await Sucursal.findByPk(sucursalId);
      if (!sucursal) {
        return res.status(404).json({ mensaje: 'La sucursal no existe' });
      }
    }

    // Crear el usuario
    const nuevoUsuario = await Usuario.create({
      nombre,
      apellido,
      correo,
      password,
      rol,
      sucursalId: rol === 'SuperAdmin' ? null : sucursalId
    });

    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      usuario: {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        apellido: nuevoUsuario.apellido,
        correo: nuevoUsuario.correo,
        rol: nuevoUsuario.rol,
        sucursalId: nuevoUsuario.sucursalId

      }
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};


// Obtener todos los usuarios
exports.obtenerUsuarios = async (req, res) => {
  try {
    // Filtrar por sucursal si el usuario no es SuperAdmin
    const where = {};
    if (req.usuario && req.usuario.rol !== 'SuperAdmin') {
      where.sucursalId = req.usuario.sucursalId;
    }

    const usuarios = await Usuario.findAll({
      where: { ...where, estado: true },
      attributes: { exclude: ['password'] },
      include: [{ model: Sucursal, attributes: ['id', 'nombre'] }]
    });

    res.json({ usuarios });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener usuarios', error: error.message });
  }
};





// Obtener un usuario por ID
exports.obtenerUsuarioPorId = async (req, res) => {
  const { id } = req.params;

  try {
    // Verificar permisos para ver usuarios de otras sucursales
    if (req.usuario && req.usuario.rol !== 'SuperAdmin' && req.usuario.id !== parseInt(id)) {
      const usuarioSolicitado = await Usuario.findByPk(id);
      if (usuarioSolicitado && usuarioSolicitado.sucursalId !== req.usuario.sucursalId) {
        return res.status(403).json({ mensaje: 'No tiene permisos para ver usuarios de otras sucursales' });
      }
    }

    const usuario = await Usuario.findOne({
      where: { id, estado: true },
      attributes: { exclude: ['password'] },
      include: [{ model: Sucursal, attributes: ['id', 'nombre'] }]
    });

    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    res.json({ usuario });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener el usuario', error: error.message });
  }
};






// Actualizar un usuario
exports.actualizarUsuario = async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, correo, password, rol, sucursalId } = req.body;

  try {
    // Verificar si el usuario existe
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    // Verificar permisos para actualizar usuarios
    if (req.usuario && req.usuario.rol !== 'SuperAdmin' && req.usuario.id !== parseInt(id)) {
      // Los Admin solo pueden actualizar usuarios de su sucursal
      if (req.usuario.rol === 'Admin' && usuario.sucursalId !== req.usuario.sucursalId) {
        return res.status(403).json({ mensaje: 'No tiene permisos para actualizar usuarios de otras sucursales' });
      }

      // Los Admin no pueden cambiar el rol a SuperAdmin
      if (rol === 'SuperAdmin') {
        return res.status(403).json({ mensaje: 'No tiene permisos para asignar rol de SuperAdmin' });
      }

      // Los Admin no pueden cambiar la sucursal a otra diferente
      if (sucursalId && sucursalId !== req.usuario.sucursalId) {
        return res.status(403).json({ mensaje: 'No puede asignar usuarios a otras sucursales' });
      }
    }

    // Verificar si el correo ya está registrado por otro usuario
    if (correo && correo !== usuario.correo) {
      const usuarioExistente = await Usuario.findOne({ where: { correo } });
      if (usuarioExistente) {
        return res.status(400).json({ mensaje: 'El correo ya está registrado por otro usuario' });
      }
    }

    // Verificar si la sucursal existe
    if (sucursalId) {
      const sucursal = await Sucursal.findByPk(sucursalId);
      if (!sucursal) {
        return res.status(404).json({ mensaje: 'La sucursal no existe' });
      }
    }

    // Actualizar el usuario
    const datosActualizados = {};
    if (nombre) datosActualizados.nombre = nombre;
    if (apellido) datosActualizados.apellido = apellido;
    if (correo) datosActualizados.correo = correo;
    if (password) datosActualizados.password = password;
    if (rol) datosActualizados.rol = rol;
    if (sucursalId) datosActualizados.sucursalId = rol === 'SuperAdmin' ? null : sucursalId;

    await usuario.update(datosActualizados);

    res.json({
      mensaje: 'Usuario actualizado exitosamente',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        correo: usuario.correo,
        rol: usuario.rol,
        sucursalId: usuario.sucursalId
      }
    });
  } catch (error) {
    res.status(500).json({ 
       mensaje: 'Error al actualizar el usuario', 
       error: error.message
     });
   }
};







// Eliminar un usuario (desactivar)
exports.eliminarUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    // Verificar si el usuario existe
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    // Verificar permisos para eliminar usuarios
    if (req.usuario && req.usuario.rol !== 'SuperAdmin') {
      // Los Admin solo pueden eliminar usuarios de su sucursal
      if (req.usuario.rol === 'Admin' && usuario.sucursalId !== req.usuario.sucursalId) {
        return res.status(403).json({ mensaje: 'No tiene permisos para eliminar usuarios de otras sucursales' });
      }
      // Nadie puede eliminar a un SuperAdmin excepto otro SuperAdmin
      if (usuario.rol === 'SuperAdmin') {
        return res.status(403).json({ mensaje: 'No tiene permisos para eliminar usuarios SuperAdmin' });
      }
    }

    // No permitir que un usuario se elimine a sí mismo
    if (req.usuario && req.usuario.id === parseInt(id)) {
      return res.status(400).json({ mensaje: 'No puede eliminar su propio usuario' });
    }

    // Eliminar el usuario por completo de la base de datos
    await usuario.destroy();

    res.json({ mensaje: 'Usuario eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar el usuario', error: error.message });
  }
};






// Obtener usuario actual autenticado (requiere token JWT)
exports.obtenerPerfil = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.usuario.id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    // Solo devuelve nombre y rol
    res.json({
      nombre: usuario.nombre,
      rol: usuario.rol
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
};





// Verificar si existe al menos un SuperAdmin
exports.verificarSuperAdmin = async (req, res) => {
  try {
    const superAdmin = await Usuario.findOne({
      where: { rol: 'SuperAdmin', estado: true }
    });

    res.json({
      existeSuperAdmin: !!superAdmin
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al verificar SuperAdmin', error: error.message });
  }
};

// Login de usuario
exports.login = async (req, res) => {
  const { correo, password } = req.body;

  try {
    // Buscar usuario por correo
    const usuario = await Usuario.findOne({ 
      where: { correo, estado: true },
      include: [{ model: Sucursal, attributes: ['id', 'nombre'] }]
    });

    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado o inactivo' });
    }

    // Validar contraseña
    const passwordValido = await usuario.validarPassword(password);
    if (!passwordValido) {
      return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        id: usuario.id, 
        rol: usuario.rol,
        sucursalId: usuario.sucursalId 
      },
      process.env.JWT_SECRET || 'secreto123',
      { expiresIn: '8h' }
    );

    // Responder con datos del usuario y token
    res.json({
      mensaje: 'Login exitoso',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        correo: usuario.correo,
        rol: usuario.rol,
        sucursal: usuario.Sucursal ? {
          id: usuario.Sucursal.id,
          nombre: usuario.Sucursal.nombre
        } : null
      }
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

