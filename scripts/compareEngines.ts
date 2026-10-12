import {
  ACTIVE_PROGRAMS,
  INTEREST_KEYS,
  InterestVector,
  PROGRAM_BY_NAME,
  PROGRAM_NAMES,
  PROGRAMS,
  QUESTIONS,
  scoreSelections as scoreSelectionsOriginal,
  normalizeSelections,
  getInterestProfile,
} from "../shared/vocational";

const V = (values: Partial<InterestVector>): InterestVector => ({ R: 0, I: 0, A: 0, S: 0, E: 0, C: 0, ...values });

function normalizeVector(vector: InterestVector): InterestVector {
  const total = INTEREST_KEYS.reduce((sum, key) => sum + vector[key], 0) || 1;
  return V(Object.fromEntries(INTEREST_KEYS.map((key) => [key, vector[key] / total])) as Partial<InterestVector>);
}

// 1. Similitud híbrida original (L1 + Coseno): (1 - distance) * 0.6 + cosine * 0.4
function calculateSimilarityHybrid(a: InterestVector, b: InterestVector): number {
  const left = normalizeVector(a);
  const right = normalizeVector(b);
  const distance = INTEREST_KEYS.reduce((sum, key) => sum + Math.abs(left[key] - right[key]), 0) / 2;
  const dot = INTEREST_KEYS.reduce((sum, key) => sum + left[key] * right[key], 0);
  const normA = Math.sqrt(INTEREST_KEYS.reduce((sum, key) => sum + left[key] ** 2, 0));
  const normB = Math.sqrt(INTEREST_KEYS.reduce((sum, key) => sum + right[key] ** 2, 0));
  const cosine = normA && normB ? dot / (normA * normB) : 0;
  return Math.round(Math.max(0, Math.min(100, ((1 - distance) * 0.6 + cosine * 0.4) * 100)));
}

// 2. Similitud Coseno pura
function calculateSimilarityCosine(a: InterestVector, b: InterestVector): number {
  const left = normalizeVector(a);
  const right = normalizeVector(b);
  const dot = INTEREST_KEYS.reduce((sum, key) => sum + left[key] * right[key], 0);
  const normA = Math.sqrt(INTEREST_KEYS.reduce((sum, key) => sum + left[key] ** 2, 0));
  const normB = Math.sqrt(INTEREST_KEYS.reduce((sum, key) => sum + right[key] ** 2, 0));
  const cosine = normA && normB ? dot / (normA * normB) : 0;
  return Math.round(Math.max(0, Math.min(100, cosine * 100)));
}

// Modelo Candidato Alternativa B: 100% Similitud Híbrida L1 + Coseno (Sin Anclajes)
export function scoreSelectionsAltB(selections: Record<string, string> | number[]) {
  const norm = normalizeSelections(selections);
  const interests = getInterestProfile(norm);

  return ACTIVE_PROGRAMS.map((program) => {
    const score = calculateSimilarityHybrid(interests, program.interests);
    return {
      id: program.id,
      program: program.name,
      score,
      area: program.area,
    };
  }).sort((a, b) => b.score - a.score || a.program.localeCompare(b.program));
}

// Modelo Candidato Alternativa B (Coseno Puro sin anclajes)
export function scoreSelectionsAltBCosine(selections: Record<string, string> | number[]) {
  const norm = normalizeSelections(selections);
  const interests = getInterestProfile(norm);

  return ACTIVE_PROGRAMS.map((program) => {
    const score = calculateSimilarityCosine(interests, program.interests);
    return {
      id: program.id,
      program: program.name,
      score,
      area: program.area,
    };
  }).sort((a, b) => b.score - a.score || a.program.localeCompare(b.program));
}

export interface EngineComparisonStats {
  iterations: number;
  expectedPct: number;
  original: {
    exactTies: number;
    exactTiesPct: number;
    top1: Record<string, number>;
    top3: Record<string, number>;
  };
  altB: {
    exactTies: number;
    exactTiesPct: number;
    top1: Record<string, number>;
    top3: Record<string, number>;
  };
  altBCosine: {
    exactTies: number;
    exactTiesPct: number;
    top1: Record<string, number>;
    top3: Record<string, number>;
  };
}

