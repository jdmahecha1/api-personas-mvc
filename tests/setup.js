// Configuración previa a las pruebas (Jest)
// Si no hay JWT_SECRET definido, se genera uno aleatorio solo para esta ejecución.
require('dotenv').config();
const crypto = require('crypto');

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = crypto.randomBytes(32).toString('hex');
}
