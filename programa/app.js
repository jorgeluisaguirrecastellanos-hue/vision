const API_URL = '/api/evaluaciones';
let registros = [];

function escaparHTML(valor) {
  return String(valor).replace(/[&<>"']/g, caracter => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[caracter]);
}

async function solicitar(url, opciones = {}) {
  const respuesta = await fetch(url, {
    ...opciones,
    headers: { 'Content-Type': 'application/json', ...(opciones.headers || {}) }
  });
  const datos = await respuesta.json();
  if (!respuesta.ok) throw new Error(datos.error || 'No se pudo completar la solicitud.');
  return datos;
}

function clasificarVision(agudeza, campoGrados) {
  let tipoVision, nivel;
  const agudezaNum = agudeza.includes('/') ? parseInt(agudeza.split('/')[1], 10) : null;
  if (agudeza === 'Sin percepción' || campoGrados <= 0) {
    tipoVision = 'Ceguera'; nivel = 'Total';
  } else if (agudezaNum >= 500 || campoGrados <= 10) {
    tipoVision = 'Ceguera'; nivel = campoGrados <= 5 ? 'Casi total' : 'Parcial';
  } else if (agudezaNum >= 200 || campoGrados <= 60) {
    tipoVision = 'Baja Visión';
    nivel = agudezaNum >= 400 ? 'Severa' : agudezaNum >= 200 ? 'Moderada' : 'Leve';
  } else if (agudezaNum >= 60) {
    tipoVision = 'Baja Visión'; nivel = 'Leve';
  } else {
    tipoVision = 'Normal';
    nivel = agudezaNum <= 25 ? 'Excelente' : agudezaNum <= 40 ? 'Buena' : 'Leve disminución';
  }
  return { tipoVision, nivel };
}

function crearTarjeta(reg) {
  const claseTipo = reg.tipoVision === 'Normal' ? 'normal' :
    reg.tipoVision === 'Baja Visión' ? 'moderada' : 'severa';
  return `
    <article data-id="${escaparHTML(reg.id)}">
      <h3>${escaparHTML(reg.nombre)}</h3>
      <p><strong>Agudeza:</strong> ${escaparHTML(reg.agudezaVisual)}</p>
      <p><strong>Campo visual:</strong> ${escaparHTML(reg.campoVisual)}°</p>
      <span class="etiqueta ${claseTipo}">${escaparHTML(reg.tipoVision)}</span>
      <span class="etiqueta">${escaparHTML(reg.nivel)}</span>
      <div class="acciones">
        <button class="btn-fav ${reg.favorito ? 'fav-activo' : ''}" data-accion="favorito">
          ${reg.favorito ? '⭐ Favorito' : '☆ Marcar favorito'}
        </button>
        <button class="btn-comp ${reg.completado ? 'comp-activo' : ''}" data-accion="completar">
          ${reg.completado ? '✓ Completada' : '○ Marcar completada'}
        </button>
      </div>
    </article>`;
}

function renderizar() {
  const texto = document.getElementById('buscador').value.toLowerCase();
  const filtroTipo = document.getElementById('filtroTipo').value;
  const filtrados = registros.filter(reg =>
    reg.nombre.toLowerCase().includes(texto) && (filtroTipo === 'todos' || reg.tipoVision === filtroTipo)
  );
  document.getElementById('listaTarjetas').innerHTML = filtrados.map(crearTarjeta).join('');
  document.getElementById('total').textContent = registros.length;
  document.getElementById('completadas').textContent = registros.filter(reg => reg.completado).length;
  document.getElementById('pendientes').textContent = registros.filter(reg => !reg.completado).length;
  document.getElementById('cantNormal').textContent = registros.filter(reg => reg.tipoVision === 'Normal').length;
  document.getElementById('cantBaja').textContent = registros.filter(reg => reg.tipoVision === 'Baja Visión').length;
  document.getElementById('cantCiego').textContent = registros.filter(reg => reg.tipoVision === 'Ceguera').length;
}

document.getElementById('listaTarjetas').addEventListener('click', async event => {
  const boton = event.target.closest('button[data-accion]');
  if (!boton) return;
  const tarjeta = boton.closest('article');
  const registro = registros.find(item => item.id === Number(tarjeta.dataset.id));
  if (!registro) return;
  const campo = boton.dataset.accion === 'favorito' ? 'favorito' : 'completado';
  try {
    await solicitar(`${API_URL}/${registro.id}`, {
      method: 'PATCH', body: JSON.stringify({ [campo]: !registro[campo] })
    });
    registro[campo] = !registro[campo];
    renderizar();
  } catch (error) { alert(error.message); }
});

document.getElementById('formEvaluacion').addEventListener('submit', async event => {
  event.preventDefault();
  let valido = true;
  document.querySelectorAll('.error').forEach(elemento => { elemento.textContent = ''; });
  const nombre = document.getElementById('nombre').value.trim();
  const agudeza = document.getElementById('agudeza').value.trim();
  const campo = Number(document.getElementById('campo').value);
  if (nombre.length < 3) {
    document.getElementById('errNombre').textContent = 'Mínimo 3 caracteres'; valido = false;
  }
  if (!/^\d+\/\d+$/.test(agudeza) && agudeza !== 'Sin percepción') {
    document.getElementById('errAgudeza').textContent = 'Formato: 20/20 o "Sin percepción"'; valido = false;
  }
  if (!Number.isInteger(campo) || campo < 0 || campo > 180) {
    document.getElementById('errCampo').textContent = 'Valor entre 0 y 180'; valido = false;
  }
  if (!valido) return;
  const { tipoVision, nivel } = clasificarVision(agudeza, campo);
  try {
    const nuevo = await solicitar(API_URL, {
      method: 'POST',
      body: JSON.stringify({ nombre, agudezaVisual: agudeza, campoVisual: campo, tipoVision, nivel })
    });
    registros.unshift(nuevo);
    renderizar();
    event.target.reset();
  } catch (error) { alert(error.message); }
});

document.getElementById('buscador').addEventListener('input', renderizar);
document.getElementById('filtroTipo').addEventListener('change', renderizar);

async function cargarEvaluaciones() {
  const lista = document.getElementById('listaTarjetas');
  lista.textContent = 'Cargando evaluaciones…';
  try {
    registros = await solicitar(API_URL);
    renderizar();
  } catch (error) {
    lista.textContent = `No se pudieron cargar las evaluaciones. Comprueba que el servidor esté iniciado y abre la página desde http://localhost:3000. Detalle: ${error.message}`;
  }
}

cargarEvaluaciones();
