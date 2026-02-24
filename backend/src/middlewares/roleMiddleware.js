// Middleware para verificar roles

// Verifica si el usuario es SuperAdmin
exports.esSuperAdmin = (req, res, next) => {
  if (req.usuario && req.usuario.rol === 'SuperAdmin') {
    return next();
  }
  return res.status(403).json({ mensaje: 'Acceso denegado: se requiere rol de SuperAdmin' });
};

// Verifica si el usuario es Admin
exports.esAdmin = (req, res, next) => {
  if (req.usuario && req.usuario.rol === 'Admin') {
    return next();
  }
  return res.status(403).json({ mensaje: 'Acceso denegado: se requiere rol de Admin' });
};

// Verifica si el usuario es SuperAdmin o Admin
exports.esAdminOSuperAdmin = (req, res, next) => {
  if (req.usuario && (req.usuario.rol === 'SuperAdmin' || req.usuario.rol === 'Admin')) {
    return next();
  }
  return res.status(403).json({ mensaje: 'Acceso denegado: se requiere rol de Admin o SuperAdmin' });
};

// Verifica si el usuario es Cajero
exports.esCajero = (req, res, next) => {
  if (req.usuario && req.usuario.rol === 'Cajero') {
    return next();
  }
  return res.status(403).json({ mensaje: 'Acceso denegado: se requiere rol de Cajero' });
};

// Verifica si el usuario es Almacenero
exports.esAlmacenero = (req, res, next) => {
  if (req.usuario && req.usuario.rol === 'Almacenero') {
    return next();
  }
  return res.status(403).json({ mensaje: 'Acceso denegado: se requiere rol de Almacenero' });
};

// Verifica si el usuario es Admin, SuperAdmin o Almacenero
exports.esAdminOSuperAdminOAlmacenero = (req, res, next) => {
  if (req.usuario && (req.usuario.rol === 'SuperAdmin' || req.usuario.rol === 'Admin' || req.usuario.rol === 'Almacenero')) {
    return next();
  }
  return res.status(403).json({ mensaje: 'Acceso denegado: se requiere rol de Admin, SuperAdmin o Almacenero' });
};

// Verifica si el usuario es Admin, SuperAdmin o Cajero
exports.esAdminOSuperAdminOCajero = (req, res, next) => {
  if (req.usuario && (req.usuario.rol === 'SuperAdmin' || req.usuario.rol === 'Admin' || req.usuario.rol === 'Cajero')) {
    return next();
  }
  return res.status(403).json({ mensaje: 'Acceso denegado: se requiere rol de Admin, SuperAdmin o Cajero' });
};

// Verifica si el usuario es Admin, SuperAdmin o Cajero
exports.esAdminOSuperAdminOCajero = (req, res, next) => {
  if (req.usuario && (req.usuario.rol === 'SuperAdmin' || req.usuario.rol === 'Admin' || req.usuario.rol === 'Cajero')) {
    return next();
  }
  return res.status(403).json({ mensaje: 'Acceso denegado: se requiere rol de Admin, SuperAdmin o Cajero' });
};


// Verifica si el usuario es Admin, SuperAdmin o Trabajador
exports.esAdminOSuperAdminOTrabajador = (req, res, next) => {
  if (req.usuario && (req.usuario.rol === 'SuperAdmin' || req.usuario.rol === 'Admin' || req.usuario.rol === 'Trabajador')) {
    return next();
  }
  return res.status(403).json({ mensaje: 'Acceso denegado: se requiere rol de Admin, SuperAdmin o Trabajador' });
};

// Middleware genérico para verificar múltiples roles
exports.tieneRol = (roles = []) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ mensaje: 'No autorizado: token no proporcionado o inválido' });
    }
    
    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({ mensaje: 'Acceso denegado: rol insuficiente' });
    }
    
    next();
  };
};