// Tests de la API de Personas con MySQL, POO y JWT
require('dotenv').config();
const request = require('supertest');
const app = require('../src/app');
const Database = require('../src/config/database');
const Usuario = require('../src/models/Usuario');

let tokenAuth = '';

beforeAll(async () => {
  await Database.inicializar();
  // Crear usuario de pruebas en MySQL
  await Database.query('DELETE FROM usuarios');
  await Usuario.create('testuser', '12345');
  const login = await Usuario.login('testuser', '12345');
  tokenAuth = login.token;
});

beforeEach(async () => {
  // Limpiar la tabla de personas antes de cada prueba
  await Database.query('DELETE FROM personas');
});

afterAll(async () => {
  await Database.close();
});

const personaValida = {
  nombre: 'Ana',
  apellido: 'Martínez',
  edad: 28,
  email: 'ana@correo.com',
};

describe('Protección de rutas con JWT', () => {
  test('debe devolver 401 si no se envía token', async () => {
    const res = await request(app).get('/personas');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
});

describe('POST /personas', () => {
  test('debe crear una persona en MySQL y devolver 201', async () => {
    const res = await request(app)
      .post('/personas')
      .set('Authorization', `Bearer ${tokenAuth}`)
      .send(personaValida);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.nombre).toBe('Ana');
    expect(res.body.email).toBe('ana@correo.com');
  });

  test('debe devolver 400 si falta el nombre', async () => {
    const res = await request(app)
      .post('/personas')
      .set('Authorization', `Bearer ${tokenAuth}`)
      .send({ ...personaValida, nombre: '' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('debe devolver 400 si falta el apellido', async () => {
    const res = await request(app)
      .post('/personas')
      .set('Authorization', `Bearer ${tokenAuth}`)
      .send({ ...personaValida, apellido: '' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('debe devolver 400 si la edad es inválida (> 120)', async () => {
    const res = await request(app)
      .post('/personas')
      .set('Authorization', `Bearer ${tokenAuth}`)
      .send({ ...personaValida, edad: 150 });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('debe devolver 400 si la edad no es entera', async () => {
    const res = await request(app)
      .post('/personas')
      .set('Authorization', `Bearer ${tokenAuth}`)
      .send({ ...personaValida, edad: 25.5 });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('debe devolver 400 si el email es inválido', async () => {
    const res = await request(app)
      .post('/personas')
      .set('Authorization', `Bearer ${tokenAuth}`)
      .send({ ...personaValida, email: 'no-es-email' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

describe('GET /personas', () => {
  test('debe devolver un arreglo vacío inicialmente en MySQL', async () => {
    const res = await request(app)
      .get('/personas')
      .set('Authorization', `Bearer ${tokenAuth}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('debe devolver las personas creadas en MySQL', async () => {
    await request(app)
      .post('/personas')
      .set('Authorization', `Bearer ${tokenAuth}`)
      .send(personaValida);

    const res = await request(app)
      .get('/personas')
      .set('Authorization', `Bearer ${tokenAuth}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].nombre).toBe('Ana');
  });
});

describe('GET /personas/:id', () => {
  test('debe devolver la persona si existe en MySQL', async () => {
    const crear = await request(app)
      .post('/personas')
      .set('Authorization', `Bearer ${tokenAuth}`)
      .send(personaValida);

    const id = crear.body.id;
    const res = await request(app)
      .get(`/personas/${id}`)
      .set('Authorization', `Bearer ${tokenAuth}`);

    expect(res.status).toBe(200);
    expect(res.body.nombre).toBe('Ana');
  });

  test('debe devolver 404 si la persona no existe en MySQL', async () => {
    const res = await request(app)
      .get('/personas/999')
      .set('Authorization', `Bearer ${tokenAuth}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Persona no encontrada');
  });

  test('debe devolver 400 si el id no es un número entero', async () => {
    const res = await request(app)
      .get('/personas/abc')
      .set('Authorization', `Bearer ${tokenAuth}`);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('El id debe ser un número entero');
  });
});

describe('GET /personas/buscar?nombre=', () => {
  test('debe filtrar personas por nombre en MySQL (200)', async () => {
    await request(app)
      .post('/personas')
      .set('Authorization', `Bearer ${tokenAuth}`)
      .send(personaValida);

    await request(app)
      .post('/personas')
      .set('Authorization', `Bearer ${tokenAuth}`)
      .send({ nombre: 'Pedro', apellido: 'Ruiz', edad: 35, email: 'pedro@correo.com' });

    const res = await request(app)
      .get('/personas/buscar?nombre=Ana')
      .set('Authorization', `Bearer ${tokenAuth}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].nombre).toBe('Ana');
  });

  test('debe devolver arreglo vacío si no hay coincidencias', async () => {
    await request(app)
      .post('/personas')
      .set('Authorization', `Bearer ${tokenAuth}`)
      .send(personaValida);

    const res = await request(app)
      .get('/personas/buscar?nombre=Zzz')
      .set('Authorization', `Bearer ${tokenAuth}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('debe devolver 400 si no se envía el parámetro nombre', async () => {
    const res = await request(app)
      .get('/personas/buscar')
      .set('Authorization', `Bearer ${tokenAuth}`);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

describe('PUT /personas/:id', () => {
  test('debe actualizar una persona existente en MySQL', async () => {
    const crear = await request(app)
      .post('/personas')
      .set('Authorization', `Bearer ${tokenAuth}`)
      .send(personaValida);

    const id = crear.body.id;
    const res = await request(app)
      .put(`/personas/${id}`)
      .set('Authorization', `Bearer ${tokenAuth}`)
      .send({ nombre: 'Ana María' });

    expect(res.status).toBe(200);
    expect(res.body.nombre).toBe('Ana María');
    expect(res.body.apellido).toBe('Martínez');
  });

  test('debe devolver 404 si la persona a actualizar no existe', async () => {
    const res = await request(app)
      .put('/personas/999')
      .set('Authorization', `Bearer ${tokenAuth}`)
      .send({ nombre: 'Fantasma' });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Persona no encontrada');
  });

  test('debe devolver 400 si los datos son inválidos', async () => {
    const crear = await request(app)
      .post('/personas')
      .set('Authorization', `Bearer ${tokenAuth}`)
      .send(personaValida);

    const id = crear.body.id;
    const res = await request(app)
      .put(`/personas/${id}`)
      .set('Authorization', `Bearer ${tokenAuth}`)
      .send({ edad: -5 });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

describe('DELETE /personas/:id', () => {
  test('debe eliminar una persona en MySQL y devolver 204', async () => {
    const crear = await request(app)
      .post('/personas')
      .set('Authorization', `Bearer ${tokenAuth}`)
      .send(personaValida);

    const id = crear.body.id;
    const res = await request(app)
      .delete(`/personas/${id}`)
      .set('Authorization', `Bearer ${tokenAuth}`);

    expect(res.status).toBe(204);

    const buscar = await request(app)
      .get(`/personas/${id}`)
      .set('Authorization', `Bearer ${tokenAuth}`);

    expect(buscar.status).toBe(404);
  });

  test('debe devolver 404 si no existe', async () => {
    const res = await request(app)
      .delete('/personas/999')
      .set('Authorization', `Bearer ${tokenAuth}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});
