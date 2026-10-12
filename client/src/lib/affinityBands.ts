export type AffinityBand = "Afinidad Alta" | "Afinidad Media" | "Afinidad Baja";

/**
 * Mapea un puntaje numérico de afinidad (0-100) a bandas cualitativas,
 * mitigando la ilusión de precisión matemática exacta.
 */
export function getAffinityBand(score: number): AffinityBand {
  if (score >= 70) return "Afinidad Alta";
  if (score >= 45) return "Afinidad Media";
  return "Afinidad Baja";
}

/**
 * Detecta empates consecutivos en una lista ordenada de resultados por puntaje.
 * Retorna un arreglo de booleanos indicando si cada elemento está empatado con su adyacente.
 */
export function detectTies<T extends { score: number }>(items: T[]): boolean[] {
  return items.map((item, index) => {
    const prev = items[index - 1];
    const next = items[index + 1];
    return (
      (prev !== undefined && prev.score === item.score) ||
      (next !== undefined && next.score === item.score)
    );
  });
}

/**
 * Indica si el primer lugar comparte puntaje exacto con el segundo lugar.
 */
export function hasWinnerTie<T extends { score: number }>(topThree: T[]): boolean {
  if (topThree.length < 2) return false;
  return topThree[0].score === topThree[1].score;
}
