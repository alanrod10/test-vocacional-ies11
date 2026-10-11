/**
 * Control de modo de instancia y preservación histórica.
 *
 * Permite alternar entre:
 * - 'historical': Preserva el cierre de la Expo Educativa 2026 (solo lectura y estadísticas).
 * - 'permanent': Modo institucional permanente (permite nuevas evaluaciones vocacionales).
 *
 * El modo se determina evaluando las variables de entorno:
 * - INSTANCE_MODE (o VITE_INSTANCE_MODE): 'historical' | 'permanent'
 * - HISTORICAL_ARCHIVE_ENABLED: 'true' | 'false' (compatibilidad booleana)
 *
 * Por defecto, opera en modo 'permanent' (allowNewAssessments: true).
 */

export type InstanceMode = "historical" | "permanent";

function resolveInstanceMode(): InstanceMode {
  // 1. Evaluar variables en entorno Node.js / servidor / vitest
  if (typeof process !== "undefined" && process?.env) {
    const rawMode = process.env.INSTANCE_MODE ?? process.env.VITE_INSTANCE_MODE;
    if (rawMode) {
      return rawMode.trim().toLowerCase() === "historical" ? "historical" : "permanent";
    }

    if (process.env.HISTORICAL_ARCHIVE_ENABLED !== undefined) {
      const boolVal = process.env.HISTORICAL_ARCHIVE_ENABLED.trim().toLowerCase();
      if (boolVal === "true" || boolVal === "1") return "historical";
      if (boolVal === "false" || boolVal === "0") return "permanent";
    }
  }

  // 2. Evaluar variables en entorno cliente Vite (import.meta.env)
  try {
    // @ts-ignore
    if (typeof import.meta !== "undefined" && import.meta?.env) {
      // @ts-ignore
      const rawMetaMode = import.meta.env.VITE_INSTANCE_MODE ?? import.meta.env.INSTANCE_MODE;
      if (rawMetaMode) {
        return String(rawMetaMode).trim().toLowerCase() === "historical" ? "historical" : "permanent";
      }

      // @ts-ignore
      if (import.meta.env.VITE_HISTORICAL_ARCHIVE_ENABLED !== undefined) {
        // @ts-ignore
        const boolVal = String(import.meta.env.VITE_HISTORICAL_ARCHIVE_ENABLED).trim().toLowerCase();
        if (boolVal === "true" || boolVal === "1") return "historical";
        if (boolVal === "false" || boolVal === "0") return "permanent";
      }
    }
  } catch {
    // Entorno sin import.meta
  }

  // Por defecto opera en modo permanente
  return "permanent";
}

export function getInstanceMode(): InstanceMode {
  return resolveInstanceMode();
}

export function isHistoricalMode(): boolean {
  return resolveInstanceMode() === "historical";
}

export const HISTORICAL_ARCHIVE = {
  get enabled(): boolean {
    return isHistoricalMode();
  },
  get event(): string {
    return isHistoricalMode()
      ? "Expo Educativa 2026 · IES N.° 11, Jujuy"
      : "Test Vocacional Institucional · IES N.° 11, Jujuy";
  },
  get statusLabel(): string {
    return isHistoricalMode()
      ? "Archivo histórico cerrado"
      : "Instancia permanente activa";
  },
  get allowNewAssessments(): boolean {
    return !isHistoricalMode();
  },
  get allowReset(): boolean {
    return !isHistoricalMode();
  },
  get allowPrivateExport(): boolean {
    return true;
  },
};

export const HISTORICAL_ARCHIVE_MESSAGE =
  "Esta versión histórica de la Expo Educativa 2026 está cerrada y ya no recibe nuevas respuestas.";
