type Props = {
  onComenzar: () => void;
};

function Inicio({ onComenzar }: Props) {
  return (
    <section className="panel">
      <h1>Test de visión</h1>
      <p className="subtitulo">
        Una prueba rápida tipo cartilla para estimar tu nivel de agudeza
        visual.
      </p>

      <ol className="pasos">
        <li>Calibra el tamaño de la pantalla con una tarjeta real.</li>
        <li>Indica a qué distancia estarás de la pantalla.</li>
        <li>
          Lee las letras de cada ronda y escríbelas. A medida que avanzas se
          hacen más pequeñas.
        </li>
      </ol>

      <p className="aviso">
        Esta herramienta es orientativa y no reemplaza un examen profesional
        de la vista.
      </p>

      <button className="boton-principal" onClick={onComenzar}>
        Comenzar
      </button>
    </section>
  );
}

export default Inicio;
