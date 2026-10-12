import { describe, expect, it } from "vitest";
import {
  ACTIVE_PROGRAM_NAMES,
  getAnchorScores,
  getInterestProfile,
  hasScorableSignal,
  PROGRAM_NAMES,
  QUESTIONS,
  scoreSelections,
} from "./vocational";
import { runEngineSimulation } from "../scripts/simulateEngine";

describe("Laboratorio del Motor: Pruebas Sintéticas y Simulaciones (Sección 12.3)", () => {
  describe("1. Respuestas en Línea Recta", () => {
    it("línea recta Opción 0 (siempre la primera alternativa no-neutral) favorece Agente Sanitario / Gerontología", () => {
      const lineA = QUESTIONS.map(() => 0);
      const scores = scoreSelections(lineA);

      expect(hasScorableSignal(lineA)).toBe(true);
      expect(scores).toHaveLength(17);
      // Con todas las opciones 0, gana Agente Sanitario con 72 puntos, empatado con Gerontología en puntaje
      expect(scores[0].program).toBe("TS en Agente Sanitario y Promotor de la Salud");
      expect(scores[0].score).toBe(72);
      expect(scores[1].program).toBe("TS en Gerontología");
      expect(scores[1].score).toBe(72);
      expect(scores[0].area).toBe("Salud y Bienestar");
    });

    it("línea recta Opción 1 (siempre la segunda alternativa no-neutral) favorece Gestión de Energías Renovables", () => {
      const nonNeutralQuestions = QUESTIONS.filter((q) => !q.institutional);
      const lineB: Record<string, string> = {};
      nonNeutralQuestions.forEach((q) => {
        const nonNeutral = q.options.filter((opt) => !opt.neutral);
        lineB[q.id] = (nonNeutral[1] ?? nonNeutral[0]).id;
      });

      const scores = scoreSelections(lineB);
      expect(scores[0].program).toBe("TS en Gestión de Energías Renovables");
      expect(scores[0].score).toBe(82);
      expect(scores[0].area).toBe("Industria, Ambiente y Seguridad");
    });

    it("línea recta Opción 2 favorece Tecnología de los Alimentos", () => {
      const nonNeutralQuestions = QUESTIONS.filter((q) => !q.institutional);
      const lineC: Record<string, string> = {};
      nonNeutralQuestions.forEach((q) => {
        const nonNeutral = q.options.filter((opt) => !opt.neutral);
        lineC[q.id] = (nonNeutral[2] ?? nonNeutral.at(-1)!).id;
      });

      const scores = scoreSelections(lineC);
      expect(scores[0].program).toBe("TS en Tecnología de los Alimentos");
      expect(scores[0].score).toBe(72);
      expect(scores[0].area).toBe("Industria, Ambiente y Seguridad");
    });

    it("línea recta Opción 3 favorece Cocinas Regionales y Cultura Alimentaria", () => {
      const nonNeutralQuestions = QUESTIONS.filter((q) => !q.institutional);
      const lineD: Record<string, string> = {};
      nonNeutralQuestions.forEach((q) => {
        const nonNeutral = q.options.filter((opt) => !opt.neutral);
        lineD[q.id] = (nonNeutral[3] ?? nonNeutral.at(-1)!).id;
      });

      const scores = scoreSelections(lineD);
      expect(scores[0].program).toBe("TS en Cocinas Regionales y Cultura Alimentaria");
      expect(scores[0].score).toBe(69);
      expect(scores[0].area).toBe("Gastronomía, Turismo y Patrimonio");
    });
  });

  describe("2. Caso Límite: Todo Neutral (Cero Señal)", () => {
    it("13 respuestas neutrales es detectado como sin señal y produce vectores nulos", () => {
      const allNeutral = QUESTIONS.map((q) => q.options.length - 1);

      // Señal no puntuable
      expect(hasScorableSignal(allNeutral)).toBe(false);

      // Perfil RIASEC completamente en cero
      const interestProfile = getInterestProfile(allNeutral);
      expect(Object.values(interestProfile).every((val) => val === 0)).toBe(true);

      // Anclajes en cero
      const anchorScores = getAnchorScores(allNeutral);
      expect(Object.values(anchorScores).every((val) => val === 0)).toBe(true);
    });

    it("respuesta todo neutral con IDs estables también es rechazada correctamente", () => {
      const allNeutralMap: Record<string, string> = {};
      QUESTIONS.forEach((q) => {
        allNeutralMap[q.id] = "opt_neutral";
      });

      expect(hasScorableSignal(allNeutralMap)).toBe(false);
      const interestProfile = getInterestProfile(allNeutralMap);
      expect(Object.values(interestProfile).every((val) => val === 0)).toBe(true);
      const anchors = getAnchorScores(allNeutralMap);
      expect(Object.values(anchors).every((val) => val === 0)).toBe(true);
    });
  });

  describe("3. Estabilidad y Sensibilidad ante Modificación Unitaria", () => {
    it("modificar una sola respuesta (P10) altera localmente los puntajes de forma suave y predecible", () => {
      const baseAnswers = QUESTIONS.map(() => 0);
      const modifiedAnswers = [...baseAnswers];

      // Cambiar P10 (índice 9): de opción 0 (protocolo/registro) a opción 1 (programación/código)
      modifiedAnswers[9] = 1;

      const baseScores = scoreSelections(baseAnswers);
      const modifiedScores = scoreSelections(modifiedAnswers);

      const softwareBase = baseScores.find((p) => p.id === "ts_desarrollo_software")!;
      const softwareMod = modifiedScores.find((p) => p.id === "ts_desarrollo_software")!;

      // Software debe subir su puntaje (+7 puntos por anclaje e interés investigativo)
      expect(softwareMod.score).toBeGreaterThan(softwareBase.score);
      expect(softwareMod.score - softwareBase.score).toBe(7);

      // Gerontología (que estaba empatada en 1.er puesto en base) baja su puntaje al perder el protocolo
      const gerontoBase = baseScores.find((p) => p.id === "ts_gerontologia")!;
      const gerontoMod = modifiedScores.find((p) => p.id === "ts_gerontologia")!;
      expect(gerontoMod.score).toBeLessThan(gerontoBase.score);

      // La carrera ganadora sigue perteneciendo al área de Salud y Bienestar
      expect(modifiedScores[0].program).toBe("TS en Agente Sanitario y Promotor de la Salud");
    });
  });

  describe("4. Simulación de Monte Carlo y Modelo Nulo", () => {
    it("simulación determinista de N = 1.000 confirma presencia de empates y sesgo estructural", () => {
      const simulation = runEngineSimulation(1000, 12345);

      expect(simulation.totalSimulations).toBe(1000);
      expect(simulation.expectedPercentage).toBeCloseTo(5.88, 1);

      // Se registran empates exactos en primer puesto
      expect(simulation.exactTiesCount).toBeGreaterThan(40);
      expect(simulation.exactTiesPercentage).toBeGreaterThan(4);
      expect(simulation.exactTiesPercentage).toBeLessThan(10);

      // Todas las 17 carreras activas son evaluadas
      expect(simulation.programs).toHaveLength(17);

      // Verificación de que Asistente Odontológico y Energías Renovables lideran la sobrerrepresentación
      const topProgram = simulation.programs[0];
      expect(["TS en Asistente Odontológico", "TS en Gestión de Energías Renovables"]).toContain(topProgram.name);
      expect(topProgram.top1Ratio).toBeGreaterThan(1.8);

      // Verificación de que Gerontología se encuentra en la base de la distribución (bloqueo estructural)
      const lastProgram = simulation.programs.at(-1)!;
      expect(lastProgram.name).toBe("TS en Gerontología");
      expect(lastProgram.top1Ratio).toBeLessThan(0.3);
    });
  });
});
