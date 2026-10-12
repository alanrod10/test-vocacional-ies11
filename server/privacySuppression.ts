export type DistributionItem = {
  label: string;
  value: number;
};

export const MIN_SAFE_COUNT = 3;
export const SUPPRESSED_LABEL = "Otros / No revelado";

/**
 * Aplica supresión primaria y complementaria (S6) a distribuciones demográficas:
 * 1. Supresión primaria: Cualquier categoría con recuento menor a 3 (N < 3, ej. 1 o 2)
 *    no se puede mostrar individualmente y se agrupa bajo "Otros / No revelado".
 * 2. Supresión complementaria: Si solo una categoría tiene N < 3, un observador podría
 *    deducir su valor exacto restando las categorías visibles del total conocido.
 *    Para evitarlo, se suprime también la siguiente categoría visible más pequeña (incluso si tiene N >= 3),
 *    combinándolas en "Otros / No revelado".
 */
export function applyPrivacySuppression(
  items: DistributionItem[],
  minThreshold: number = MIN_SAFE_COUNT,
  otherLabel: string = SUPPRESSED_LABEL
): DistributionItem[] {
  // Filtra categorías sin observaciones
  const nonZero = items.filter((item) => item.value > 0);
  if (nonZero.length === 0) return [];

  // Si todas las categorías tienen al menos el umbral, no se requiere supresión
  const small = nonZero.filter((item) => item.value < minThreshold);
  if (small.length === 0) {
    return [...nonZero].sort((a, b) => b.value - a.value);
  }

  // Categorías candidatas a permanecer visibles (ordenadas ascendentemente por valor)
  const safe = nonZero
    .filter((item) => item.value >= minThreshold)
    .sort((a, b) => a.value - b.value);

  const suppressed: DistributionItem[] = [...small];

  // Supresión complementaria: si solo hay 1 categoría con N < minThreshold
  if (small.length === 1 && safe.length > 0) {
    // Tomamos la categoría visible más pequeña para proteger la deductibilidad
    const complementary = safe.shift()!;
    suppressed.push(complementary);
  }

  const suppressedSum = suppressed.reduce((sum, item) => sum + item.value, 0);

  const result: DistributionItem[] = safe.sort((a, b) => b.value - a.value);

  if (suppressedSum > 0) {
    result.push({
      label: otherLabel,
      value: suppressedSum,
    });
  }

  return result;
}

/**
 * Función utilitaria para mapear un Record<string, number> a DistributionItem[] con supresión.
 */
export function safeDistributionRecord(
  counts: Record<string, number>,
  minThreshold: number = MIN_SAFE_COUNT,
  otherLabel: string = SUPPRESSED_LABEL
): DistributionItem[] {
  const items: DistributionItem[] = Object.entries(counts).map(([label, value]) => ({
    label,
    value,
  }));
  return applyPrivacySuppression(items, minThreshold, otherLabel);
}
