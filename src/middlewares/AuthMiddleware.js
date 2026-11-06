// Middleware de Autenticación AuthMiddleware (POO)
// Intercepta peticiones protegidas y valida el token JWT mediante el Modelo Usuario.

const Usuario = require('../models/Usuario');

class AuthMiddleware {
  /**
   * Middleware para validar el encabezado Authorization: Bearer <token>
   */
  static verificarToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];
    try {
      const payload = Usuario.verificarToken(token);
      req.usuario = payload; // Adjuntar datos del usuario decodificado
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }
  }
}

module.exports = AuthMiddleware;
