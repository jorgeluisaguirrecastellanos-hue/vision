export const LETRAS_OPTOTIPO = [
  "C",
  "D",
  "E",
  "F",
  "L",
  "O",
  "P",
  "T",
  "Z",
] as const;

export type NivelVision = {
  /** Agudeza que representa el nivel, por ejemplo "20/40". */
  agudeza: string;
  /** factor = X / 20 para una agudeza 20/X. */
  factor: number;
  /** Cantidad de letras que se muestran en la ronda. */
  letras: number;
};

export const NIVELES: NivelVision[] = [
  { agudeza: "20/200", factor: 10, letras: 5 },
  { agudeza: "20/100", factor: 5, letras: 5 },
  { agudeza: "20/70", factor: 3.5, letras: 5 },
  { agudeza: "20/50", factor: 2.5, letras: 5 },
  { agudeza: "20/40", factor: 2, letras: 5 },
  { agudeza: "20/30", factor: 1.5, letras: 5 },
  { agudeza: "20/25", factor: 1.25, letras: 5 },
  { agudeza: "20/20", factor: 1, letras: 5 },
];

/** Aciertos mínimos para aprobar una ronda (4 de 5). */
export const MINIMO_APROBADO = 4;

export type ResultadoRonda = {
  agudeza: string;
  correctas: number;
  total: number;
  aprobada: boolean;
};
