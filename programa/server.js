const express = require('express');
const fsSync = require('fs');
const fs = require('fs/promises');
const path = require('path');

const app = express();
const puerto = process.env.PORT || 3000;
const rutaDatos = path.join(__dirname, 'data', 'evaluaciones.json');
const rutaWeb = path.join(__dirname, 'vision', 'programa');
const rutaWebCompilada = path.join(rutaWeb, 'dist');

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

async function leerEvaluaciones() {
  try {
    return JSON.parse(await fs.readFile(rutaDatos, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    await fs.mkdir(path.dirname(rutaDatos), { recursive: true });
    await fs.writeFile(rutaDatos, JSON.stringify(datosIniciales, null, 2), 'utf8');
    return datosIniciales;
  }
}

async function guardarEvaluaciones(evaluaciones) {
  await fs.mkdir(path.dirname(rutaDatos), { recursive: true });
  await fs.writeFile(rutaDatos, JSON.stringify(evaluaciones, null, 2), 'utf8');
}

app.use(express.json());
app.use(express.static(fsSync.existsSync(rutaWebCompilada) ? rutaWebCompilada : rutaWeb));

app.get('/api/evaluaciones', async (req, res, next) => {
  try { res.json(await leerEvaluaciones()); } catch (error) { next(error); }
});

app.post('/api/evaluaciones', async (req, res, next) => {
  try {
    const { nombre, agudezaVisual, campoVisual, tipoVision, nivel } = req.body;
    if (typeof nombre !== 'string' || nombre.trim().length < 3 ||
        typeof agudezaVisual !== 'string' || !agudezaVisual.trim() ||
        !Number.isInteger(campoVisual) || campoVisual < 0 || campoVisual > 180 ||
        typeof tipoVision !== 'string' || typeof nivel !== 'string') {
      return res.status(400).json({ error: 'Datos de evaluación inválidos.' });
    }
    const evaluaciones = await leerEvaluaciones();
    const nueva = {
      id: Date.now(), nombre: nombre.trim(), agudezaVisual: agudezaVisual.trim(), campoVisual,
      tipoVision, nivel, favorito: false, completado: false
    };
    evaluaciones.unshift(nueva);
    await guardarEvaluaciones(evaluaciones);
    res.status(201).json(nueva);
  } catch (error) { next(error); }
});

app.patch('/api/evaluaciones/:id', async (req, res, next) => {
  try {
    const evaluaciones = await leerEvaluaciones();
    const evaluacion = evaluaciones.find(item => item.id === Number(req.params.id));
    if (!evaluacion) return res.status(404).json({ error: 'Evaluación no encontrada.' });
    const campos = ['favorito', 'completado'];
    const cambios = Object.keys(req.body);
    if (!cambios.length || cambios.some(campo => !campos.includes(campo) || typeof req.body[campo] !== 'boolean')) {
      return res.status(400).json({ error: 'Solo se pueden actualizar favorito y completado (booleanos).' });
    }
    Object.assign(evaluacion, req.body);
    await guardarEvaluaciones(evaluaciones);
    res.json(evaluacion);
  } catch (error) { next(error); }
});

app.use('/api', (req, res) => res.status(404).json({ error: 'Ruta de API no encontrada.' }));
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: 'Error interno del servidor.' });
});

app.listen(puerto, () => console.log(`Servidor en http://localhost:${puerto}`));
