import { describe, expect, it } from "vitest";
import {
  HISTORICAL_ARCHIVE,
  HISTORICAL_ARCHIVE_MESSAGE,
  getInstanceMode,
  isHistoricalMode,
} from "./archive";

describe("archivo histórico de la Expo Educativa 2026", () => {
  it("mantiene cerrados el registro y el reinicio, sin bloquear la exportación privada en modo histórico", () => {
    expect(getInstanceMode()).toBe("historical");
    expect(isHistoricalMode()).toBe(true);
    expect(HISTORICAL_ARCHIVE.enabled).toBe(true);
    expect(HISTORICAL_ARCHIVE.allowNewAssessments).toBe(false);
    expect(HISTORICAL_ARCHIVE.allowReset).toBe(false);
    expect(HISTORICAL_ARCHIVE.allowPrivateExport).toBe(true);
    expect(HISTORICAL_ARCHIVE.statusLabel).toContain("cerrado");
    expect(HISTORICAL_ARCHIVE_MESSAGE).toContain("cerrada");
  });

  it("opera por defecto o explícitamente en modo permanente permitiendo nuevas evaluaciones", () => {
    delete process.env.INSTANCE_MODE;
    delete process.env.VITE_INSTANCE_MODE;
    expect(getInstanceMode()).toBe("permanent");
    expect(isHistoricalMode()).toBe(false);
    expect(HISTORICAL_ARCHIVE.enabled).toBe(false);
    expect(HISTORICAL_ARCHIVE.allowNewAssessments).toBe(true);
    expect(HISTORICAL_ARCHIVE.allowReset).toBe(true);
    expect(HISTORICAL_ARCHIVE.statusLabel).toContain("permanente");

    process.env.INSTANCE_MODE = "permanent";
    expect(getInstanceMode()).toBe("permanent");
    expect(isHistoricalMode()).toBe(false);
    expect(HISTORICAL_ARCHIVE.enabled).toBe(false);
    expect(HISTORICAL_ARCHIVE.allowNewAssessments).toBe(true);
  });
});
