import {
  ACTIVE_PROGRAM_IDS,
  ACTIVE_PROGRAM_NAMES,
  PROGRAM_BY_ID,
  PROGRAM_BY_NAME,
  PROGRAM_NAMES,
  PROGRAMS,
  QUESTIONS,
  scoreSelections,
} from "../shared/vocational";

export interface SimulationResult {
  totalSimulations: number;
  expectedPercentage: number;
  exactTiesCount: number;
  exactTiesPercentage: number;
  programs: {
    id: string;
    name: string;
    area: string;
    top1Count: number;
    top1Percentage: number;
    top1Ratio: number; // relative to uniform expected (1.0 = exactly expected)
    top3Count: number;
    top3Percentage: number;
  }[];
}

export function runEngineSimulation(iterations = 10000, seed?: number): SimulationResult {
  // Pseudo-random generator with optional seed for reproducibility
  let currentSeed = seed ?? Date.now();
  function random(): number {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    return currentSeed / 233280;
  }

  const activeNonNeutralQuestions = QUESTIONS.filter((q) => !q.institutional);
  const totalPrograms = PROGRAM_NAMES.length; // 17 active programs
  const expectedPercentage = 100 / totalPrograms;

  const top1Counts: Record<string, number> = Object.fromEntries(PROGRAM_NAMES.map((name) => [name, 0]));
  const top3Counts: Record<string, number> = Object.fromEntries(PROGRAM_NAMES.map((name) => [name, 0]));
  let exactTies = 0;

  for (let i = 0; i < iterations; i++) {
    const selections: Record<string, string> = {};

    activeNonNeutralQuestions.forEach((question) => {
      const nonNeutralOptions = question.options.filter((opt) => !opt.neutral);
      const chosenIndex = Math.floor((seed !== undefined ? random() : Math.random()) * nonNeutralOptions.length);
      selections[question.id] = nonNeutralOptions[chosenIndex].id;
    });

    const ranking = scoreSelections(selections);

    // Medición de empates en el 1.º puesto antes del desempate alfabético
    if (ranking.length >= 2 && ranking[0].score === ranking[1].score) {
      exactTies++;
    }

    const winner = ranking[0];
    top1Counts[winner.program] = (top1Counts[winner.program] ?? 0) + 1;

    ranking.slice(0, 3).forEach((item) => {
      top3Counts[item.program] = (top3Counts[item.program] ?? 0) + 1;
    });
  }

  const programs = PROGRAM_NAMES.map((name) => {
    const def = PROGRAM_BY_NAME[name];
    const top1Count = top1Counts[name] ?? 0;
    const top1Pct = (top1Count / iterations) * 100;
    const top3Count = top3Counts[name] ?? 0;
    const top3Pct = (top3Count / iterations) * 100;
    const top1Ratio = top1Pct / expectedPercentage;

    return {
      id: def?.id ?? name,
      name,
      area: def?.area ?? PROGRAMS[name]?.area ?? "",
      top1Count,
      top1Percentage: Number(top1Pct.toFixed(2)),
      top1Ratio: Number(top1Ratio.toFixed(2)),
      top3Count,
      top3Percentage: Number(top3Pct.toFixed(2)),
    };
  }).sort((a, b) => b.top1Count - a.top1Count || a.name.localeCompare(b.name));

  return {
    totalSimulations: iterations,
    expectedPercentage: Number(expectedPercentage.toFixed(2)),
    exactTiesCount: exactTies,
    exactTiesPercentage: Number(((exactTies / iterations) * 100).toFixed(2)),
    programs,
  };
}

export function formatSimulationReport(result: SimulationResult): string {
  const lines: string[] = [];
  lines.push("================================================================================");
  lines.push("   LABORATORIO DEL MOTOR: SIMULACIÓN DE MONTE CARLO (LÍNEA BASE 17 TS ACTIVAS)  ");
  lines.push("================================================================================");
  lines.push(`Total de evaluaciones simuladas : ${result.totalSimulations.toLocaleString()}`);
  lines.push(`Distribución uniforme teórica  : ${result.expectedPercentage}% por carrera (1/${result.programs.length})`);
  lines.push(`Empates exactos en 1.er puesto : ${result.exactTiesCount.toLocaleString()} (${result.exactTiesPercentage}%)`);
  lines.push("--------------------------------------------------------------------------------");
  lines.push(
    "| #  | Tecnicatura Superior                       | Área                          | Top 1 (%) | Ratio | Top 3 (%) |",
  );
  lines.push(
    "|----+--------------------------------------------+-------------------------------+-----------+-------+-----------|",
  );

  result.programs.forEach((prog, index) => {
    const rank = String(index + 1).padStart(2, " ");
    const name = prog.name.padEnd(42, " ");
    const area = prog.area.padEnd(29, " ");
    const top1 = `${prog.top1Percentage.toFixed(2)}%`.padStart(9, " ");
    const ratio = `${prog.top1Ratio.toFixed(2)}x`.padStart(5, " ");
    const top3 = `${prog.top3Percentage.toFixed(2)}%`.padStart(9, " ");
    lines.push(`| ${rank} | ${name} | ${area} | ${top1} | ${ratio} | ${top3} |`);
  });

  lines.push("================================================================================");

  const top3Over = result.programs.slice(0, 3);
  const bottom3Under = result.programs.slice(-3);

  lines.push("\n--- DIAGNÓSTICO DE SESGO ESTRUCTURAL (MODELO NULO) ---");
  lines.push("Carreras más sobrerrepresentadas:");
  top3Over.forEach((p) => {
    lines.push(`  - ${p.name} (${p.top1Percentage}%, ${p.top1Ratio}x de lo esperado)`);
  });

  lines.push("\nCarreras más subrepresentadas o bloqueadas:");
  bottom3Under.forEach((p) => {
    lines.push(`  - ${p.name} (${p.top1Percentage}%, ${p.top1Ratio}x de lo esperado)`);
  });

  return lines.join("\n");
}

// Ejecución directa si se invoca como script
if (process.argv[1]?.includes("simulateEngine")) {
  const iterationsArg = process.argv[2] ? Number(process.argv[2]) : 10000;
  const iterations = Number.isInteger(iterationsArg) && iterationsArg > 0 ? iterationsArg : 10000;
  console.log(`Iniciando simulación de Monte Carlo con N = ${iterations}...`);
  const start = Date.now();
  const result = runEngineSimulation(iterations);
  const elapsed = Date.now() - start;
  console.log(formatSimulationReport(result));
  console.log(`Tiempo de ejecución: ${elapsed} ms\n`);
}
