import { useState } from "react";
import {
  ALTO_TARJETA_MM,
  ANCHO_TARJETA_MM,
  CALIBRACION_POR_DEFECTO,
  DISTANCIAS_CM,
  type Calibracion,
} from "../utils/calibracion.js";

type Props = {
  inicial: Calibracion | null;
  onGuardar: (calibracion: Calibracion) => void;
  onCancelar: () => void;
};

const ANCHO_MINIMO_PX = 120;
const ANCHO_MAXIMO_PX = 620;
const PASO_PX = 1;

function CalibracionPantalla({ inicial, onGuardar, onCancelar }: Props) {
  const base = inicial ?? CALIBRACION_POR_DEFECTO;
  const [anchoPx, setAnchoPx] = useState(
    Math.round(base.pxPorMm * ANCHO_TARJETA_MM),
  );
  const [distanciaCm, setDistanciaCm] = useState(base.distanciaCm);

  const altoPx = (anchoPx * ALTO_TARJETA_MM) / ANCHO_TARJETA_MM;
  const pxPorMm = anchoPx / ANCHO_TARJETA_MM;

  function guardar() {
    onGuardar({ pxPorMm, distanciaCm });
  }

  return (
    <section className="panel">
      <h1>Calibración</h1>
      <p className="subtitulo">
        Apoya una tarjeta real (de crédito, débito o identificación) sobre la
        pantalla y mueve el control hasta que su tamaño coincida con el
        recuadro.
      </p>

      <div className="marco-tarjeta">
        <div className="tarjeta" style={{ width: anchoPx, height: altoPx }}>
          <span className="tarjeta-texto">Tu tarjeta debe encajar aquí</span>
        </div>
      </div>

      <label className="campo-rango">
        Tamaño de la tarjeta
        <input
          type="range"
          min={ANCHO_MINIMO_PX}
          max={ANCHO_MAXIMO_PX}
          step={PASO_PX}
          value={anchoPx}
          onChange={(evento) => setAnchoPx(Number(evento.target.value))}
        />
      </label>

      <div className="campo">
        <span className="etiqueta">¿A qué distancia estarás?</span>
        <div className="opciones">
          {DISTANCIAS_CM.map((distancia) => (
            <button
              key={distancia}
              className={
                distanciaCm === distancia
                  ? "opcion opcion-activa"
                  : "opcion"
              }
              onClick={() => setDistanciaCm(distancia)}
            >
              {distancia >= 100 ? `${distancia / 100} m` : `${distancia} cm`}
            </button>
          ))}
        </div>

        <label className="campo-distancia">
          Distancia personalizada (cm)
          <input
            type="number"
            min={20}
            max={1000}
            value={distanciaCm}
            onChange={(evento) => {
              const valor = Number(evento.target.value);
              if (valor > 0) {
                setDistanciaCm(valor);
              }
            }}
          />
        </label>
      </div>

      <div className="acciones">
        <button className="boton-principal" onClick={guardar}>
          Guardar y comenzar
        </button>
        <button className="boton-secundario" onClick={onCancelar}>
          Volver
        </button>
      </div>
    </section>
  );
}

export default CalibracionPantalla;
