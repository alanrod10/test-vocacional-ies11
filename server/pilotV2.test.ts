import { describe, expect, it } from "vitest";
import { generateSyntheticBatch } from "../scripts/runPilotV2";
import {
  exportDimensionalCsv,
  FACT_AFINIDADES_HEADERS,
  FACT_EVALUACIONES_HEADERS,
  FACT_RESPUESTAS_HEADERS,
} from "./db";
import { calculateAnalytics } from "./routers";
import { CANDIDATE_V2_PROGRAM_NAMES } from "../shared/vocational";

describe("Piloto sintético integral del motor v2 (AG-15)", () => {
  it("genera un lote de 100 evaluaciones sintéticas con 36 ítems y Zero-PII", () => {
    const batch = generateSyntheticBatch(100);

    expect(batch).toHaveLength(100);

    for (const record of batch) {
      // Validación Zero-PII
      expect(record.firstName).toBeNull();
      expect(record.lastName).toBeNull();

      // Validación de versiones
      expect(record.catalogVersion).toBe("2026.10-borrador-36");
      expect(record.engineVersion).toBe("v2-similitud-pura");
      expect(record.questionnaireVersion).toBe("2026.10-borrador-36");

      // Validación de 36 ítems en selections
      const selectionKeys = Object.keys(record.selections as Record<string, string>);
      expect(selectionKeys).toHaveLength(36);

      // Validación de 18 tecnicaturas en el snapshot
      expect(record.scoreSnapshot).toHaveLength(18);
      expect(CANDIDATE_V2_PROGRAM_NAMES).toContain(record.resultProgram);
    }
  });

  it("exporta las tres tablas dimensionales con columnas fijas y cardinalidad exacta", async () => {
    const batch = generateSyntheticBatch(100);

    const factEval = await exportDimensionalCsv("evaluations", batch);
    const factAffin = await exportDimensionalCsv("affinities", batch);
    const factResp = await exportDimensionalCsv("responses", batch);

    const evalLines = factEval.content.split("\n").filter((l) => l.trim().length > 0);
    const affinLines = factAffin.content.split("\n").filter((l) => l.trim().length > 0);
    const respLines = factResp.content.split("\n").filter((l) => l.trim().length > 0);

    // Cantidad de filas de datos
    expect(evalLines.length - 1).toBe(100);
    expect(affinLines.length - 1).toBe(100 * 18); // 1.800 filas
    expect(respLines.length - 1).toBe(100 * 36); // 3.600 filas

    // Cantidad de columnas (deben coincidir exactamente con los headers fijos)
    const evalHeaderCols = evalLines[0].split(";").length;
    const affinHeaderCols = affinLines[0].split(";").length;
    const respHeaderCols = respLines[0].split(";").length;

    expect(evalHeaderCols).toBe(FACT_EVALUACIONES_HEADERS.length); // 15
    expect(affinHeaderCols).toBe(FACT_AFINIDADES_HEADERS.length); // 8
    expect(respHeaderCols).toBe(FACT_RESPUESTAS_HEADERS.length); // 7

    // Verificar que FactRespuestas no contenga nombres de evaluados
    expect(factResp.content).not.toContain("Carlos");
    expect(factResp.content).not.toContain("María");
  });

  it("calcula analítica agregada para el catálogo borrador v2 sin revelar PII", () => {
    const batch = generateSyntheticBatch(100);
    const analytics = calculateAnalytics(batch, "2026.10-borrador-36");

    expect(analytics.total).toBe(100);
    expect(analytics.version).toBe("2026.10-borrador-36");
    expect(analytics.programCount).toBe(18);
    expect(analytics.tieCount).toBeGreaterThanOrEqual(0);
    expect(analytics.tieRate).toBeGreaterThanOrEqual(0);
    expect(analytics.averageAge).toBeGreaterThan(0);

    // Verificar que la vista de borrador figure entre las vistas de catálogo
    expect(analytics.catalogViews.some((v) => v.version === "2026.10-borrador-36")).toBe(true);

    // Verificar que no se filtran nombres en el JSON emitido
    const serialized = JSON.stringify(analytics);
    expect(serialized).not.toContain("firstName");
    expect(serialized).not.toContain("lastName");
  });
});
