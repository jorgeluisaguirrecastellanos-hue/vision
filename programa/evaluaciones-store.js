const fs = require('fs/promises');
const path = require('path');

const rutaDatos = path.join(__dirname, 'data', 'evaluaciones.json');
const datosIniciales = [
  { id: 1, nombre: 'María López', agudezaVisual: '20/20', campoVisual: 120, tipoVision: 'Normal', nivel: 'Sin alteración', favorito: false, completado: true },
  { id: 2, nombre: 'Juan Pérez', agudezaVisual: '20/80', campoVisual: 95, tipoVision: 'Baja Visión', nivel: 'Leve', favorito: true, completado: true },
  { id: 3, nombre: 'Ana García', agudezaVisual: '20/200', campoVisual: 60, tipoVision: 'Baja Visión', nivel: 'Moderada', favorito: false, completado: false },
  { id: 4, nombre: 'Carlos Ruiz', agudezaVisual: '20/400', campoVisual: 25, tipoVision: 'Baja Visión', nivel: 'Severa', favorito: false, completado: true },
  { id: 5, nombre: 'Sofía Méndez', agudezaVisual: '20/600', campoVisual: 8, tipoVision: 'Ceguera', nivel: 'Parcial', favorito: true, completado: false },
  { id: 6, nombre: 'Luis Torres', agudezaVisual: '20/1000', campoVisual: 3, tipoVision: 'Ceguera', nivel: 'Casi total', favorito: false, completado: true },
  { id: 7, nombre: 'Elena Castro', agudezaVisual: 'Sin percepción', campoVisual: 0, tipoVision: 'Ceguera', nivel: 'Total', favorito: false, completado: false },
  { id: 8, nombre: 'Pedro Jiménez', agudezaVisual: '20/50', campoVisual: 105, tipoVision: 'Normal', nivel: 'Leve disminución', favorito: false, completado: true }
];

class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url && !key) {
    if (process.env.VERCEL) {
      throw new Error('Configura SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en Vercel.');
    }
    return null;
  }
  if (!url || !key) {
    throw new Error('Configura SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.');
  }
  return { url: url.replace(/\/+$/, ''), key };
}

function mapearEvaluacion(row) {
  return {
    id: row.id,
    nombre: row.nombre,
    agudezaVisual: row.agudeza_visual,
    campoVisual: row.campo_visual,
    tipoVision: row.tipo_vision,
    nivel: row.nivel,
    favorito: row.favorito,
    completado: row.completado
  };
}

async function solicitarSupabase(ruta, opciones = {}) {
  const { url, key } = getSupabaseConfig();
  const respuesta = await fetch(`${url}/rest/v1/evaluaciones${ruta}`, {
    ...opciones,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...(opciones.headers || {})
    }
  });
  const texto = await respuesta.text();
  if (!respuesta.ok) {
    throw new Error(`Supabase respondió ${respuesta.status}: ${texto}`);
  }
  return texto ? JSON.parse(texto) : [];
}

async function leerLocales() {
  try {
    return JSON.parse(await fs.readFile(rutaDatos, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    await fs.mkdir(path.dirname(rutaDatos), { recursive: true });
    await fs.writeFile(rutaDatos, JSON.stringify(datosIniciales, null, 2), 'utf8');
    return datosIniciales;
  }
}

async function guardarLocales(evaluaciones) {
  await fs.mkdir(path.dirname(rutaDatos), { recursive: true });
  await fs.writeFile(rutaDatos, JSON.stringify(evaluaciones, null, 2), 'utf8');
}

async function listarEvaluaciones() {
  if (!getSupabaseConfig()) return leerLocales();
  const filas = await solicitarSupabase('?select=id,nombre,agudeza_visual,campo_visual,tipo_vision,nivel,favorito,completado&order=id.desc');
  return filas.map(mapearEvaluacion);
}

async function listarTiposVision() {
  const evaluaciones = await listarEvaluaciones();
  return [...new Set(evaluaciones.map(evaluacion => evaluacion.tipoVision).filter(Boolean))];
}

function validarNuevaEvaluacion(datos) {
  if (!datos || typeof datos !== 'object' ||
      typeof datos.nombre !== 'string' || datos.nombre.trim().length < 3 ||
      typeof datos.agudezaVisual !== 'string' || !datos.agudezaVisual.trim() ||
      !Number.isInteger(datos.campoVisual) || datos.campoVisual < 0 || datos.campoVisual > 180 ||
      typeof datos.tipoVision !== 'string' || typeof datos.nivel !== 'string') {
    throw new ApiError(400, 'Datos de evaluación inválidos.');
  }
}

async function crearEvaluacion(datos) {
  validarNuevaEvaluacion(datos);
  const evaluacion = {
    nombre: datos.nombre.trim(),
    agudezaVisual: datos.agudezaVisual.trim(),
    campoVisual: datos.campoVisual,
    tipoVision: datos.tipoVision,
    nivel: datos.nivel,
    favorito: false,
    completado: false
  };
  if (getSupabaseConfig()) {
    const filas = await solicitarSupabase('?select=id,nombre,agudeza_visual,campo_visual,tipo_vision,nivel,favorito,completado', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        nombre: evaluacion.nombre,
        agudeza_visual: evaluacion.agudezaVisual,
        campo_visual: evaluacion.campoVisual,
        tipo_vision: evaluacion.tipoVision,
        nivel: evaluacion.nivel,
        favorito: false,
        completado: false
      })
    });
    if (!filas.length) throw new Error('Supabase no devolvió la evaluación creada.');
    return mapearEvaluacion(filas[0]);
  }
  const evaluaciones = await leerLocales();
  const nueva = { id: Date.now(), ...evaluacion };
  evaluaciones.unshift(nueva);
  await guardarLocales(evaluaciones);
  return nueva;
}

async function actualizarEvaluacion(id, cambios) {
  const idNumerico = Number(id);
  if (!Number.isSafeInteger(idNumerico) || idNumerico < 1) {
    throw new ApiError(404, 'Evaluación no encontrada.');
  }
  const camposPermitidos = ['favorito', 'completado'];
  const campos = cambios && typeof cambios === 'object' && !Array.isArray(cambios)
    ? Object.keys(cambios)
    : [];
  if (!campos.length || campos.some(campo =>
    !camposPermitidos.includes(campo) || typeof cambios[campo] !== 'boolean'
  )) {
    throw new ApiError(400, 'Solo se pueden actualizar favorito y completado (booleanos).');
  }
  if (getSupabaseConfig()) {
    const query = new URLSearchParams({
      id: `eq.${idNumerico}`,
      select: 'id,nombre,agudeza_visual,campo_visual,tipo_vision,nivel,favorito,completado'
    });
    const filas = await solicitarSupabase(`?${query}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify(cambios)
    });
    if (!filas.length) throw new ApiError(404, 'Evaluación no encontrada.');
    return mapearEvaluacion(filas[0]);
  }
  const evaluaciones = await leerLocales();
  const evaluacion = evaluaciones.find(item => item.id === idNumerico);
  if (!evaluacion) throw new ApiError(404, 'Evaluación no encontrada.');
  Object.assign(evaluacion, cambios);
  await guardarLocales(evaluaciones);
  return evaluacion;
}

module.exports = {
  ApiError,
  actualizarEvaluacion,
  crearEvaluacion,
  listarEvaluaciones,
  listarTiposVision
};
