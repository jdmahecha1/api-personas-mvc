// Clase Database (POO - Patrón Singleton)
// Administra el pool de conexiones hacia MySQL usando mysql2/promise.
require('dotenv').config();
const mysql = require('mysql2/promise');

class Database {
  /** @type {import('mysql2/promise').Pool|null} */
  static #pool = null;

  /**
   * Obtiene la instancia única del pool de conexiones (Singleton).
   * @returns {import('mysql2/promise').Pool}
   */
  static getPool() {
    if (!this.#pool) {
      this.#pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT, 10) || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'personas_db',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        timezone: 'Z',
      });
    }
    return this.#pool;
  }

  /**
   * Ejecuta una consulta SQL con parámetros preparados (Prepared Statements).
   * @param {string} sql - Sentencia SQL
   * @param {Array} params - Parámetros a sustituir
   * @returns {Promise<[any, any]>}
   */
  static async query(sql, params = []) {
    const pool = this.getPool();
    return await pool.query(sql, params);
  }

  /**
   * Inicializa la base de datos y crea las tablas si no existen.
   */
  static async inicializar() {
    // 1. Conexión sin base de datos para asegurar que la DB exista
    const conexionInicial = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });

    const dbName = process.env.DB_NAME || 'personas_db';
    await conexionInicial.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await conexionInicial.end();

    // 2. Crear las tablas necesarias con el pool principal
    await this.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    await this.query(`
      CREATE TABLE IF NOT EXISTS personas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        apellido VARCHAR(100) NOT NULL,
        edad INT NOT NULL,
        email VARCHAR(150) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);
  }

  /**
   * Cierra el pool de conexiones (útil al detener el servidor o en tests).
   */
  static async close() {
    if (this.#pool) {
      await this.#pool.end();
      this.#pool = null;
    }
  }
}

module.exports = Database;
