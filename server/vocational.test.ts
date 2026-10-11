import { describe, expect, it } from "vitest";
import { CATALOG_VERSION, getAnchorScores, getInterestProfile, hasScorableSignal, INTEREST_KEYS, LEGACY_CATALOG_VERSION, LEGACY_PROGRAM_NAMES, NEUTRAL_RESPONSE_LABEL, OPTION_ANCHORS, PROGRAMS, QUESTIONS, PROGRAM_NAMES, RETIRED_PROGRAM, scoreSelections } from "../shared/vocational";
import { calculateAnalytics } from "./routers";

describe("motor vocacional", () => {
  it("incluye las 18 tecnicaturas oficiales, conserva el catálogo legado y mantiene catorce preguntas situacionales", () => {
    expect(PROGRAM_NAMES).toHaveLength(18);
    expect(LEGACY_PROGRAM_NAMES).toHaveLength(19);
    expect(PROGRAM_NAMES).not.toContain(RETIRED_PROGRAM);
    expect(QUESTIONS).toHaveLength(14);
    expect(QUESTIONS.filter((question) => !question.institutional)).toHaveLength(13);
    expect(QUESTIONS.map((question) => question.mode)).toEqual(expect.arrayContaining(["choice", "binary", "preference"]));
    expect(QUESTIONS.some((question) => question.mode === "slider")).toBe(false);
    expect(QUESTIONS.every((question) => question.options.every((option) => INTEREST_KEYS.every((key) => Number.isFinite(option.interests[key]))))).toBeTruthy();
    expect(PROGRAM_NAMES.every((program) => INTEREST_KEYS.every((key) => Number.isFinite(PROGRAMS[program].interests[key])))).toBeTruthy();
    expect(PROGRAM_NAMES.every((program) => PROGRAMS[program].subjects.length >= 3)).toBeTruthy();
    expect(PROGRAM_NAMES.every((program) => PROGRAMS[program].tasks.length >= 3 && PROGRAMS[program].graduateRole.length > 90)).toBeTruthy();
    expect(PROGRAM_NAMES.every((program) => PROGRAMS[program].professionalProfile.length > 300 && PROGRAMS[program].subjects.every((subject) => PROGRAMS[program].professionalProfile.includes(subject)) && PROGRAMS[program].tasks.every((task) => PROGRAMS[program].professionalProfile.includes(task)))).toBeTruthy();
    expect(QUESTIONS.filter((question) => !question.institutional).every((question) => Object.keys(OPTION_ANCHORS[question.id]).length === question.options.length - 1)).toBeTruthy();
    expect(QUESTIONS.at(-1)?.institutional).toBe(true);
    expect(PROGRAM_NAMES.every((program) => Object.values(OPTION_ANCHORS).flatMap((options) => Object.values(options).flat()).includes(program))).toBeTruthy();
    expect(Object.values(OPTION_ANCHORS).flatMap((options) => Object.values(options).flat()).every((program) => PROGRAM_NAMES.includes(program))).toBeTruthy();
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

  it("devuelve un ranking completo sin omitir carreras", () => {
    const scores = scoreSelections(Array(QUESTIONS.length).fill(0));
    expect(scores).toHaveLength(18);
    expect(new Set(scores.map((item) => item.program)).size).toBe(18);
  });

  it("normaliza las señales específicas para no favorecer carreras por cantidad de apariciones", () => {
    const anchors = getAnchorScores(Array(QUESTIONS.length).fill(0));
    expect(Object.values(anchors).every((score) => score >= 0 && score <= 100)).toBeTruthy();
    expect(anchors["TS en Enfermería"]).toBeGreaterThan(0);
    expect(PROGRAM_NAMES.every((program) => Object.values(OPTION_ANCHORS).flatMap((options) => Object.values(options).flat()).filter((candidate) => candidate === program).length >= 2)).toBeTruthy();
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

  it("calcula KPIs, ranking y distribuciones de analítica", () => {
    const rows = [
      { id: 1, firstName: "Ana", lastName: "Pérez", age: 17, sex: "Femenino", locality: "San Salvador de Jujuy", educationStatus: "Secundario: último año", discoverySource: "Código QR del stand", dataConsent: true, resultProgram: "TS en Desarrollo de Software", resultArea: "Tecnología e Innovación", selections: [], scoreSnapshot: [{ program: "TS en Desarrollo de Software", score: 90, area: "Tecnología e Innovación" }, { program: "TS en Ciencias de Datos e Inteligencia Artificial", score: 83, area: "Tecnología e Innovación" }, { program: "TS en Estadísticas de Salud", score: 76, area: "Salud y Bienestar" }], catalogVersion: LEGACY_CATALOG_VERSION, createdAt: new Date() },
      { id: 2, firstName: "Luis", lastName: "Gómez", age: 21, sex: "Masculino", locality: "Palpalá", educationStatus: "Egresé del secundario", discoverySource: "En el stand de Expo Educativa", dataConsent: true, resultProgram: "TS en Desarrollo de Software", resultArea: "Tecnología e Innovación", selections: [], scoreSnapshot: [{ program: "TS en Desarrollo de Software", score: 91, area: "Tecnología e Innovación" }, { program: "TS en Ciencias de Datos e Inteligencia Artificial", score: 82, area: "Tecnología e Innovación" }, { program: "TS en Enfermería", score: 75, area: "Salud y Bienestar" }], catalogVersion: LEGACY_CATALOG_VERSION, createdAt: new Date() },
      { id: 3, firstName: "Sol", lastName: "Díaz", age: 37, sex: "Femenino", locality: "San Salvador de Jujuy", educationStatus: "Estudio o trabajo actualmente", discoverySource: "Código QR del stand", dataConsent: true, resultProgram: "TS en Enfermería", resultArea: "Salud y Bienestar", selections: [], scoreSnapshot: [{ program: "TS en Enfermería", score: 92, area: "Salud y Bienestar" }, { program: "TS en Ciencias de Datos e Inteligencia Artificial", score: 81, area: "Tecnología e Innovación" }, { program: "TS en Desarrollo de Software", score: 74, area: "Tecnología e Innovación" }], catalogVersion: CATALOG_VERSION, createdAt: new Date() },
    ] as any;
    const analytics = calculateAnalytics(rows);

    expect(analytics.totalAll).toBe(3);
    expect(analytics.total).toBe(1);
    expect(analytics.averageAge).toBe(37);
    expect(analytics.catalogViews).toHaveLength(3);
    expect(analytics.catalogViews.find((view) => view.version === LEGACY_CATALOG_VERSION)).toMatchObject({ total: 2, programCount: 19 });
    expect(analytics.catalogViews.find((view) => view.version === CATALOG_VERSION)).toMatchObject({ total: 1, programCount: 18, topProgram: { program: "TS en Enfermería", count: 1 } });
    expect(analytics.catalogViews.find((view) => view.version === LEGACY_CATALOG_VERSION)?.localityDistribution).toEqual([]);
    expect(analytics.catalogViews.find((view) => view.version === "2026.08-historico-consolidado")).toMatchObject({ total: 3, programCount: 19, isConsolidated: true, topProgram: { program: "TS en Desarrollo de Software", count: 2 }, localityDistribution: [] });
  });
});
