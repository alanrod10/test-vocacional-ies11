import { getInterestProfile, INTEREST_KEYS, INTEREST_META, OPTION_ANCHORS, PROGRAM_NAMES, PROGRAMS, QUESTIONS, scoreSelections } from "../shared/vocational";

console.table(PROGRAM_NAMES.map((program) => ({
  program,
  ...PROGRAMS[program].interests,
  total: INTEREST_KEYS.reduce((sum, key) => sum + PROGRAMS[program].interests[key], 0),
})));

const scenarios = INTEREST_KEYS.map((interest) => {
  const selections = QUESTIONS.map((question) => question.options.reduce((best, option, index) => option.interests[interest] > question.options[best].interests[interest] ? index : best, 0));
  const ranking = scoreSelections(selections);
  return {
    interest: `${interest} · ${INTEREST_META[interest].label}`,
    profile: getInterestProfile(selections),
    topOne: ranking[0].program,
    topThree: ranking.slice(0, 3).map((item) => `${item.program.replace("TS en ", "")} (${item.score})`).join(" | "),
  };
});

console.table(scenarios);

function fitOption(option: (typeof QUESTIONS)[number]["options"][number], program: string) {
  return INTEREST_KEYS.reduce((sum, key) => sum + option.interests[key] * PROGRAMS[program].interests[key], 0);
}

const programFocused = PROGRAM_NAMES.map((program) => {
  const selections = QUESTIONS.map((question) => {
    const anchors = question.options.map((_, index) => index).filter((index) => (OPTION_ANCHORS[question.id][index] ?? []).includes(program));
    return anchors.length ? anchors.sort((a, b) => fitOption(question.options[b], program) - fitOption(question.options[a], program))[0] : question.options.reduce((best, option, index) => fitOption(option, program) > fitOption(question.options[best], program) ? index : best, 0);
  });
  const ranking = scoreSelections(selections);
  return { program, topOne: ranking[0].program, position: ranking.findIndex((item) => item.program === program) + 1, score: ranking.find((item) => item.program === program)?.score };
});

console.table(programFocused);
