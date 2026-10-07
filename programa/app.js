// ==============================================
// 1️⃣ DATOS INICIALES — 8 registros
// ==============================================
const datosIniciales = [
  { id:1, nombre:"María López", agudezaVisual:"20/20", campoVisual:120, tipoVision:"Normal", nivel:"Sin alteración", favorito:false, completado:true },
  { id:2, nombre:"Juan Pérez", agudezaVisual:"20/80", campoVisual:95, tipoVision:"Baja Visión", nivel:"Leve", favorito:true, completado:true },
  { id:3, nombre:"Ana García", agudezaVisual:"20/200", campoVisual:60, tipoVision:"Baja Visión", nivel:"Moderada", favorito:false, completado:false },
  { id:4, nombre:"Carlos Ruiz", agudezaVisual:"20/400", campoVisual:25, tipoVision:"Baja Visión", nivel:"Severa", favorito:false, completado:true },
  { id:5, nombre:"Sofía Méndez", agudezaVisual:"20/600", campoVisual:8, tipoVision:"Ceguera", nivel:"Parcial", favorito:true, completado:false },
  { id:6, nombre:"Luis Torres", agudezaVisual:"20/1000", campoVisual:3, tipoVision:"Ceguera", nivel:"Casi total", favorito:false, completado:true },
  { id:7, nombre:"Elena Castro", agudezaVisual:"Sin percepción", campoVisual:0, tipoVision:"Ceguera", nivel:"Total", favorito:false, completado:false },
  { id:8, nombre:"Pedro Jiménez", agudezaVisual:"20/50", campoVisual:105, tipoVision:"Normal", nivel:"Leve disminución", favorito:false, completado:true }
];

// ==============================================
// 2️⃣ LOCALSTORAGE — Guardar cambios
// ==============================================
const CLAVE_STORAGE = 'registros_vision';
let registros = JSON.parse(localStorage.getItem(CLAVE_STORAGE)) || datosIniciales;

function guardarStorage(){
  localStorage.setItem(CLAVE_STORAGE, JSON.stringify(registros));
}

// ==============================================
// 3️⃣ CLASIFICACIÓN — Determina tipo y nivel
// ==============================================
function clasificarVision(agudeza, campoGrados){
  let tipoVision, nivel;
  const agudezaNum = agudeza.includes('/') ? parseInt(agudeza.split('/')[1]) : null;

  if(agudeza === "Sin percepción" || campoGrados <= 0){
    tipoVision = "Ceguera"; nivel = "Total";
  } else if(agudezaNum >= 500 || campoGrados <= 10){
    tipoVision = "Ceguera";
    nivel = campoGrados <= 5 ? "Casi total" : "Parcial";
  } else if(agudezaNum >= 200 || campoGrados <= 60){
    tipoVision = "Baja Visión";
    nivel = agudezaNum >= 400 ? "Severa" : agudezaNum >= 200 ? "Moderada" : "Leve";
  } else if(agudezaNum >= 60){
    tipoVision = "Baja Visión"; nivel = "Leve";
  } else {
    tipoVision = "Normal";
    nivel = agudezaNum <= 25 ? "Excelente" : agudezaNum <= 40 ? "Buena" : "Leve disminución";
  }
  return { tipoVision, nivel };
}

// ==============================================
// 4️⃣ COMPONENTE — Tarjeta reutilizable
// ==============================================
function crearTarjeta(reg){
  const claseTipo = reg.tipoVision === "Normal" ? "normal" :
                    reg.tipoVision === "Baja Visión" ? "moderada" : "severa";
  return `
    <article data-id="${reg.id}">
      <h3>${reg.nombre}</h3>
      <p><strong>Agudeza:</strong> ${reg.agudezaVisual}</p>
      <p><strong>Campo visual:</strong> ${reg.campoVisual}°</p>
      <span class="etiqueta ${claseTipo}">${reg.tipoVision}</span>
      <span class="etiqueta">${reg.nivel}</span>
      <div class="acciones">
        <button class="btn-fav ${reg.favorito?'fav-activo':''}" data-accion="favorito">
          ${reg.favorito?'⭐ Favorito':'☆ Marcar favorito'}
        </button>
        <button class="btn-comp ${reg.completado?'comp-activo':''}" data-accion="completar">
          ${reg.completado?'✓ Completada':'○ Marcar completada'}
        </button>
      </div>
    </article>
  `;
}

