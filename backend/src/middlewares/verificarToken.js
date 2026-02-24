const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token no proporcionado' });

  try {
    const secret = process.env.JWT_SECRET || 'secreto123';
    const decoded = jwt.verify(token, secret);
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};