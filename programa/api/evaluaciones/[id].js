const {
  ApiError,
  actualizarEvaluacion
} = require('../../evaluaciones-store');

module.exports = async function handler(req, res) {
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', 'PATCH');
    return res.status(405).json({ error: 'Método no permitido.' });
  }
  try {
    const { id } = req.query;
    return res.status(200).json(await actualizarEvaluacion(id, req.body));
  } catch (error) {
    if (!(error instanceof ApiError)) console.error(error);
    return res.status(error.statusCode || 500).json({
      error: error.statusCode ? error.message : 'Error interno del servidor.'
    });
  }
};
