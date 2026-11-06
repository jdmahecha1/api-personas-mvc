// Rutas de Personas (MVC)
const { Router } = require('express');
const personaController = require('../controllers/PersonaController');

const router = Router();

// /personas (GET todos, POST crear)
router.get('/', (req, res, next) => personaController.listarTodos(req, res, next));
router.post('/', (req, res, next) => personaController.crear(req, res, next));

// /personas/buscar (debe ir antes de /:id para evitar colisión de ruta)
router.get('/buscar', (req, res, next) => personaController.buscarPorNombre(req, res, next));

// /personas/:id (GET uno, PUT actualizar, DELETE eliminar)
router.get('/:id', (req, res, next) => personaController.buscarPorId(req, res, next));
router.put('/:id', (req, res, next) => personaController.actualizar(req, res, next));
router.delete('/:id', (req, res, next) => personaController.eliminar(req, res, next));

module.exports = router;
