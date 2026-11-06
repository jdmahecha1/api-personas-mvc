// Modelo Persona (POO - Programación Orientada a Objetos)
// Representa la entidad Persona y encapsula las operaciones en MySQL.

const Database = require('../config/database');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

class Persona {
  /**
   * Constructor de la entidad Persona
   * @param {number|null} id
   * @param {string} nombre
   * @param {string} apellido
   * @param {number} edad
   * @param {string} email
   * @param {Date|null} createdAt
   */
  constructor(id, nombre, apellido, edad, email, createdAt = null) {
    this.id = id;
    this.nombre = nombre;
    this.apellido = apellido;
    this.edad = edad;
    this.email = email;
    this.createdAt = createdAt;
  }

  /**
   * Valida los atributos de la persona antes de persistir.
   * Lanza un Error con mensaje claro si alguna validación falla.
   * @param {Object} datos
   * @param {boolean} esParcial - true para actualizaciones (PUT)
   */
  static validar(datos, esParcial = false) {
    const { nombre, apellido, edad, email } = datos;

    if (!esParcial || nombre !== undefined) {
      if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
        throw new Error('El nombre es obligatorio y no puede estar vacío');
      }
    }

    if (!esParcial || apellido !== undefined) {
      if (!apellido || typeof apellido !== 'string' || apellido.trim() === '') {
        throw new Error('El apellido es obligatorio y no puede estar vacío');
      }
    }

    if (!esParcial || edad !== undefined) {
      if (edad === undefined || edad === null) {
        throw new Error('La edad es obligatoria');
      }
      const edadNum = Number(edad);
      if (!Number.isInteger(edadNum) || edadNum < 0 || edadNum > 120) {
        throw new Error('La edad debe ser un número entero entre 0 y 120');
      }
    }

    if (!esParcial || email !== undefined) {
      if (!email || typeof email !== 'string' || email.trim() === '') {
        throw new Error('El email es obligatorio y no puede estar vacío');
      }
      if (!EMAIL_REGEX.test(email)) {
        throw new Error('El email no tiene un formato válido');
      }
    }
  }

  /**
   * Obtiene todas las personas de la base de datos MySQL.
   * @returns {Promise<Persona[]>}
   */
  static async findAll() {
    const [filas] = await Database.query(
      'SELECT id, nombre, apellido, edad, email, created_at AS createdAt FROM personas ORDER BY id ASC'
    );
    return filas.map(
      (f) => new Persona(f.id, f.nombre, f.apellido, f.edad, f.email, f.createdAt)
    );
  }

  /**
   * Busca una persona por su ID en MySQL.
   * @param {number} id
   * @returns {Promise<Persona|null>}
   */
  static async findById(id) {
    const [filas] = await Database.query(
      'SELECT id, nombre, apellido, edad, email, created_at AS createdAt FROM personas WHERE id = ?',
      [id]
    );
    if (filas.length === 0) return null;
    const f = filas[0];
    return new Persona(f.id, f.nombre, f.apellido, f.edad, f.email, f.createdAt);
  }

  /**
   * Filtra personas cuyo nombre contenga el término de búsqueda.
   * @param {string} nombre
   * @returns {Promise<Persona[]>}
   */
  static async findByName(nombre) {
    const patron = `%${nombre.toLowerCase()}%`;
    const [filas] = await Database.query(
      'SELECT id, nombre, apellido, edad, email, created_at AS createdAt FROM personas WHERE LOWER(nombre) LIKE ? ORDER BY id ASC',
      [patron]
    );
    return filas.map(
      (f) => new Persona(f.id, f.nombre, f.apellido, f.edad, f.email, f.createdAt)
    );
  }

  /**
   * Inserta una nueva persona en MySQL tras validar sus datos.
   * @param {Object} datos
   * @returns {Promise<Persona>}
   */
  static async create(datos) {
    this.validar(datos, false);

    const [resultado] = await Database.query(
      'INSERT INTO personas (nombre, apellido, edad, email) VALUES (?, ?, ?, ?)',
      [datos.nombre.trim(), datos.apellido.trim(), Number(datos.edad), datos.email.trim()]
    );

    return new Persona(
      resultado.insertId,
      datos.nombre.trim(),
      datos.apellido.trim(),
      Number(datos.edad),
      datos.email.trim()
    );
  }

  /**
   * Actualiza los datos de una persona en MySQL.
   * @param {number} id
   * @param {Object} datos
   * @returns {Promise<Persona|null>}
   */
  static async update(id, datos) {
    this.validar(datos, true);

    const personaExistente = await this.findById(id);
    if (!personaExistente) return null;

    const nuevoNombre = datos.nombre !== undefined ? datos.nombre.trim() : personaExistente.nombre;
    const nuevoApellido = datos.apellido !== undefined ? datos.apellido.trim() : personaExistente.apellido;
    const nuevaEdad = datos.edad !== undefined ? Number(datos.edad) : personaExistente.edad;
    const nuevoEmail = datos.email !== undefined ? datos.email.trim() : personaExistente.email;

    await Database.query(
      'UPDATE personas SET nombre = ?, apellido = ?, edad = ?, email = ? WHERE id = ?',
      [nuevoNombre, nuevoApellido, nuevaEdad, nuevoEmail, id]
    );

    return new Persona(id, nuevoNombre, nuevoApellido, nuevaEdad, nuevoEmail);
  }

  /**
   * Elimina una persona por su ID de MySQL.
   * @param {number} id
   * @returns {Promise<boolean>} true si se eliminó, false si no existía
   */
  static async delete(id) {
    const [resultado] = await Database.query('DELETE FROM personas WHERE id = ?', [id]);
    return resultado.affectedRows > 0;
  }

  /**
   * Retorna la cantidad total de personas.
   * @returns {Promise<number>}
   */
  static async count() {
    const [filas] = await Database.query('SELECT COUNT(*) AS total FROM personas');
    return filas[0].total;
  }
}

module.exports = Persona;
