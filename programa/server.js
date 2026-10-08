const express = require('express');
const fsSync = require('fs');
const path = require('path');
const {
  actualizarEvaluacion,
  crearEvaluacion,
  listarEvaluaciones
} = require('./evaluaciones-store');

const app = express();
const puerto = process.env.PORT || 3000;
const rutaWeb = __dirname;
const rutaWebCompilada = path.join(rutaWeb, 'dist');

app.use(express.json());
app.use(express.static(fsSync.existsSync(rutaWebCompilada) ? rutaWebCompilada : rutaWeb));

app.get('/api/evaluaciones', async (req, res, next) => {
  try { res.json(await listarEvaluaciones()); } catch (error) { next(error); }
});

app.post('/api/evaluaciones', async (req, res, next) => {
  try { res.status(201).json(await crearEvaluacion(req.body)); } catch (error) { next(error); }
});

app.patch('/api/evaluaciones/:id', async (req, res, next) => {
  try { res.json(await actualizarEvaluacion(req.params.id, req.body)); } catch (error) { next(error); }
});

app.use('/api', (req, res) => res.status(404).json({ error: 'Ruta de API no encontrada.' }));
app.use((error, req, res, next) => {
  console.error(error);
  res.status(error.statusCode || 500).json({
    error: error.statusCode ? error.message : 'Error interno del servidor.'
  });
});

if (require.main === module) {
  app.listen(puerto, () => console.log(`Servidor en http://localhost:${puerto}`));
}

module.exports = app;
