import { INTEREST_KEYS, OPTION_ANCHORS, PROGRAM_NAMES, QUESTIONS, scoreSelections } from "../shared/vocational";

const coverage = Object.fromEntries(PROGRAM_NAMES.map((program) => [program, 0])) as Record<string, number>;
const modeCounts = Object.fromEntries(["choice", "binary", "preference", "slider"].map((mode) => [mode, 0])) as Record<string, number>;
const dimensionPresence = Object.fromEntries(INTEREST_KEYS.map((interest) => [interest, 0])) as Record<string, number>;

for (const question of QUESTIONS.filter((item) => !item.institutional)) {
  modeCounts[question.mode] += 1;
  question.options.filter((option) => !option.neutral).forEach((option) => {
    INTEREST_KEYS.forEach((interest) => {
      if (option.interests[interest] > 0) dimensionPresence[interest] += 1;
    });
  });
}

Object.values(OPTION_ANCHORS).forEach((options) => {
  Object.values(options).forEach((programs) => programs.forEach((program) => {
    coverage[program] += 1;
  }));
});

const values = Object.values(coverage);
const canonicalPathCheck = Object.fromEntries(PROGRAM_NAMES.map((program) => {
  const selections = QUESTIONS.map((question) => {
    const anchoredOption = Object.entries(OPTION_ANCHORS[question.id] ?? {}).find(([, programs]) => programs.includes(program));
    return anchoredOption ? Number(anchoredOption[0]) : question.options.findIndex((option) => option.neutral);
  });
  const topThree = scoreSelections(selections).slice(0, 3).map((item) => item.program);
  return [program, { topThree, identified: topThree.includes(program) }];
}));
const report = {
  nonInstitutionalQuestions: QUESTIONS.filter((item) => !item.institutional).length,
  neutralResponseOnEveryQuestion: QUESTIONS.every((item) => item.options.at(-1)?.neutral === true),
  modes: modeCounts,
  dimensionPresence,
  anchors: coverage,
  minimumAnchors: Math.min(...values),
  maximumAnchors: Math.max(...values),
  canonicalPathCheck,
};

console.log(JSON.stringify(report, null, 2));
