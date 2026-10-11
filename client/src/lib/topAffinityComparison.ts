import { PROGRAMS } from "@shared/vocational";

export type TopAffinityInput = { program: string; score: number; area: string };

export function buildTopAffinityComparison(topThree: TopAffinityInput[]) {
  return topThree.flatMap((affinity, index) => {
    const profile = PROGRAMS[affinity.program];
    if (!profile) return [];

    return [{
      position: index + 1,
      program: affinity.program,
      score: affinity.score,
      area: affinity.area,
      focus: profile.profile,
      subjects: profile.subjects.slice(0, 2),
      field: profile.field,
    }];
  });
}
