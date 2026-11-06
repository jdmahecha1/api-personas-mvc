// URLs base de la API
const API_PERSONAS = 'http://localhost:3000/personas';
const API_AUTH = 'http://localhost:3000/auth';

// Estado de autenticación
let tokenActual = localStorage.getItem('token') || '';
let usuarioActual = localStorage.getItem('usuario') || '';
let modoRegistro = false;

// Referencias al DOM - Auth
const seccionAuth = document.getElementById('seccion-auth');
const authTitulo = document.getElementById('auth-titulo');
const formAuth = document.getElementById('form-auth');
const inputAuthUsername = document.getElementById('auth-username');
const inputAuthPassword = document.getElementById('auth-password');
const btnAuthSubmit = document.getElementById('btn-auth-submit');
const btnToggleAuth = document.getElementById('btn-toggle-auth');
const authStatus = document.getElementById('auth-status');
const usuarioConectado = document.getElementById('usuario-conectado');
const btnLogout = document.getElementById('btn-logout');
const contenidoProtegido = document.getElementById('contenido-protegido');

// Referencias al DOM - Personas
const form = document.getElementById('form-persona');
const formTitulo = document.getElementById('form-titulo');
const inputId = document.getElementById('persona-id');
const inputNombre = document.getElementById('nombre');
const inputApellido = document.getElementById('apellido');
const inputEdad = document.getElementById('edad');
const inputEmail = document.getElementById('email');
const btnGuardar = document.getElementById('btn-guardar');
const btnCancelar = document.getElementById('btn-cancelar');
const btnBuscar = document.getElementById('btn-buscar');
const btnLimpiar = document.getElementById('btn-limpiar');
const inputBuscar = document.getElementById('buscar-nombre');
const tablaBody = document.getElementById('tabla-body');
const divMensaje = document.getElementById('mensaje');

// --- Funciones de Utilidad ---

function mostrarMensaje(texto, tipo = 'exito') {
  divMensaje.textContent = texto;
  divMensaje.className = 'mensaje ' + tipo;
  divMensaje.style.display = 'block';
  setTimeout(() => { divMensaje.style.display = 'none'; }, 3500);
}

// Función helper para peticiones autenticadas
async function fetchConAuth(url, options = {}) {
  const headers = options.headers || {};
  if (tokenActual) {
    headers['Authorization'] = `Bearer ${tokenActual}`;
  }
  options.headers = headers;

  const res = await fetch(url, options);
  if (res.status === 401) {
    cerrarSesion();
    mostrarMensaje('Sesión expirada o token inválido. Inicia sesión nuevamente.', 'error');
    throw new Error('No autorizado');
  }
  return res;
}

// Actualiza la vista según el estado de la sesión
function sincronizarVistaAuth() {
  if (tokenActual) {
    seccionAuth.style.display = 'none';
    contenidoProtegido.style.display = 'block';
    authStatus.style.display = 'flex';
    usuarioConectado.textContent = usuarioActual;
    cargarPersonas();
  } else {
    seccionAuth.style.display = 'block';
    contenidoProtegido.style.display = 'none';
    authStatus.style.display = 'none';
    usuarioConectado.textContent = '';
  }
}

// --- Autenticación (Login / Registro / Logout) ---

btnToggleAuth.addEventListener('click', () => {
  modoRegistro = !modoRegistro;
  if (modoRegistro) {
    authTitulo.textContent = '📝 Crear Nueva Cuenta';
    btnAuthSubmit.textContent = 'Registrarse';
    btnToggleAuth.textContent = '¿Ya tienes cuenta? Inicia sesión';
  } else {
    authTitulo.textContent = '🔐 Iniciar Sesión';
    btnAuthSubmit.textContent = 'Entrar';
    btnToggleAuth.textContent = '¿No tienes cuenta? Regístrate';
  }
});

formAuth.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = inputAuthUsername.value.trim();
  const password = inputAuthPassword.value.trim();

  try {
    if (modoRegistro) {
      const res = await fetch(`${API_AUTH}/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      mostrarMensaje('Cuenta creada con éxito. Iniciando sesión...', 'exito');
      // Auto-login
      modoRegistro = false;
    }

    const resLogin = await fetch(`${API_AUTH}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const dataLogin = await resLogin.json();
    if (!resLogin.ok) throw new Error(dataLogin.error);

    tokenActual = dataLogin.token;
    usuarioActual = dataLogin.usuario.username;
    localStorage.setItem('token', tokenActual);
    localStorage.setItem('usuario', usuarioActual);

    formAuth.reset();
    mostrarMensaje(`¡Bienvenido, ${usuarioActual}!`, 'exito');
    sincronizarVistaAuth();
  } catch (err) {
    mostrarMensaje(err.message, 'error');
  }
});

