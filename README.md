# API de Personas

Proyecto de Diseño Web: una API REST hecha con Node.js y Express para registrar personas (nombre, apellido, edad y email) y guardarlas en MySQL. Tiene login con JWT y una página sencilla en `public/` para usarla desde el navegador.

El código está organizado con MVC y cada parte es una clase (modelos, controladores, middleware y la conexión a la base de datos).

## Estructura

```
src/
  app.js              configuración de Express y rutas
  server.js           arranca el servidor y prepara la base de datos
  config/database.js  conexión a MySQL
  models/             Persona y Usuario
  controllers/        lógica de cada endpoint
  middlewares/        verificación del token
  routes/             rutas de /auth y /personas
public/               frontend (HTML, CSS y JS)
database/schema.sql   script para crear la base de datos a mano
tests/                pruebas con Jest y Supertest
```

## Cómo correrlo

Necesitas Node.js y un MySQL funcionando (por ejemplo el de XAMPP).

1. Instala las dependencias:

   ```bash
   npm install
   ```

2. Copia `.env.example` a `.env` y llena tus datos de MySQL. También hay que poner un `JWT_SECRET`; se puede generar con:

   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

   Si pones `ADMIN_USERNAME` y `ADMIN_PASSWORD`, se crea ese usuario la primera vez que arranca el servidor. Si no, te puedes registrar desde la página.

3. Inicia el servidor:

   ```bash
   npm run dev
   ```

   Queda en http://localhost:3000. La base de datos y las tablas se crean solas si no existen, y si la tabla de personas está vacía se agregan tres de ejemplo.

Para las pruebas:

```bash
npm test
```

Ojo: las pruebas borran los datos de las tablas, así que mejor usar una base de datos aparte para eso.

## Endpoints

Autenticación:

| Método | Ruta | Qué hace |
|---|---|---|
| POST | `/auth/registro` | crea un usuario |
| POST | `/auth/login` | devuelve el token |

Personas (hay que mandar el header `Authorization: Bearer <token>`):

| Método | Ruta | Qué hace |
|---|---|---|
| GET | `/personas` | lista todas |
| GET | `/personas/buscar?nombre=...` | busca por nombre |
| GET | `/personas/:id` | trae una |
| POST | `/personas` | crea una |
| PUT | `/personas/:id` | edita una |
| DELETE | `/personas/:id` | elimina una |

Ejemplo con curl:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"tu_usuario","password":"tu_password"}'

curl http://localhost:3000/personas -H "Authorization: Bearer <token>"
```
