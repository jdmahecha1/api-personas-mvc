// Rutas de Autenticación (MVC)
const { Router } = require('express');
const authController = require('../controllers/AuthController');

const router = Router();

router.post('/registro', (req, res, next) => authController.registro(req, res, next));
router.post('/login', (req, res, next) => authController.login(req, res, next));

module.exports = router;
