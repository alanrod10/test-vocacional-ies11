import { describe, expect, it } from "vitest";
import { buildResultSharePath, buildResultShareUrl } from "./resultShare";

describe("enlace compartible de resultado", () => {
  it("codifica el nombre completo de la tecnicatura en una ruta recuperable", () => {
    const program = "TS en Ciencias de Datos e Inteligencia Artificial";
    expect(buildResultSharePath(program)).toBe("/?resultado=TS%20en%20Ciencias%20de%20Datos%20e%20Inteligencia%20Artificial");
    expect(buildResultShareUrl("https://testvocacional.ies11.edu.ar", program)).toBe("https://testvocacional.ies11.edu.ar/?resultado=TS%20en%20Ciencias%20de%20Datos%20e%20Inteligencia%20Artificial");
  });
});
