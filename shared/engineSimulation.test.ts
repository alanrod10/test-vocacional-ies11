import { describe, expect, it } from "vitest";
import {
  ACTIVE_PROGRAM_NAMES,
  CANDIDATE_V2_PROGRAM_IDS,
  CANDIDATE_V2_PROGRAM_NAMES,
  CANDIDATE_V2_PROGRAMS,
  getAnchorScores,
  getInterestProfile,
  hasScorableSignal,
  hasScorableSignalV2,
  INTEREST_KEYS,
  PROGRAM_NAMES,
  QUESTIONS,
  QUESTIONS_V2,
  scoreSelections,
  scoreSelectionsV2,
} from "./vocational";
import { runEngineSimulation } from "../scripts/simulateEngine";

describe("Laboratorio del Motor: Pruebas Sintéticas y Simulaciones (Sección 12.3)", () => {
  describe("1. Respuestas en Línea Recta", () => {
    it("línea recta Opción 0 (siempre la primera alternativa no-neutral) favorece Agente Sanitario / Gerontología", () => {
      const lineA = QUESTIONS.map(() => 0);
      const scores = scoreSelections(lineA);

      expect(hasScorableSignal(lineA)).toBe(true);
      expect(scores).toHaveLength(18);
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
      expect(scores[0].program).toBe("TS en Gestión de Energía Renovable");
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
      expect(simulation.expectedPercentage).toBeCloseTo(5.56, 1);

      // Se registran empates exactos en primer puesto
      expect(simulation.exactTiesCount).toBeGreaterThan(40);
      expect(simulation.exactTiesPercentage).toBeGreaterThan(4);
      expect(simulation.exactTiesPercentage).toBeLessThan(10);

      // Todas las 18 carreras activas son evaluadas
      expect(simulation.programs).toHaveLength(18);

      // Verificación de que Asistencia Odontológica y Gestión de Energía Renovable lideran la sobrerrepresentación
      const topProgram = simulation.programs[0];
      expect(["TS en Asistencia Odontológica", "TS en Gestión de Energía Renovable"]).toContain(topProgram.name);
      expect(topProgram.top1Ratio).toBeGreaterThan(1.8);

      // Verificación de que Gerontología se encuentra en la base de la distribución (bloqueo estructural)
      const lastProgram = simulation.programs.at(-1)!;
      expect(lastProgram.name).toBe("TS en Gerontología");
      expect(lastProgram.top1Ratio).toBeLessThan(0.3);
    });
  });

  describe("5. Instrumento v2 y Pruebas de Paridad de Acompañamiento Terapéutico (36 Ítems, 18 Carreras)", () => {
    it("valida la estructura balanceada de QUESTIONS_V2 (36 ítems, exactamente 6 por dimensión RIASEC)", () => {
      expect(QUESTIONS_V2).toHaveLength(36);

      INTEREST_KEYS.forEach((key) => {
        const questionsInDim = QUESTIONS_V2.filter((q) => q.options[0].interests[key] === 1);
        expect(questionsInDim).toHaveLength(6);
      });

      // Validar opciones estandarizadas: opt_like (+1), opt_neutral (0), opt_dislike (0)
      QUESTIONS_V2.forEach((q) => {
        expect(q.options).toHaveLength(3);
        expect(q.options[0].id).toBe("opt_like");
        expect(q.options[1].id).toBe("opt_neutral");
        expect(q.options[1].neutral).toBe(true);
        expect(q.options[2].id).toBe("opt_dislike");
      });
    });

    it("valida el modelado fundamentado de TS en Acompañante Terapéutico y su integración oficial", () => {
      const atCandidate = CANDIDATE_V2_PROGRAMS.find((p) => p.id === "ts_acompanamiento_terapeutico");
      expect(atCandidate).toBeDefined();
      expect(atCandidate?.name).toBe("TS en Acompañante Terapéutico");
      expect(atCandidate?.status).toBe("activa");
      expect(atCandidate?.area).toBe("Salud y Bienestar");
      expect(atCandidate?.interests).toEqual({ R: 1, I: 3, A: 2, S: 5, E: 1, C: 2 });
      expect(atCandidate?.subjects.length).toBeGreaterThanOrEqual(3);
      expect(atCandidate?.tasks.length).toBeGreaterThanOrEqual(3);

      // Integración: figura en las 18 carreras públicas activas de producción
      expect(ACTIVE_PROGRAM_NAMES).toContain("TS en Acompañante Terapéutico");
      expect(ACTIVE_PROGRAM_NAMES).toHaveLength(18);
      expect(CANDIDATE_V2_PROGRAM_NAMES).toHaveLength(18);
    });

    it("evalúa casos de control y detección de señal en el Motor v2", () => {
      // Todo neutral: sin señal puntuable
      const allNeutral = QUESTIONS_V2.map(() => 1); // opt_neutral está en índice 1
      expect(hasScorableSignalV2(allNeutral)).toBe(false);

      // Respuesta enfocada en Social (q_s1 a q_s6 como like, resto neutral)
      const socialMap: Record<string, string> = {};
      QUESTIONS_V2.forEach((q) => {
        socialMap[q.id] = q.id.startsWith("q_s") ? "opt_like" : "opt_neutral";
      });

      expect(hasScorableSignalV2(socialMap)).toBe(true);
      const socialRanking = scoreSelectionsV2(socialMap);
      expect(socialRanking).toHaveLength(18);

      // Las carreras del área Salud y Bienestar / altas en Social deben liderar
      const top3 = socialRanking.slice(0, 3).map((r) => r.id);
      expect(top3.some((id) => ["ts_enfermeria", "ts_gerontologia", "ts_acompanamiento_terapeutico", "ts_agente_sanitario"].includes(id))).toBe(true);
    });

    it("simulación de Monte Carlo (N = 10.000) demuestra paridad del Top 1 y erradicación del colapso estructural", () => {
      let seed = 12345;
      function random() {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
      }

      const N = 10000;
      const totalPrograms = CANDIDATE_V2_PROGRAM_NAMES.length; // 18
      const expectedPercentage = 100 / totalPrograms; // 5.555...%

      const top1Counts: Record<string, number> = Object.fromEntries(CANDIDATE_V2_PROGRAM_NAMES.map((name) => [name, 0]));
      const top3Counts: Record<string, number> = Object.fromEntries(CANDIDATE_V2_PROGRAM_NAMES.map((name) => [name, 0]));
      let exactTies = 0;

      for (let i = 0; i < N; i++) {
        const selections: Record<string, string> = {};
        QUESTIONS_V2.forEach((q) => {
          const optIdx = Math.floor(random() * q.options.length);
          selections[q.id] = q.options[optIdx].id;
        });

        const ranking = scoreSelectionsV2(selections);
        if (ranking.length >= 2 && ranking[0].score === ranking[1].score) {
          exactTies++;
        }

        top1Counts[ranking[0].program]++;
        ranking.slice(0, 3).forEach((item) => {
          top3Counts[item.program]++;
        });
      }

      // Imprimir tabla de paridad en consola
      console.log("\n=========================================================================================");
      console.log("TABLA DE PARIDAD VOCACIONAL - MOTOR V2 (36 ÍTEMS, 18 CARRERAS INCLUYENDO A.T.)");
      console.log(`Simulación Monte Carlo N = ${N.toLocaleString()} iteraciones sintéticas aleatorias uniformes`);
      console.log(`Porcentaje esperado uniforme (1/18): ${expectedPercentage.toFixed(2)}%`);
      console.log("-----------------------------------------------------------------------------------------");
      console.log(
        "Programa".padEnd(46) +
        "Top 1".padStart(7) +
        "Top 1 %".padStart(9) +
        "Top 3 %".padStart(9) +
        "Ratio".padStart(7)
      );
      console.log("-----------------------------------------------------------------------------------------");

      const rows = CANDIDATE_V2_PROGRAM_NAMES.map((name) => {
        const c1 = top1Counts[name];
        const p1 = (c1 / N) * 100;
        const p3 = (top3Counts[name] / N) * 100;
        const ratio = p1 / expectedPercentage;
        return { name, c1, p1, p3, ratio };
      }).sort((a, b) => b.c1 - a.c1);

      rows.forEach((row) => {
        console.log(
          row.name.padEnd(46) +
          String(row.c1).padStart(7) +
          (row.p1.toFixed(2) + "%").padStart(9) +
          (row.p3.toFixed(2) + "%").padStart(9) +
          row.ratio.toFixed(2).padStart(7)
        );
      });
      console.log("-----------------------------------------------------------------------------------------");
      console.log(`Empates exactos en 1.er puesto: ${exactTies} (${((exactTies / N) * 100).toFixed(2)}%)`);
      console.log("=========================================================================================\n");

      // Verificaciones clave:
      // 1. Las 18 carreras reciben asignaciones en Top 1 (cero carreras con 0% de representación)
      CANDIDATE_V2_PROGRAM_NAMES.forEach((name) => {
        expect(top1Counts[name]).toBeGreaterThan(0);
      });

      // 2. Erradicación del monopolio: ninguna carrera supera el 25% (en AG-21 Alimentos acaparaba 44.5%)
      const maxTop1Pct = (rows[0].c1 / N) * 100;
      expect(maxTop1Pct).toBeLessThan(25);

      // 3. A.T. (TS en Acompañante Terapéutico) tiene un desempeño saludable y competitivo
      const atTop1 = top1Counts["TS en Acompañante Terapéutico"];
      expect(atTop1).toBeGreaterThan(500);
    }, 30000);
  });
});