// ==============================================
// 5️⃣ RENDERIZAR — Filtros combinados
// ==============================================
function renderizar(){
  const texto = document.getElementById('buscador').value.toLowerCase();
  const filtroTipo = document.getElementById('filtroTipo').value;

  const filtrados = registros.filter(r => {
    const coincideTexto = r.nombre.toLowerCase().includes(texto);
    const coincideTipo = filtroTipo === 'todos' || r.tipoVision === filtroTipo;
    return coincideTexto && coincideTipo;
  });

  document.getElementById('listaTarjetas').innerHTML = filtrados.map(crearTarjeta).join('');
  actualizarResumen();
}

// ==============================================
// 6️⃣ RESUMEN — Cálculos automáticos
// ==============================================
function actualizarResumen(){
  document.getElementById('total').textContent = registros.length;
  document.getElementById('completadas').textContent = registros.filter(r=>r.completado).length;
  document.getElementById('pendientes').textContent = registros.filter(r=>!r.completado).length;
  document.getElementById('cantNormal').textContent = registros.filter(r=>r.tipoVision==='Normal').length;
  document.getElementById('cantBaja').textContent = registros.filter(r=>r.tipoVision==='Baja Visión').length;
  document.getElementById('cantCiego').textContent = registros.filter(r=>r.tipoVision==='Ceguera').length;
}

// ==============================================
// 7️⃣ ACCIONES — Favorito / Completar
// ==============================================
document.getElementById('listaTarjetas').addEventListener('click', e => {
  const btn = e.target.closest('button');
  if(!btn) return;
  const tarjeta = btn.closest('article');
  const id = parseInt(tarjeta.dataset.id);
  const reg = registros.find(r => r.id === id);
  if(!reg) return;

  if(btn.dataset.accion === 'favorito') reg.favorito = !reg.favorito;
  if(btn.dataset.accion === 'completar') reg.completado = !reg.completado;

  guardarStorage();
  renderizar();
});

// ==============================================
// 8️⃣ FORMULARIO — Validación y agregar
// ==============================================
document.getElementById('formEvaluacion').addEventListener('submit', e => {
  e.preventDefault();
  let valido = true;

  // Limpiar errores
  document.querySelectorAll('.error').forEach(el => el.textContent = '');

  const nombre = document.getElementById('nombre').value.trim();
  const agudeza = document.getElementById('agudeza').value.trim();
  const campo = parseInt(document.getElementById('campo').value);

  // Validaciones
  if(nombre.length < 3){
    document.getElementById('errNombre').textContent = 'Mínimo 3 caracteres'; valido = false;
  }
  if(!/^\d+\/\d+$/.test(agudeza) && agudeza !== "Sin percepción"){
    document.getElementById('errAgudeza').textContent = 'Formato: 20/20 o "Sin percepción"'; valido = false;
  }
  if(isNaN(campo) || campo < 0 || campo > 180){
    document.getElementById('errCampo').textContent = 'Valor entre 0 y 180'; valido = false;
  }

  if(!valido) return;

  // Crear nuevo registro
  const { tipoVision, nivel } = clasificarVision(agudeza, campo);
  const nuevo = {
    id: Date.now(),
    nombre,
    agudezaVisual: agudeza,
    campoVisual: campo,
    tipoVision,
    nivel,
    favorito: false,
    completado: false
  };

  registros.unshift(nuevo);
  guardarStorage();
  renderizar();
  e.target.reset();
});

// ==============================================
// 9️⃣ INICIAR — Al cargar la página
// ==============================================
document.getElementById('buscador').addEventListener('input', renderizar);
document.getElementById('filtroTipo').addEventListener('change', renderizar);

renderizar();
