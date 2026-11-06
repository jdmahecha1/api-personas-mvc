-- =======================================================
-- Script de Creación de la Base de Datos y Tablas
-- Proyecto: API REST Gestión de Personas con MVC y POO
-- =======================================================

CREATE DATABASE IF NOT EXISTS personas_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE personas_db;

-- Tabla de Usuarios (Autenticación y contraseñas con bcrypt)
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Personas
CREATE TABLE IF NOT EXISTS personas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  edad INT NOT NULL,
  email VARCHAR(150) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Datos iniciales de prueba (opcional)
-- El usuario administrador NO se crea aquí: se crea al iniciar el servidor
-- a partir de ADMIN_USERNAME y ADMIN_PASSWORD definidos en el archivo .env.

INSERT IGNORE INTO personas (id, nombre, apellido, edad, email) VALUES
(1, 'Juan', 'Pérez', 30, 'juan@ejemplo.com'),
(2, 'María', 'García', 25, 'maria@ejemplo.com'),
(3, 'Carlos', 'López', 40, 'carlos@ejemplo.com');
