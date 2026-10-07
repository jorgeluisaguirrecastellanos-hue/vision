export const ANCHO_TARJETA_MM = 85.6;
export const ALTO_TARJETA_MM = 53.98;

export const DISTANCIAS_CM = [40, 100, 300, 600] as const;

export type Calibracion = {
  /** Cuántos píxeles hay en un milímetro de la pantalla. */
  pxPorMm: number;
  /** Distancia a la que la persona estará de la pantalla, en centímetros. */
  distanciaCm: number;
};

export const CALIBRACION_POR_DEFECTO: Calibracion = {
  pxPorMm: 3.7795,
  distanciaCm: 40,
};

const CLAVE_ALMACENAMIENTO = "test-vision-calibracion";

export function guardarCalibracion(calibracion: Calibracion): void {
  try {
    localStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(calibracion));
  } catch {
    // localStorage puede no estar disponible; se ignora.
  }
}

export function cargarCalibracion(): Calibracion | null {
  try {
    const crudo = localStorage.getItem(CLAVE_ALMACENAMIENTO);
    if (!crudo) {
      return null;
    }

    const dato = JSON.parse(crudo) as Partial<Calibracion>;
    if (
      typeof dato.pxPorMm === "number" &&
      dato.pxPorMm > 0 &&
      typeof dato.distanciaCm === "number" &&
      dato.distanciaCm > 0
    ) {
      return { pxPorMm: dato.pxPorMm, distanciaCm: dato.distanciaCm };
    }
  } catch {
    // Datos corruptos; se ignora.
  }

  return null;
}

/**
 * Altura física (en milímetros) de una letra para una agudeza dada.
 * Una letra 20/20 subtiende 5 minutos de arco a la distancia indicada.
 */
export function alturaLetraMm(factor: number, distanciaCm: number): number {
  const distanciaMm = distanciaCm * 10;
  const anguloRad = (5 / 60) * (Math.PI / 180);
  return distanciaMm * anguloRad * factor;
}

/** Altura en píxeles de una letra según la calibración actual. */
export function alturaLetraPx(
  factor: number,
  calibracion: Calibracion,
): number {
  return alturaLetraMm(factor, calibracion.distanciaCm) * calibracion.pxPorMm;
}
