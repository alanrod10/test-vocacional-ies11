import { describe, expect, it } from "vitest";
import { detectTies, getAffinityBand, hasWinnerTie } from "./affinityBands";

describe("bandas de afinidad", () => {
  it("clasifica puntajes en Afinidad Alta, Media y Baja", () => {
    expect(getAffinityBand(95)).toBe("Afinidad Alta");
    expect(getAffinityBand(70)).toBe("Afinidad Alta");
    expect(getAffinityBand(69)).toBe("Afinidad Media");
    expect(getAffinityBand(45)).toBe("Afinidad Media");
    expect(getAffinityBand(44)).toBe("Afinidad Baja");
    expect(getAffinityBand(10)).toBe("Afinidad Baja");
  });

  it("detecta empates entre posiciones consecutivas correctamente", () => {
    // Empate entre 1 y 2
    const tie12 = [
      { program: "Carrera A", score: 85 },
      { program: "Carrera B", score: 85 },
      { program: "Carrera C", score: 70 },
    ];
    expect(detectTies(tie12)).toEqual([true, true, false]);
    expect(hasWinnerTie(tie12)).toBe(true);

    // Empate entre 2 y 3
    const tie23 = [
      { program: "Carrera A", score: 90 },
      { program: "Carrera B", score: 75 },
      { program: "Carrera C", score: 75 },
    ];
    expect(detectTies(tie23)).toEqual([false, true, true]);
    expect(hasWinnerTie(tie23)).toBe(false);

    // Triple empate
    const tripleTie = [
      { program: "Carrera A", score: 80 },
      { program: "Carrera B", score: 80 },
      { program: "Carrera C", score: 80 },
    ];
    expect(detectTies(tripleTie)).toEqual([true, true, true]);
    expect(hasWinnerTie(tripleTie)).toBe(true);

    // Sin empates
    const noTie = [
      { program: "Carrera A", score: 90 },
      { program: "Carrera B", score: 80 },
      { program: "Carrera C", score: 70 },
    ];
    expect(detectTies(noTie)).toEqual([false, false, false]);
    expect(hasWinnerTie(noTie)).toBe(false);
  });
});
