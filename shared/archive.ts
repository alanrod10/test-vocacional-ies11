/**
 * Estado de preservación de la instancia de la Expo Educativa 2026.
 * Este valor debe permanecer activo en el proyecto histórico. Las futuras
 * mejoras deberán iniciarse desde una copia con otra base de datos y dominio.
 */
export const HISTORICAL_ARCHIVE = {
  enabled: true,
  event: "Expo Educativa 2026 · IES N.° 11, Jujuy",
  statusLabel: "Archivo histórico cerrado",
  allowNewAssessments: false,
  allowReset: false,
  allowPrivateExport: true,
} as const;

export const HISTORICAL_ARCHIVE_MESSAGE = "Esta versión histórica de la Expo Educativa 2026 está cerrada y ya no recibe nuevas respuestas.";
