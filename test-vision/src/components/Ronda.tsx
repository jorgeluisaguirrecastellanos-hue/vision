import { useState } from "react";
import { LETRAS_OPTOTIPO, type NivelVision } from "../data/niveles.js";
import { alturaLetraPx, type Calibracion } from "../utils/calibracion.js";

type Props = {
  nivel: NivelVision;
  indice: number;
  total: number;
  calibracion: Calibracion;
  onResponder: (correctas: number) => void;
};

function mezclar<T>(arreglo: readonly T[]): T[] {
  const copia = [...arreglo];
  for (let i = copia.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function generarLetras(cantidad: number): string[] {
  return mezclar(LETRAS_OPTOTIPO).slice(0, cantidad);
}

function normalizar(texto: string): string {
  return texto.toUpperCase().replace(/\s+/g, "");
}

function Ronda({ nivel, indice, total, calibracion, onResponder }: Props) {
  const [letras] = useState(() => generarLetras(nivel.letras));
  const [respuesta, setRespuesta] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [correctas, setCorrectas] = useState(0);

  const tamanoPx = alturaLetraPx(nivel.factor, calibracion);
  const respuestaNormalizada = normalizar(respuesta);

  function esCorrecta(posicion: number): boolean {
    return respuestaNormalizada[posicion] === letras[posicion];
  }

  function comprobar() {
    const total = letras.filter((_, posicion) => esCorrecta(posicion)).length;
    setCorrectas(total);
    setEnviado(true);
  }

  return (
    <section className="panel">
      <header className="cabecera-ronda">
        <span>
          Ronda {indice + 1} de {total}
        </span>
        <span className="nivel-objetivo">Nivel {nivel.agudeza}</span>
      </header>

      <div className="cartilla">
        {letras.map((letra, posicion) => {
          let clase = "letra";
          if (enviado) {
            clase += esCorrecta(posicion) ? " letra-correcta" : " letra-incorrecta";
          }
          return (
            <span
              key={`${letra}-${posicion}`}
              className={clase}
              style={{ fontSize: `${tamanoPx}px` }}
            >
              {letra}
            </span>
          );
        })}
      </div>

      <label className="campo">
        Escribe las letras que ves
        <input
          className="respuesta"
          value={respuesta}
          maxLength={nivel.letras}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          disabled={enviado}
          onChange={(evento) => setRespuesta(evento.target.value)}
        />
      </label>

      <div className="acciones">
        {!enviado ? (
          <button className="boton-principal" onClick={comprobar}>
            Comprobar
          </button>
        ) : (
          <div className="resultado-ronda">
            <span className="marcador">
              {correctas} de {letras.length} correctas
            </span>
            <button
              className="boton-principal"
              onClick={() => onResponder(correctas)}
            >
              Continuar
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default Ronda;
