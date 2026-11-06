// Punto de Entrada del Servidor (Server)
require('dotenv').config();
const app = require('./app');
const Database = require('./config/database');
const Usuario = require('./models/Usuario');
const Persona = require('./models/Persona');

const PORT = process.env.PORT || 3000;

class Server {
  /**
   * Inicializa la conexión a MySQL, inserta datos iniciales si no existen y levanta Express.
   */
  static async start() {
    try {
      console.log('🔄 Conectando con el motor MySQL...');
      await Database.inicializar();
      console.log('✅ Base de datos MySQL y tablas sincronizadas correctamente.');

      // Crear usuario administrador inicial (solo si se configuró en .env)
      const adminUser = process.env.ADMIN_USERNAME;
      const adminPass = process.env.ADMIN_PASSWORD;
      if (adminUser && adminPass) {
        const adminExistente = await Usuario.findByUsername(adminUser);
        if (!adminExistente) {
          await Usuario.create(adminUser, adminPass);
          console.log(`👤 Usuario administrador inicial "${adminUser}" creado.`);
        }
      }

      // Cargar 3 personas de ejemplo si la tabla está vacía
      const totalPersonas = await Persona.count();
      if (totalPersonas === 0) {
        await Persona.create({ nombre: 'Juan', apellido: 'Pérez', edad: 30, email: 'juan@ejemplo.com' });
        await Persona.create({ nombre: 'María', apellido: 'García', edad: 25, email: 'maria@ejemplo.com' });
        await Persona.create({ nombre: 'Carlos', apellido: 'López', edad: 40, email: 'carlos@ejemplo.com' });
        console.log('👥 3 personas de ejemplo insertadas en MySQL.');
      }

      const server = app.listen(PORT, () => {
        console.log(`🚀 Servidor MVC con MySQL corriendo en http://localhost:${PORT}`);
      });

      return server;
    } catch (error) {
      console.error('❌ Error al iniciar el servidor o conectar con MySQL:', error);
      process.exit(1);
    }
  }
}

// Iniciar servidor
Server.start();

module.exports = Server;
