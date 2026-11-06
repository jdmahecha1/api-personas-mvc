// Modelo Usuario (POO - Programación Orientada a Objetos)
// Representa la entidad Usuario y gestiona contraseñas encriptadas y JWT.

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Database = require('../config/database');

class Usuario {
  /**
   * Constructor de la entidad Usuario
   * @param {number|null} id
   * @param {string} username
   * @param {string} passwordHash
   * @param {Date|null} createdAt
   */
  constructor(id, username, passwordHash, createdAt = null) {
    this.id = id;
    this.username = username;
    this.passwordHash = passwordHash;
    this.createdAt = createdAt;
  }

  /**
   * Obtiene la clave secreta configurada para JWT.
   * @returns {string}
   */
  static getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET no está configurado. Defínelo en el archivo .env');
    }
    return secret;
  }

  /**
   * Busca un usuario por su nombre de usuario en MySQL.
   * @param {string} username
   * @returns {Promise<Usuario|null>}
   */
  static async findByUsername(username) {
    const [filas] = await Database.query(
      'SELECT id, username, password_hash AS passwordHash, created_at AS createdAt FROM usuarios WHERE username = ?',
      [username]
    );
    if (filas.length === 0) return null;
    const f = filas[0];
    return new Usuario(f.id, f.username, f.passwordHash, f.createdAt);
  }

  /**
   * Registra un nuevo usuario encriptando la contraseña con bcrypt.
   * @param {string} username
   * @param {string} password
   * @returns {Promise<Usuario>}
   */
  static async create(username, password) {
    if (!username || typeof username !== 'string' || username.trim() === '') {
      throw new Error('El username es obligatorio');
    }
    if (!password || password.length < 4) {
      throw new Error('La contraseña debe tener al menos 4 caracteres');
    }

    const usuarioExistente = await this.findByUsername(username.trim());
    if (usuarioExistente) {
      const error = new Error('El usuario ya existe');
      error.status = 409;
      throw error;
    }

    // Encriptar contraseña con bcrypt (10 rondas de salt)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const [resultado] = await Database.query(
      'INSERT INTO usuarios (username, password_hash) VALUES (?, ?)',
      [username.trim(), passwordHash]
    );

    return new Usuario(resultado.insertId, username.trim(), passwordHash);
  }

  /**
   * Compara una contraseña en texto plano con el hash de la base de datos.
   * @param {string} passwordPlana
   * @param {string} passwordHash
   * @returns {Promise<boolean>}
   */
  static async compararPassword(passwordPlana, passwordHash) {
    return await bcrypt.compare(passwordPlana, passwordHash);
  }

  /**
   * Autentica credenciales y devuelve un token JWT.
   * @param {string} username
   * @param {string} password
   * @returns {Promise<{ token: string, usuario: { id: number, username: string } }>}
   */
  static async login(username, password) {
    if (!username || !password) {
      throw new Error('Username y contraseña son obligatorios');
    }

    const usuario = await this.findByUsername(username.trim());
    if (!usuario) {
      const error = new Error('Credenciales inválidas');
      error.status = 401;
      throw error;
    }

    const esValida = await this.compararPassword(password, usuario.passwordHash);
    if (!esValida) {
      const error = new Error('Credenciales inválidas');
      error.status = 401;
      throw error;
    }

    const token = jwt.sign(
      { id: usuario.id, username: usuario.username },
      this.getJwtSecret(),
      { expiresIn: process.env.JWT_EXPIRATION || '2h' }
    );

    return {
      token,
      usuario: { id: usuario.id, username: usuario.username },
    };
  }

  /**
   * Verifica la validez de un token JWT.
   * @param {string} token
   * @returns {Object} Payload decodificado
   */
  static verificarToken(token) {
    return jwt.verify(token, this.getJwtSecret());
  }
}

module.exports = Usuario;
