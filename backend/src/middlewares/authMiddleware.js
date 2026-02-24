//Middleware de autenticación por token

const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

const verificarToken = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ mensaje: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto123');
    const usuario = await Usuario.findByPk(decoded.id);

    if (!usuario) {
      return res.status(401).json({ mensaje: 'Usuario no encontrado' });
    }

    // Asignar tanto a req.user como req.usuario para compatibilidad
    req.user = {
      id: usuario.id,
      usuarioId: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      sucursalId: usuario.sucursalId
    };
    req.usuario = usuario;
    next();
  } catch (error) {
    res.status(401).json({ mensaje: 'Token inválido' });
  }
};

const esSuperAdmin = (req, res, next) => {
  if (req.usuario && req.usuario.rol === 'SuperAdmin') {
    return next();
  }
  res.status(403).json({ mensaje: 'No tiene permisos de SuperAdmin' });
};

module.exports = { verificarToken, esSuperAdmin };

