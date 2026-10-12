import { describe, expect, it } from "vitest";
import { buildTopAffinityComparison } from "./topAffinityComparison";

describe("comparación de afinidades principales", () => {
  it("preserva el orden, los puntajes y datos de decisión de las tres tecnicaturas con bandas", () => {
    const rows = buildTopAffinityComparison([
      { program: "TS en Ciencias de Datos e Inteligencia Artificial", score: 91, area: "Tecnología e Innovación" },
      { program: "TS en Desarrollo de Software", score: 83, area: "Tecnología e Innovación" },
      { program: "TS en Estadísticas de Salud", score: 76, area: "Salud y Bienestar" },
    ]);

    expect(rows).toHaveLength(3);
    expect(rows[0]).toMatchObject({
      position: 1,
      program: "TS en Ciencias de Datos e Inteligencia Artificial",
      score: 91,
      band: "Afinidad Alta",
      isTie: false,
      area: "Tecnología e Innovación",
    });
    expect(rows.every((row) => row.focus.length > 40 && row.subjects.length === 2 && row.field.length > 30)).toBe(true);
  });

  it("identifica empates en el Top 3 y asigna la banda correspondiente", () => {
    const rows = buildTopAffinityComparison([
      { program: "TS en Ciencias de Datos e Inteligencia Artificial", score: 85, area: "Tecnología e Innovación" },
      { program: "TS en Desarrollo de Software", score: 85, area: "Tecnología e Innovación" },
      { program: "TS en Estadísticas de Salud", score: 60, area: "Salud y Bienestar" },
    ]);

    expect(rows[0].isTie).toBe(true);
    expect(rows[1].isTie).toBe(true);
    expect(rows[2].isTie).toBe(false);
    expect(rows[0].band).toBe("Afinidad Alta");
    expect(rows[1].band).toBe("Afinidad Alta");
    expect(rows[2].band).toBe("Afinidad Media");
  });

  it("omite una tecnicatura desconocida sin inventar datos comparativos", () => {
    expect(buildTopAffinityComparison([{ program: "Inexistente", score: 0, area: "Ninguna" }])).toEqual([]);
  });
});
