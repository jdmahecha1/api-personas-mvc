// Configuración Principal de la Aplicación Express (MVC)
require('dotenv').config();
const express = require('express');
const path = require('path');
const personaRoutes = require('./routes/persona.routes');
const authRoutes = require('./routes/auth.routes');
const AuthMiddleware = require('./middlewares/AuthMiddleware');

const app = express();

// Middlewares globales
app.use(express.json());

// Servir la capa de Vista (Frontend HTML/CSS/JS)
app.use(express.static(path.join(__dirname, '..', 'public')));

// Rutas Públicas (Autenticación)
app.use('/auth', authRoutes);

// Rutas Protegidas (Gestión de Personas con JWT)
app.use('/personas', AuthMiddleware.verificarToken, personaRoutes);

// Middleware centralizado de manejo de errores
app.use((err, req, res, _next) => {
  const status = err.status || 400;
  res.status(status).json({
    error: err.message || 'Error interno del servidor',
  });
});

module.exports = app;
