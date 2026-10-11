import { describe, expect, it } from "vitest";
import { buildSocialCardSummary } from "./socialCardSummary";

describe("resumen para tarjeta compartible", () => {
  it("prioriza la primera idea profesional y mantiene un límite legible", () => {
    expect(buildSocialCardSummary("Integra equipos técnicos. Luego desarrolla soluciones con herramientas especializadas.")).toBe("Integra equipos técnicos.");
    expect(buildSocialCardSummary("Una explicación profesional muy extensa ".repeat(20), 80).length).toBeLessThanOrEqual(80);
  });
});
