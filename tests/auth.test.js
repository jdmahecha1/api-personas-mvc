// Tests del Módulo de Autenticación con MySQL y POO
require('dotenv').config();
const request = require('supertest');
const app = require('../src/app');
const Database = require('../src/config/database');

beforeAll(async () => {
  await Database.inicializar();
});

beforeEach(async () => {
  // Limpiar la tabla de usuarios antes de cada test para aislamiento
  await Database.query('DELETE FROM usuarios');
});

afterAll(async () => {
  await Database.close();
});

describe('POST /auth/registro', () => {
  test('debe registrar un usuario exitosamente en MySQL (201)', async () => {
    const res = await request(app)
      .post('/auth/registro')
      .send({ username: 'nuevoUser', password: 'passwordSeguro1' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.username).toBe('nuevoUser');
    expect(res.body).not.toHaveProperty('passwordHash');
    expect(res.body).not.toHaveProperty('password');
  });

  test('debe fallar si el usuario ya existe en MySQL (409)', async () => {
    await request(app)
      .post('/auth/registro')
      .send({ username: 'repetido', password: 'password1' });

    const res = await request(app)
      .post('/auth/registro')
      .send({ username: 'repetido', password: 'password2' });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('El usuario ya existe');
  });

  test('debe fallar si la contraseña es muy corta (400)', async () => {
    const res = await request(app)
      .post('/auth/registro')
      .send({ username: 'test', password: '12' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('La contraseña debe tener al menos 4 caracteres');
  });
});

describe('POST /auth/login', () => {
  beforeEach(async () => {
    await request(app)
      .post('/auth/registro')
      .send({ username: 'usuarioLogin', password: 'miClaveSecreta' });
  });

  test('debe iniciar sesión con credenciales correctas y devolver JWT (200)', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'usuarioLogin', password: 'miClaveSecreta' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.usuario.username).toBe('usuarioLogin');
  });

  test('debe fallar si la contraseña es incorrecta (401)', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'usuarioLogin', password: 'claveIncorrecta' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Credenciales inválidas');
  });

  test('debe fallar si el usuario no existe en MySQL (401)', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'noExiste', password: 'password1' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Credenciales inválidas');
  });
});
