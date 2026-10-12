import { PROGRAMS } from "@shared/vocational";
import { detectTies, getAffinityBand, type AffinityBand } from "./affinityBands";

export type TopAffinityInput = { program: string; score: number; area: string };

export type TopAffinityRow = {
  position: number;
  program: string;
  score: number;
  band: AffinityBand;
  isTie: boolean;
  area: string;
  focus: string;
  subjects: string[];
  field: string;
};

export function buildTopAffinityComparison(topThree: TopAffinityInput[]): TopAffinityRow[] {
  const ties = detectTies(topThree);
  return topThree.flatMap((affinity, index) => {
    const profile = PROGRAMS[affinity.program];
    if (!profile) return [];

    return [{
      position: index + 1,
      program: affinity.program,
      score: affinity.score,
      band: getAffinityBand(affinity.score),
      isTie: ties[index] ?? false,
      area: affinity.area,
      focus: profile.profile,
      subjects: profile.subjects.slice(0, 2),
      field: profile.field,
    }];
  });
}
