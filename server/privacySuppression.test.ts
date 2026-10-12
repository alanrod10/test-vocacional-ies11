import { describe, expect, it } from "vitest";
import {
  applyPrivacySuppression,
  safeDistributionRecord,
  SUPPRESSED_LABEL,
} from "./privacySuppression";

describe("Supresión de Privacidad (S6) con umbral N < 3", () => {
  it("no aplica supresión si todas las categorías tienen N >= 3", () => {
    const input = [
      { label: "San Salvador de Jujuy", value: 15 },
      { label: "Palpalá", value: 6 },
      { label: "Perico", value: 3 },
    ];
    const result = applyPrivacySuppression(input);

    expect(result).toEqual([
      { label: "San Salvador de Jujuy", value: 15 },
      { label: "Palpalá", value: 6 },
      { label: "Perico", value: 3 },
    ]);
    expect(result.some((r) => r.label === SUPPRESSED_LABEL)).toBe(false);
  });

  it("aplica supresión primaria y complementaria cuando solo una categoría tiene N < 3", () => {
    // Caso clásico: Una categoría con N=2, y las demás con N>=3.
    // Para que N=2 no sea deducible restando del total conocido (Total=17),
    // la categoría más pequeña de las seguras (Palpalá: 5) debe ser suprimida complementariamente.
    const input = [
      { label: "San Salvador de Jujuy", value: 10 },
      { label: "Palpalá", value: 5 },
      { label: "Perico", value: 2 },
    ];
    const result = applyPrivacySuppression(input);

    // Perico (2) y Palpalá (5) deben quedar agrupados en "Otros / No revelado" (valor 7)
    expect(result).toEqual([
      { label: "San Salvador de Jujuy", value: 10 },
      { label: SUPPRESSED_LABEL, value: 7 },
    ]);
  });

  it("agrupa múltiples categorías con N < 3 en 'Otros / No revelado' sin supresión complementaria adicional", () => {
    // Si ya hay dos o más categorías menores a 3, su suma no revela ninguna de las dos individualmente
    const input = [
      { label: "San Salvador de Jujuy", value: 12 },
      { label: "Palpalá", value: 5 },
      { label: "Perico", value: 2 },
      { label: "El Carmen", value: 1 },
    ];
    const result = applyPrivacySuppression(input);

    // Perico (2) + El Carmen (1) = 3
    expect(result).toEqual([
      { label: "San Salvador de Jujuy", value: 12 },
      { label: "Palpalá", value: 5 },
      { label: SUPPRESSED_LABEL, value: 3 },
    ]);
  });

  it("suprime adecuadamente cuando todos los grupos tienen N < 3", () => {
    const input = [
      { label: "Tilcara", value: 2 },
      { label: "Humahuaca", value: 1 },
    ];
    const result = applyPrivacySuppression(input);

    expect(result).toEqual([{ label: SUPPRESSED_LABEL, value: 3 }]);
  });

  it("suprime un único grupo si es el único presente y tiene N < 3", () => {
    const input = [{ label: "Susques", value: 2 }];
    const result = applyPrivacySuppression(input);

    expect(result).toEqual([{ label: SUPPRESSED_LABEL, value: 2 }]);
  });

  it("maneja correctamente listas vacías o valores en cero", () => {
    expect(applyPrivacySuppression([])).toEqual([]);
    expect(applyPrivacySuppression([{ label: "A", value: 0 }])).toEqual([]);
  });

  it("funciona correctamente a través de safeDistributionRecord", () => {
    const counts = {
      Femenino: 8,
      Masculino: 4,
      "Otro / Prefiero no decir": 2,
    };
    const result = safeDistributionRecord(counts);

    // "Otro..." (2) es menor a 3. Por complementaria, Masculino (4) se agrupa.
    expect(result).toEqual([
      { label: "Femenino", value: 8 },
      { label: SUPPRESSED_LABEL, value: 6 },
    ]);
  });
});
