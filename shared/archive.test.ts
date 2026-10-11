import { describe, expect, it } from "vitest";
import { HISTORICAL_ARCHIVE, HISTORICAL_ARCHIVE_MESSAGE } from "./archive";

describe("archivo histórico de la Expo Educativa 2026", () => {
  it("mantiene cerrados el registro y el reinicio, sin bloquear la exportación privada", () => {
    expect(HISTORICAL_ARCHIVE.enabled).toBe(true);
    expect(HISTORICAL_ARCHIVE.allowNewAssessments).toBe(false);
    expect(HISTORICAL_ARCHIVE.allowReset).toBe(false);
    expect(HISTORICAL_ARCHIVE.allowPrivateExport).toBe(true);
    expect(HISTORICAL_ARCHIVE_MESSAGE).toContain("cerrada");
  });
});
