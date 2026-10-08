const {
  ApiError,
  crearEvaluacion,
  listarEvaluaciones
} = require('../evaluaciones-store');

module.exports = async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      return res.status(200).json(await listarEvaluaciones());
    }
    if (req.method === 'POST') {
      return res.status(201).json(await crearEvaluacion(req.body));
    }
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Método no permitido.' });
  } catch (error) {
    if (!(error instanceof ApiError)) console.error(error);
    return res.status(error.statusCode || 500).json({
      error: error.statusCode ? error.message : 'Error interno del servidor.'
    });
  }
};
