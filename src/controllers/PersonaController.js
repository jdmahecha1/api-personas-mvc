// Controlador PersonaController (POO - Programación Orientada a Objetos)
// Recibe las peticiones HTTP y delega al Modelo Persona.

const Persona = require('../models/Persona');

class PersonaController {
  /**
   * GET /personas — Lista todas las personas
   */
  async listarTodos(req, res, next) {
    try {
      const personas = await Persona.findAll();
      res.status(200).json(personas);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /personas/:id — Obtiene una persona por ID
   */
  async buscarPorId(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id) || String(id) !== req.params.id) {
        return res.status(400).json({ error: 'El id debe ser un número entero' });
      }

      const persona = await Persona.findById(id);
      if (!persona) {
        return res.status(404).json({ error: 'Persona no encontrada' });
      }

      res.status(200).json(persona);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /personas/buscar?nombre=... — Filtra personas por nombre
   */
  async buscarPorNombre(req, res, next) {
    try {
      const { nombre } = req.query;
      if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
        return res.status(400).json({ error: 'El parámetro "nombre" es obligatorio' });
      }

      const personas = await Persona.findByName(nombre.trim());
      res.status(200).json(personas);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /personas — Crea una nueva persona
   */
  async crear(req, res, next) {
    try {
      const nuevaPersona = await Persona.create(req.body);
      res.status(201).json(nuevaPersona);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /personas/:id — Actualiza una persona existente
   */
  async actualizar(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id) || String(id) !== req.params.id) {
        return res.status(400).json({ error: 'El id debe ser un número entero' });
      }

      const personaActualizada = await Persona.update(id, req.body);
      if (!personaActualizada) {
        return res.status(404).json({ error: 'Persona no encontrada' });
      }

      res.status(200).json(personaActualizada);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /personas/:id — Elimina una persona por ID
   */
  async eliminar(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id) || String(id) !== req.params.id) {
        return res.status(400).json({ error: 'El id debe ser un número entero' });
      }

      const eliminado = await Persona.delete(id);
      if (!eliminado) {
        return res.status(404).json({ error: 'Persona no encontrada' });
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

// Exportamos una instancia del controlador para enlazar los métodos
module.exports = new PersonaController();
