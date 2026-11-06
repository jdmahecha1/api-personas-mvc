// Controlador AuthController (POO - Programación Orientada a Objetos)
// Gestiona el registro y login de usuarios delegando al Modelo Usuario.

const Usuario = require('../models/Usuario');

class AuthController {
  /**
   * POST /auth/registro — Registra un nuevo usuario con contraseña encriptada
   */
  async registro(req, res, next) {
    try {
      const { username, password } = req.body;
      const nuevoUsuario = await Usuario.create(username, password);
      // Responder sin el hash de contraseña por seguridad
      res.status(201).json({
        id: nuevoUsuario.id,
        username: nuevoUsuario.username,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/login — Inicia sesión y genera token JWT
   */
  async login(req, res, next) {
    try {
      const { username, password } = req.body;
      const resultado = await Usuario.login(username, password);
      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