export function runEngineComparison(iterations = 10000, seed?: number): EngineComparisonStats {
  let currentSeed = seed ?? Date.now();
  function random(): number {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    return currentSeed / 233280;
  }

  const activeQuestions = QUESTIONS.filter((q) => !q.institutional);
  const expectedPct = 100 / PROGRAM_NAMES.length;

  const stats: EngineComparisonStats = {
    iterations,
    expectedPct,
    original: {
      exactTies: 0,
      exactTiesPct: 0,
      top1: Object.fromEntries(PROGRAM_NAMES.map((name) => [name, 0])),
      top3: Object.fromEntries(PROGRAM_NAMES.map((name) => [name, 0])),
    },
    altB: {
      exactTies: 0,
      exactTiesPct: 0,
      top1: Object.fromEntries(PROGRAM_NAMES.map((name) => [name, 0])),
      top3: Object.fromEntries(PROGRAM_NAMES.map((name) => [name, 0])),
    },
    altBCosine: {
      exactTies: 0,
      exactTiesPct: 0,
      top1: Object.fromEntries(PROGRAM_NAMES.map((name) => [name, 0])),
      top3: Object.fromEntries(PROGRAM_NAMES.map((name) => [name, 0])),
    },
  };

  for (let i = 0; i < iterations; i++) {
    const selections: Record<string, string> = {};
    activeQuestions.forEach((question) => {
      const nonNeutralOptions = question.options.filter((opt) => !opt.neutral);
      const chosenIndex = Math.floor((seed !== undefined ? random() : Math.random()) * nonNeutralOptions.length);
      selections[question.id] = nonNeutralOptions[chosenIndex].id;
    });

    // 1. Evaluar Modelo Original (55% Similitud + 45% Anclajes)
    const rankOrig = scoreSelectionsOriginal(selections);
    if (rankOrig.length >= 2 && rankOrig[0].score === rankOrig[1].score) stats.original.exactTies++;
    stats.original.top1[rankOrig[0].program]++;
    rankOrig.slice(0, 3).forEach((item) => stats.original.top3[item.program]++);

    // 2. Evaluar Alternativa B (100% Similitud Híbrida L1+Coseno)
    const rankAltB = scoreSelectionsAltB(selections);
    if (rankAltB.length >= 2 && rankAltB[0].score === rankAltB[1].score) stats.altB.exactTies++;
    stats.altB.top1[rankAltB[0].program]++;
    rankAltB.slice(0, 3).forEach((item) => stats.altB.top3[item.program]++);

    // 3. Evaluar Alternativa B2 (100% Coseno Puro)
    const rankAltBCos = scoreSelectionsAltBCosine(selections);
    if (rankAltBCos.length >= 2 && rankAltBCos[0].score === rankAltBCos[1].score) stats.altBCosine.exactTies++;
    stats.altBCosine.top1[rankAltBCos[0].program]++;
    rankAltBCos.slice(0, 3).forEach((item) => stats.altBCosine.top3[item.program]++);
  }

  stats.original.exactTiesPct = (stats.original.exactTies / iterations) * 100;
  stats.altB.exactTiesPct = (stats.altB.exactTies / iterations) * 100;
  stats.altBCosine.exactTiesPct = (stats.altBCosine.exactTies / iterations) * 100;

  return stats;
}

