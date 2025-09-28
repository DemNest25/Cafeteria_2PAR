// ========= Auto-config de API para despliegue =========
// Prioridad: ?api=... -> localStorage(API_BASE) -> same-origin (si el backend sirve el front)
const qsApi = new URLSearchParams(location.search).get('api');
const sameOrigin = location.origin.startsWith('http') ? location.origin : null;
const API_BASE = (qsApi || localStorage.getItem('API_BASE') || sameOrigin || '').replace(/\/+$/, '');
if (!API_BASE) {
  alert('No se configuró la URL del backend.\nAbra el sitio con ?api=https://tu-backend.onrender.com');
  throw new Error('Falta API_BASE');
}
localStorage.setItem('API_BASE', API_BASE);

// ========= Helpers =========
async function api(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const opts = {
    method: options.method || 'GET',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    body: options.body || undefined,
  };
  const res = await fetch(url, opts);
  let data = null;
  try { data = await res.json(); } catch { /* puede no haber body */ }
  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}
const $ = (sel) => document.querySelector(sel);
const show = (el, on = true) => el.classList.toggle('d-none', !on);
function toast(msg) { alert(msg); }

// ========= Estado =========
let clienteActivo = JSON.parse(localStorage.getItem('clienteActivo') || 'null');

// ========= DOM =========
const formRegistro = $('#formRegistro');
const formLogin = $('#formLogin');
const formOrden = $('#formOrden');
const seccionOrden = $('#seccionOrden');
const seccionListado = $('#seccionListado');
const tbody = $('#tablaOrdenes');
const inputPlatillo = $('#platillo');
const seccionAuth = $('#seccionAuth');
const barraSesion = $('#barraSesion');
const btnLogout = $('#btnLogout');

// ========= UI =========
function actualizarUI() {
  const logueado = !!clienteActivo;

  if (seccionAuth) show(seccionAuth, !logueado);
  if (barraSesion) show(barraSesion, logueado);
  if (seccionOrden) show(seccionOrden, logueado);
  if (seccionListado) show(seccionListado, logueado);

  if (logueado) cargarOrdenes().catch(console.error);
  else if (tbody) tbody.innerHTML = '';
}

// ========= Registro =========
formRegistro?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const nombre = $('#regNombre').value.trim();
  const email = $('#regEmail').value.trim();
  const telefono = $('#regTelefono').value.trim();
  if (!nombre || !email || !telefono) return toast('Completa todos los campos.');
  try {
    await api('/clientes/registrar', {
      method: 'POST',
      body: JSON.stringify({ nombre, email, telefono })
    });
    toast('Registro exitoso. Ahora inicia sesión.');
    formRegistro.reset();
  } catch (err) { toast(`Error registrando: ${err.message}`); }
});

// ========= Login =========
formLogin?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = $('#loginEmail').value.trim();
  const telefono = $('#loginTelefono').value.trim();
  if (!email || !telefono) return toast('Completa email y teléfono.');
  try {
    const { cliente } = await api('/clientes/login', {
      method: 'POST',
      body: JSON.stringify({ email, telefono })
    });
    clienteActivo = cliente;
    localStorage.setItem('clienteActivo', JSON.stringify(clienteActivo));
    actualizarUI();
  } catch (err) { toast(`Error de login: ${err.message}`); }
});

// ========= Logout =========
btnLogout?.addEventListener('click', () => {
  localStorage.removeItem('clienteActivo');
  clienteActivo = null;
  actualizarUI();
});

// ========= Crear orden =========
formOrden?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!clienteActivo) return toast('Debes iniciar sesión.');
  const platillo_nombre = inputPlatillo.value.trim();
  if (!platillo_nombre) return;
  try {
    await api('/ordenes', {
      method: 'POST',
      body: JSON.stringify({ cliente_id: clienteActivo.id, platillo_nombre })
    });
    inputPlatillo.value = '';
    await cargarOrdenes();
  } catch (err) { toast(`No se pudo crear la orden: ${err.message}`); }
});

// ========= Listar / Renderizar órdenes =========
async function cargarOrdenes() {
  const { ordenes } = await api(`/ordenes/${clienteActivo.id}`);
  renderOrdenes(ordenes);
}

function renderOrdenes(ordenes) {
  tbody.innerHTML = '';
  if (!ordenes || !ordenes.length) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Sin órdenes</td></tr>`;
    return;
    }
  for (const o of ordenes) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${o.id}</td>
      <td>${o.platillo_nombre}</td>
      <td><span class="badge ${badgeClass(o.estado)}">${o.estado}</span></td>
      <td><button class="btn btn-sm btn-outline-primary" data-id="${o.id}">Avanzar estado</button></td>
    `;
    tbody.appendChild(tr);
  }
  tbody.querySelectorAll('button[data-id]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      btn.disabled = true;
      try {
        await api(`/ordenes/${id}/estado`, { method: 'PUT' });
        await cargarOrdenes();
      } catch (err) { toast(`No se pudo actualizar: ${err.message}`); }
      finally { btn.disabled = false; }
    });
  });
}

function badgeClass(estado) {
  const e = (estado || '').toLowerCase();
  if (e === 'pending') return 'bg-secondary text-uppercase';
  if (e === 'preparing') return 'bg-warning text-dark text-uppercase';
  if (e === 'delivered') return 'bg-success text-uppercase';
  return 'bg-dark text-uppercase';
}

// ========= Arranque =========
document.addEventListener('DOMContentLoaded', async () => {
  try { await api('/health'); }
  catch { toast('No se puede conectar al backend. Configura ?api=URL o revisa CORS.'); }
  actualizarUI();
});
