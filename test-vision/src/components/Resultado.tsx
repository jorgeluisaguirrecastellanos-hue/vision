import type { ResultadoRonda } from "../data/niveles.js";
import type { Calibracion } from "../utils/calibracion.js";

type Props = {
  resultados: ResultadoRonda[];
  calibracion: Calibracion;
  onRepetir: () => void;
  onRecalibrar: () => void;
};

function Resultado({
  resultados,
  calibracion,
  onRepetir,
  onRecalibrar,
}: Props) {
  const aprobadas = resultados.filter((resultado) => resultado.aprobada);
  const ultimaAprobada = aprobadas[aprobadas.length - 1];

  const agudezaFinal = ultimaAprobada
    ? ultimaAprobada.agudeza
    : "inferior a 20/200";

  return (
    <section className="panel">
      <h1>Resultado</h1>

      <div className="tarjeta-resultado">
        <span className="etiqueta-resultado">Tu nivel estimado es</span>
        <strong className="nivel-final">{agudezaFinal}</strong>
        {!ultimaAprobada && (
          <span className="nota-resultado">
            No superaste la primera ronda en esta prueba.
          </span>
        )}
      </div>

      <p className="subtitulo">
        Distancia de lectura usada: {calibracion.distanciaCm} cm.
      </p>

      <table className="tabla-resultados">
        <thead>
          <tr>
            <th>Nivel</th>
            <th>Aciertos</th>
            <th>Resultado</th>
          </tr>
        </thead>
        <tbody>
          {resultados.map((resultado) => (
            <tr key={resultado.agudeza}>
              <td>{resultado.agudeza}</td>
              <td>
                {resultado.correctas} / {resultado.total}
              </td>
              <td>
                <span
                  className={
                    resultado.aprobada ? "estado-ok" : "estado-fallo"
                  }
                >
                  {resultado.aprobada ? "Aprobada" : "No superada"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="aviso">
        Recuerda: este resultado es orientativo y no reemplaza un examen
        profesional de la vista.
      </p>

      <div className="acciones">
        <button className="boton-principal" onClick={onRepetir}>
          Repetir test
        </button>
        <button className="boton-secundario" onClick={onRecalibrar}>
          Recalibrar
        </button>
      </div>
    </section>
  );
}

export default Resultado;