function cerrarSesion() {
  tokenActual = '';
  usuarioActual = '';
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  sincronizarVistaAuth();
}

btnLogout.addEventListener('click', () => {
  cerrarSesion();
  mostrarMensaje('Sesión cerrada correctamente.', 'exito');
});

// --- CRUD Personas ---

function renderTabla(personas) {
  if (personas.length === 0) {
    tablaBody.innerHTML = '<tr><td colspan="6" class="vacio">No hay personas registradas</td></tr>';
    return;
  }
  tablaBody.innerHTML = personas.map(p => `
    <tr>
      <td>${p.id}</td>
      <td>${p.nombre}</td>
      <td>${p.apellido}</td>
      <td>${p.edad}</td>
      <td>${p.email}</td>
      <td class="acciones-celda">
        <button class="btn btn-warning btn-sm" onclick="editar(${p.id})">✏️ Editar</button>
        <button class="btn btn-danger btn-sm" onclick="eliminar(${p.id})">🗑️ Eliminar</button>
      </td>
    </tr>
  `).join('');
}

function limpiarForm() {
  form.reset();
  inputId.value = '';
  formTitulo.textContent = 'Agregar Persona';
  btnGuardar.textContent = 'Guardar';
  btnCancelar.style.display = 'none';
}

async function cargarPersonas() {
  try {
    const res = await fetchConAuth(API_PERSONAS);
    const personas = await res.json();
    renderTabla(personas);
  } catch (err) {
    if (err.message !== 'No autorizado') {
      mostrarMensaje('Error al obtener lista de personas', 'error');
    }
  }
}

async function crearPersona(datos) {
  const res = await fetchConAuth(API_PERSONAS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error);
  return body;
}

async function actualizarPersona(id, datos) {
  const res = await fetchConAuth(`${API_PERSONAS}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error);
  return body;
}

async function obtenerPersona(id) {
  const res = await fetchConAuth(`${API_PERSONAS}/${id}`);
  const body = await res.json();
  if (!res.ok) throw new Error(body.error);
  return body;
}

async function eliminarPersona(id) {
  const res = await fetchConAuth(`${API_PERSONAS}/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error);
  }
}

async function buscarPorNombre(nombre) {
  const res = await fetchConAuth(`${API_PERSONAS}/buscar?nombre=${encodeURIComponent(nombre)}`);
  const body = await res.json();
  if (!res.ok) throw new Error(body.error);
  return body;
}

// Eventos de Persona
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const datos = {
    nombre: inputNombre.value.trim(),
    apellido: inputApellido.value.trim(),
    edad: parseInt(inputEdad.value, 10),
    email: inputEmail.value.trim(),
  };

  try {
    if (inputId.value) {
      await actualizarPersona(inputId.value, datos);
      mostrarMensaje('Persona actualizada correctamente');
    } else {
      await crearPersona(datos);
      mostrarMensaje('Persona creada correctamente');
    }
    limpiarForm();
    cargarPersonas();
  } catch (err) {
    mostrarMensaje(err.message, 'error');
  }
});

btnCancelar.addEventListener('click', limpiarForm);

async function editar(id) {
  try {
    const p = await obtenerPersona(id);
    inputId.value = p.id;
    inputNombre.value = p.nombre;
    inputApellido.value = p.apellido;
    inputEdad.value = p.edad;
    inputEmail.value = p.email;
    formTitulo.textContent = 'Editar Persona';
    btnGuardar.textContent = 'Actualizar';
    btnCancelar.style.display = 'inline-block';
    form.scrollIntoView({ behavior: 'smooth' });
  } catch (err) {
    mostrarMensaje(err.message, 'error');
  }
}

async function eliminar(id) {
  if (!confirm('¿Estás seguro de eliminar esta persona?')) return;
  try {
    await eliminarPersona(id);
    mostrarMensaje('Persona eliminada');
    limpiarForm();
    cargarPersonas();
  } catch (err) {
    mostrarMensaje(err.message, 'error');
  }
}

btnBuscar.addEventListener('click', async () => {
  const nombre = inputBuscar.value.trim();
  if (!nombre) {
    mostrarMensaje('Escribe un nombre para buscar', 'error');
    return;
  }
  try {
    const personas = await buscarPorNombre(nombre);
    renderTabla(personas);
    mostrarMensaje(`Se encontraron ${personas.length} resultado(s)`);
  } catch (err) {
    mostrarMensaje(err.message, 'error');
  }
});

inputBuscar.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') btnBuscar.click();
});

btnLimpiar.addEventListener('click', () => {
  inputBuscar.value = '';
  cargarPersonas();
});

// Inicialización
sincronizarVistaAuth();
