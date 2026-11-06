# API REST — Gestión de Personas (Arquitectura MVC, POO y MySQL)

API REST construida con **Node.js** y **Express** aplicando el patrón arquitectónico **MVC (Modelo - Vista - Controlador)**, principios de **POO (Programación Orientada a Objetos)**, autenticación segura con **JWT** + contraseñas encriptadas con **bcryptjs**, y persistencia real en base de datos relacional **MySQL**.

---

## 🏗️ Arquitectura MVC y POO

```
src/
  app.js                        # Configuración de Express, middlewares y rutas
  server.js                     # Clase Server (POO): sincronización con MySQL y escucha
  config/
    database.js                 # Clase Database (POO - Singleton): Connection Pool y consultas preparadas
  models/
    Persona.js                  # Clase Persona (POO): validaciones y operaciones CRUD en MySQL
    Usuario.js                  # Clase Usuario (POO): autenticación, hash con bcrypt y tokens JWT
  controllers/
    PersonaController.js        # Clase PersonaController (POO): manejo de solicitudes HTTP
    AuthController.js           # Clase AuthController (POO): registro y login
  middlewares/
    AuthMiddleware.js           # Clase AuthMiddleware (POO): protección de rutas con JWT
  routes/
    persona.routes.js           # Definición de rutas REST para personas
    auth.routes.js              # Definición de rutas de autenticación
public/                         # Capa de Vista (Frontend HTML5 / CSS3 / JavaScript Vanilla)
  index.html
  styles.css
  app.js
database/
  schema.sql                    # Script DDL de la base de datos y tablas
tests/
  auth.test.js                  # Tests automatizados de autenticación contra MySQL
  persona.test.js               # Tests automatizados de CRUD contra MySQL
.env                            # Variables de entorno locales (NO se sube al repositorio)
.env.example                    # Plantilla de variables de entorno
```

---

## ⚙️ Requisitos y Configuración de MySQL

1. Tener un servidor MySQL activo (por ejemplo con **XAMPP**, MariaDB o servicio nativo en el puerto 3306).
2. Copiar la plantilla y completar tus propios valores:
   ```bash
   cp .env.example .env
   ```
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=tu_usuario_mysql
   DB_PASSWORD=tu_password_mysql
   DB_NAME=personas_db
   JWT_SECRET=<cadena_aleatoria_larga>
   JWT_EXPIRATION=2h
   ADMIN_USERNAME=<usuario_admin_opcional>
   ADMIN_PASSWORD=<password_admin_opcional>
   ```
   Para generar un `JWT_SECRET` seguro:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

> 🔒 El archivo `.env` está en `.gitignore` y **nunca** debe subirse al repositorio.

> 💡 **Auto-sincronización:** Al arrancar el servidor con `npm start` o `npm run dev`, la clase `Database` crea automáticamente la base de datos `personas_db` y las tablas `usuarios` y `personas` si aún no existen. Si defines `ADMIN_USERNAME` y `ADMIN_PASSWORD` en `.env`, crea ese usuario administrador inicial; además carga 3 registros iniciales de prueba si la tabla está vacía.

---

## 🚀 Instalación y Ejecución

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar en modo desarrollo (con recarga automática)
npm run dev

# 3. Iniciar en producción
npm start

# 4. Ejecutar suite de pruebas (26 tests con Jest y Supertest)
npm test
```

El servidor arranca en `http://localhost:3000`.

---

## 🌐 Interfaz Web

Ingresa desde tu navegador a `http://localhost:3000`:
- **Login / Registro**: Inicia sesión con el administrador que configuraste en `.env` o registra una cuenta nueva.
- **Panel CRUD**: Crear, listar, buscar por nombre con coincidencia parcial, editar y eliminar personas.
- **Persistencia**: Todos los cambios se guardan permanentemente en la base de datos MySQL.

---

## 📡 Endpoints de la API

### 🔐 Autenticación (Públicos)
| Método | Ruta | Descripción | Códigos |
|---|---|---|---|
| `POST` | `/auth/registro` | Registrar un usuario (contraseña encriptada con bcrypt) | 201, 400, 409 |
| `POST` | `/auth/login` | Autenticar credenciales y obtener token JWT | 200, 400, 401 |

### 👥 Personas (Requieren `Authorization: Bearer <token>`)
| Método | Ruta | Descripción | Códigos |
|---|---|---|---|
| `GET` | `/personas` | Listar todas las personas desde MySQL | 200, 401 |
| `GET` | `/personas/buscar?nombre=...` | Filtrar personas por coincidencia parcial | 200, 400, 401 |
| `GET` | `/personas/:id` | Obtener persona por su ID | 200, 400, 401, 404 |
| `POST` | `/personas` | Insertar una nueva persona con validaciones | 201, 400, 401 |
| `PUT` | `/personas/:id` | Actualizar los datos de una persona | 200, 400, 401, 404 |
| `DELETE` | `/personas/:id` | Eliminar permanentemente una persona | 204, 400, 401, 404 |

---

## 💻 Ejemplos con cURL

### 1. Iniciar sesión y obtener token JWT
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"<TU_USUARIO>","password":"<TU_PASSWORD>"}'
```

### 2. Listar todas las personas
```bash
curl http://localhost:3000/personas \
  -H "Authorization: Bearer <TU_TOKEN_JWT>"
```

### 3. Buscar persona por nombre
```bash
curl "http://localhost:3000/personas/buscar?nombre=Juan" \
  -H "Authorization: Bearer <TU_TOKEN_JWT>"
```

### 4. Crear una persona
```bash
curl -X POST http://localhost:3000/personas \
  -H "Authorization: Bearer <TU_TOKEN_JWT>" \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Laura","apellido":"Sánchez","edad":22,"email":"laura@ejemplo.com"}'
```
