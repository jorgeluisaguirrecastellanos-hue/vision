import { useState } from "react";
import "./App.css";
import Inicio from "./components/Inicio.js";
import CalibracionPantalla from "./components/Calibracion.js";
import Ronda from "./components/Ronda.js";
import Resultado from "./components/Resultado.js";
import {
  MINIMO_APROBADO,
  NIVELES,
  type ResultadoRonda,
} from "./data/niveles.js";
import {
  CALIBRACION_POR_DEFECTO,
  cargarCalibracion,
  guardarCalibracion,
  type Calibracion,
} from "./utils/calibracion.js";

type Vista = "inicio" | "calibracion" | "prueba" | "resultado";

function App() {
  const [vista, setVista] = useState<Vista>("inicio");
  const [calibracion, setCalibracion] = useState<Calibracion | null>(() =>
    cargarCalibracion(),
  );
  const [indiceRonda, setIndiceRonda] = useState(0);
  const [resultados, setResultados] = useState<ResultadoRonda[]>([]);

  function comenzar() {
    setVista("calibracion");
  }

  function guardarYContinuar(nuevaCalibracion: Calibracion) {
    guardarCalibracion(nuevaCalibracion);
    setCalibracion(nuevaCalibracion);
    setIndiceRonda(0);
    setResultados([]);
    setVista("prueba");
  }

  function responder(correctas: number) {
    const nivel = NIVELES[indiceRonda];
    const aprobada = correctas >= MINIMO_APROBADO;

    setResultados((actuales) => [
      ...actuales,
      {
        agudeza: nivel.agudeza,
        correctas,
        total: nivel.letras,
        aprobada,
      },
    ]);

    const esUltimaRonda = indiceRonda === NIVELES.length - 1;
    if (!aprobada || esUltimaRonda) {
      setVista("resultado");
    } else {
      setIndiceRonda((indice) => indice + 1);
    }
  }

  function repetir() {
    setIndiceRonda(0);
    setResultados([]);
    setVista("prueba");
  }

  function recalibrar() {
    setVista("calibracion");
  }

  const calibracionActiva = calibracion ?? CALIBRACION_POR_DEFECTO;

  return (
    <main className="contenedor">
      {vista === "inicio" && <Inicio onComenzar={comenzar} />}

      {vista === "calibracion" && (
        <CalibracionPantalla
          inicial={calibracion}
          onGuardar={guardarYContinuar}
          onCancelar={() => setVista("inicio")}
        />
      )}

      {vista === "prueba" && (
        <Ronda
          key={indiceRonda}
          nivel={NIVELES[indiceRonda]}
          indice={indiceRonda}
          total={NIVELES.length}
          calibracion={calibracionActiva}
          onResponder={responder}
        />
      )}

      {vista === "resultado" && (
        <Resultado
          resultados={resultados}
          calibracion={calibracionActiva}
          onRepetir={repetir}
          onRecalibrar={recalibrar}
        />
      )}
    </main>
  );
}

export default App;
