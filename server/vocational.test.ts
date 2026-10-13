import { describe, expect, it } from "vitest";
import {
  ACTIVE_PROGRAM_IDS,
  ACTIVE_PROGRAM_NAMES,
  CATALOG_VERSION,
  ENGINE_VERSION,
  EXPO_CATALOG_VERSION,
  getAnchorScores,
  getInterestProfile,
  hasScorableSignal,
  INTEREST_KEYS,
  LEGACY_CATALOG_VERSION,
  LEGACY_PROGRAM_NAMES,
  NEUTRAL_RESPONSE_LABEL,
  normalizeSelections,
  OPTION_ANCHORS,
  PROGRAM_CATALOG,
  PROGRAM_NAMES,
  PROGRAMS,
  QUESTIONS,
  RETIRED_PROGRAM,
  RETIRED_PROGRAMS,
  scoreSelections,
  selectionsToIndices,
} from "../shared/vocational";
import { calculateAnalytics } from "./routers";

describe("motor vocacional", () => {
  it("incluye las 18 tecnicaturas activas oficiales, conserva el catálogo versionado (20 TS) y preguntas con IDs estables", () => {
    expect(PROGRAM_NAMES).toHaveLength(18);
    expect(ACTIVE_PROGRAM_NAMES).toHaveLength(18);
    expect(LEGACY_PROGRAM_NAMES).toHaveLength(18);
    expect(PROGRAM_CATALOG).toHaveLength(20);

    // Estados de catálogo
    expect(PROGRAM_CATALOG.filter((p) => p.status === "activa")).toHaveLength(18);
    expect(PROGRAM_CATALOG.filter((p) => p.status === "retirada")).toHaveLength(2);

    // Verificación de carreras específicas con estado
    expect(PROGRAM_CATALOG.find((p) => p.id === "ts_guia_turismo")?.status).toBe("retirada");
    expect(PROGRAM_CATALOG.find((p) => p.id === "ts_museologia_gestion_patrimonial")?.status).toBe("retirada");
    expect(PROGRAM_CATALOG.find((p) => p.id === "ts_acompanamiento_terapeutico")?.status).toBe("activa");

    // Carreras retiradas no compiten en el catálogo activo
    expect(PROGRAM_NAMES).not.toContain("TS en Guía de Turismo");
    expect(PROGRAM_NAMES).not.toContain("TS en Museología y Gestión Patrimonial");
    expect(PROGRAM_NAMES).toContain("TS en Acompañante Terapéutico");

    // IDs estables en preguntas y opciones
    expect(QUESTIONS).toHaveLength(14);
    expect(QUESTIONS.every((q) => typeof q.id === "string" && q.id.startsWith("q_"))).toBe(true);
    expect(QUESTIONS.every((q) => q.options.every((opt) => typeof opt.id === "string" && opt.id.startsWith("opt_")))).toBe(true);
    expect(QUESTIONS.filter((q) => !q.institutional)).toHaveLength(13);
    expect(QUESTIONS.every((q) => q.options.some((opt) => opt.id === "opt_neutral"))).toBe(true);

    // Perfiles y detalles de carreras activas
    expect(PROGRAM_NAMES.every((program) => INTEREST_KEYS.every((key) => Number.isFinite(PROGRAMS[program].interests[key])))).toBeTruthy();
    expect(PROGRAM_NAMES.every((program) => PROGRAMS[program].subjects.length >= 3)).toBeTruthy();
    expect(PROGRAM_NAMES.every((program) => PROGRAMS[program].tasks.length >= 3 && PROGRAMS[program].graduateRole.length > 90)).toBeTruthy();
    expect(PROGRAM_NAMES.every((program) => PROGRAMS[program].professionalProfile.length > 300 && PROGRAMS[program].subjects.every((subject) => PROGRAMS[program].professionalProfile.includes(subject)) && PROGRAMS[program].tasks.every((task) => PROGRAMS[program].professionalProfile.includes(task)))).toBeTruthy();

    // OPTION_ANCHORS mapea optionId -> programId[]
    expect(QUESTIONS.filter((q) => !q.institutional).every((q) => q.options.filter((opt) => !opt.neutral).every((opt) => (OPTION_ANCHORS[opt.id]?.length ?? 0) > 0))).toBe(true);
    expect(ACTIVE_PROGRAM_IDS.every((pId) => Object.values(OPTION_ANCHORS).flat().includes(pId))).toBe(true);
    expect(QUESTIONS.at(-1)?.institutional).toBe(true);
  });

  it("retrocompatibilidad: traduce array de índices posicionales a IDs estables y produce idénticos puntajes", () => {
    const legacyArray = [1, 1, 2, 0, 1, 0, 3, 3, 1, 1, 1, 1, 7, 0];
    const normalized = normalizeSelections(legacyArray);

    expect(typeof normalized).toBe("object");
    expect(normalized.q_proposal).toBe("opt_prototype");
    expect(normalized.q_direct_support).toBe("opt_technical");
    expect(normalized.q_institutional_intent).toBe("opt_enroll_interest");

    // Invertir a índices para retrocompatibilidad con exportaciones y storage legacy
    const recoveredIndices = selectionsToIndices(normalized);
    expect(recoveredIndices).toEqual(legacyArray);

    // El cálculo con array legacy y con objeto normalized debe ser idéntico
    const scoresFromArray = scoreSelections(legacyArray);
    const scoresFromNormalized = scoreSelections(normalized);
    expect(scoresFromArray).toEqual(scoresFromNormalized);

    // Top 3 debe ser exactamente el mismo para la línea base
    expect(scoresFromArray.slice(0, 3)).toEqual(scoresFromNormalized.slice(0, 3));
    expect(scoresFromArray[0].program).toMatch(/Desarrollo de Software|Ciencias de Datos/);
    expect(scoresFromArray[0].score).toBeGreaterThan(0);
  });

  it("prioriza tecnología para respuestas digitales coherentes", () => {
    const scores = scoreSelections([1, 1, 2, 0, 1, 0, 3, 3, 1, 1, 1, 1, 7, 0]);
    expect(scores[0].program).toMatch(/Desarrollo de Software|Ciencias de Datos/);
    expect(scores[0].score).toBeGreaterThan(0);
  });

  it("distingue una afinidad de datos de una afinidad de cuidado comunitario", () => {
    const data = scoreSelections([2, 1, 1, 0, 0, 0, 3, 3, 3, 1, 1, 0, 7, 0]);
    const community = scoreSelections([3, 0, 0, 3, 3, 2, 1, 2, 3, 2, 0, 3, 0, 0]);

    expect(data[0].program).toMatch(/Ciencias de Datos|Estadísticas de Salud/);
    expect(community[0].program).toMatch(/Agente Sanitario|Enfermería|Gerontología/);
    expect(data[0].program).not.toBe(community[0].program);
  });

  it("devuelve un ranking completo de las 18 carreras activas sin omitir ninguna", () => {
    const scores = scoreSelections(Array(QUESTIONS.length).fill(0));
    expect(scores).toHaveLength(18);
    expect(new Set(scores.map((item) => item.program)).size).toBe(18);
    expect(scores.some((item) => item.program === "TS en Guía de Turismo")).toBe(false);
    expect(scores.some((item) => item.program === "TS en Museología y Gestión Patrimonial")).toBe(false);
    expect(scores.some((item) => item.program === "TS en Acompañante Terapéutico")).toBe(true);
  });

  it("normaliza las señales específicas para no favorecer carreras por cantidad de apariciones", () => {
    const anchors = getAnchorScores(Array(QUESTIONS.length).fill(0));
    expect(Object.values(anchors).every((score) => score >= 0 && score <= 100)).toBeTruthy();
    expect(anchors["TS en Enfermería"]).toBeGreaterThan(0);
    expect(anchors["ts_enfermeria"]).toBeGreaterThan(0);
    expect(ACTIVE_PROGRAM_IDS.every((pId) => Object.values(OPTION_ANCHORS).flat().filter((candidate) => candidate === pId).length >= 2)).toBeTruthy();
  });

  it("mantiene la pregunta final institucional fuera del cálculo de afinidad", () => {
    const firstOption = scoreSelections([...Array(QUESTIONS.length - 1).fill(0), 0]);
    const neutralOption = scoreSelections([...Array(QUESTIONS.length - 1).fill(0), QUESTIONS.at(-1)!.options.length - 1]);
    expect(neutralOption).toEqual(firstOption);
  });

  it("ofrece una alternativa neutral que no agrega señales ni anclajes de afinidad", () => {
    const neutralSelections = QUESTIONS.map((question) => question.options.findIndex((option) => option.neutral));
    expect(QUESTIONS.filter((question) => !question.institutional).every((question) => question.options.at(-1)?.label === NEUTRAL_RESPONSE_LABEL && question.options.at(-1)?.neutral)).toBeTruthy();
    expect(Object.values(getInterestProfile(neutralSelections)).every((value) => value === 0)).toBeTruthy();
    expect(Object.values(getAnchorScores(neutralSelections)).every((value) => value === 0)).toBeTruthy();
    expect(hasScorableSignal(neutralSelections)).toBe(false);
    expect(hasScorableSignal([...neutralSelections.slice(0, 1), 0, ...neutralSelections.slice(2)])).toBe(true);
  });

  it("calcula KPIs, ranking y distribuciones de analítica para el catálogo oficial", () => {
    const rows = [
      { id: 1, firstName: "Ana", lastName: "Pérez", age: 17, sex: "Femenino", locality: "San Salvador de Jujuy", educationStatus: "Secundario: último año", studyIntent: "Sí, definitivamente", dataConsent: true, resultProgram: "TS en Desarrollo de Software", resultArea: "Tecnología e Innovación", selections: [], scoreSnapshot: [{ program: "TS en Desarrollo de Software", score: 90, area: "Tecnología e Innovación" }, { program: "TS en Ciencia de Datos e Inteligencia Artificial", score: 83, area: "Tecnología e Innovación" }, { program: "TS en Estadística de Salud", score: 76, area: "Salud y Bienestar" }], catalogVersion: CATALOG_VERSION, createdAt: new Date() },
      { id: 2, firstName: "Luis", lastName: "Gómez", age: 21, sex: "Masculino", locality: "Palpalá", educationStatus: "Egresé del secundario", studyIntent: "Sí, probablemente", dataConsent: true, resultProgram: "TS en Desarrollo de Software", resultArea: "Tecnología e Innovación", selections: [], scoreSnapshot: [{ program: "TS en Desarrollo de Software", score: 91, area: "Tecnología e Innovación" }, { program: "TS en Ciencia de Datos e Inteligencia Artificial", score: 82, area: "Tecnología e Innovación" }, { program: "TS en Enfermería", score: 75, area: "Salud y Bienestar" }], catalogVersion: CATALOG_VERSION, createdAt: new Date() },
      { id: 3, firstName: "Sol", lastName: "Díaz", age: 37, sex: "Femenino", locality: "San Salvador de Jujuy", educationStatus: "Estudio o trabajo actualmente", studyIntent: "Aún no lo decido", dataConsent: true, resultProgram: "TS en Enfermería", resultArea: "Salud y Bienestar", selections: [], scoreSnapshot: [{ program: "TS en Enfermería", score: 92, area: "Salud y Bienestar" }, { program: "TS en Ciencia de Datos e Inteligencia Artificial", score: 81, area: "Tecnología e Innovación" }, { program: "TS en Desarrollo de Software", score: 74, area: "Tecnología e Innovación" }], catalogVersion: CATALOG_VERSION, createdAt: new Date() },
    ] as any;
    const analytics = calculateAnalytics(rows);

    expect(analytics.totalAll).toBe(3);
    expect(analytics.total).toBe(3);
    expect(analytics.averageAge).toBe(25);
    expect(analytics.catalogViews).toHaveLength(1);
    expect(analytics.catalogViews[0]).toMatchObject({ total: 3, programCount: 18, topProgram: { program: "TS en Desarrollo de Software", count: 2 } });
  });
});