export function formatComparisonReport(stats: EngineComparisonStats): string {
  const lines: string[] = [];
  lines.push("=========================================================================================================");
  lines.push("      BANCO DE PRUEBAS COMPARATIVO SINTÉTICO: MODELO ORIGINAL VS ALTERNATIVA B (N = " + stats.iterations.toLocaleString() + ")");
  lines.push("=========================================================================================================");
  lines.push(`Total de evaluaciones evaluadas : ${stats.iterations.toLocaleString()}`);
  lines.push(`Equidad teórica uniforme (1/17) : ${stats.expectedPct.toFixed(2)}% por carrera`);
  lines.push("---------------------------------------------------------------------------------------------------------");
  lines.push(`Tasa de empates exactos Top 1 vs Top 2:`);
  lines.push(`  - Modelo Original (55/45) : ${stats.original.exactTies.toLocaleString()} (${stats.original.exactTiesPct.toFixed(2)}%)`);
  lines.push(`  - Alternativa B (L1+Coseno): ${stats.altB.exactTies.toLocaleString()} (${stats.altB.exactTiesPct.toFixed(2)}%)`);
  lines.push(`  - Alternativa B (Coseno)   : ${stats.altBCosine.exactTies.toLocaleString()} (${stats.altBCosine.exactTiesPct.toFixed(2)}%)`);
  lines.push("---------------------------------------------------------------------------------------------------------");
  lines.push(
    "| #  | Tecnicatura Superior                       | Top 1 Orig (%) | Top 1 Alt B (%) | Desv Alt B | Ratio Alt B | Top 3 Alt B (%) |",
  );
  lines.push(
    "|----+--------------------------------------------+----------------+-----------------+------------+-------------+-----------------|",
  );

  // Ordenar por Top 1 en Alt B para evidenciar la nueva jerarquía
  const sortedPrograms = [...PROGRAM_NAMES].sort((a, b) => {
    const aCount = stats.altB.top1[a] ?? 0;
    const bCount = stats.altB.top1[b] ?? 0;
    return bCount - aCount || a.localeCompare(b);
  });

  sortedPrograms.forEach((name, idx) => {
    const origPct = ((stats.original.top1[name] ?? 0) / stats.iterations) * 100;
    const altBPct = ((stats.altB.top1[name] ?? 0) / stats.iterations) * 100;
    const desvAltB = altBPct - stats.expectedPct;
    const ratioAltB = altBPct / stats.expectedPct;
    const top3AltBPct = ((stats.altB.top3[name] ?? 0) / stats.iterations) * 100;

    const rankStr = String(idx + 1).padStart(2, " ");
    const nameStr = name.padEnd(42, " ");
    const origStr = `${origPct.toFixed(2)}%`.padStart(14, " ");
    const altBStr = `${altBPct.toFixed(2)}%`.padStart(15, " ");
    const desvSign = desvAltB >= 0 ? `+${desvAltB.toFixed(2)}%` : `${desvAltB.toFixed(2)}%`;
    const desvStr = desvSign.padStart(10, " ");
    const ratioStr = `${ratioAltB.toFixed(2)}x`.padStart(11, " ");
    const top3Str = `${top3AltBPct.toFixed(2)}%`.padStart(15, " ");

    lines.push(`| ${rankStr} | ${nameStr} | ${origStr} | ${altBStr} | ${desvStr} | ${ratioStr} | ${top3Str} |`);
  });

  lines.push("=========================================================================================================");

  // Métricas estadísticas agregadas
  const altBPcts = sortedPrograms.map((n) => ((stats.altB.top1[n] ?? 0) / stats.iterations) * 100);
  const origPcts = sortedPrograms.map((n) => ((stats.original.top1[n] ?? 0) / stats.iterations) * 100);

  const maxOrig = Math.max(...origPcts);
  const minOrig = Math.min(...origPcts);
  const spreadOrig = maxOrig / Math.max(minOrig, 0.01);

  const maxAltB = Math.max(...altBPcts);
  const minAltB = Math.min(...altBPcts);
  const spreadAltB = maxAltB / Math.max(minAltB, 0.01);

  lines.push("\n--- ANÁLISIS DE DISPERSIÓN Y EQUIDAD ---");
  lines.push(`Modelo Original (55/45):`);
  lines.push(`  - Máximo: ${maxOrig.toFixed(2)}% | Mínimo: ${minOrig.toFixed(2)}% | Razón Max/Min: ${spreadOrig.toFixed(1)}x`);
  lines.push(`Modelo Alternativa B (100% Similitud Vectorial):`);
  lines.push(`  - Máximo: ${maxAltB.toFixed(2)}% | Mínimo: ${minAltB.toFixed(2)}% | Razón Max/Min: ${spreadAltB.toFixed(1)}x`);

  return lines.join("\n");
}

if (process.argv[1]?.includes("compareEngines")) {
  const iterationsArg = process.argv[2] ? Number(process.argv[2]) : 10000;
  const iterations = Number.isInteger(iterationsArg) && iterationsArg > 0 ? iterationsArg : 10000;
  console.log(`Iniciando banco de pruebas comparativo Monte Carlo con N = ${iterations}...`);
  const start = Date.now();
  const stats = runEngineComparison(iterations);
  const elapsed = Date.now() - start;
  console.log(formatComparisonReport(stats));
  console.log(`Tiempo total de cómputo: ${elapsed} ms\n`);
}
