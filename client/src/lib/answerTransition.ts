export const ANSWER_CONFIRMATION_MS = 130;
export const QUESTION_EXIT_MS = 170;

export type AnswerTransitionState = "idle" | "selected" | "leaving";

export function isAnswerLocked(state: AnswerTransitionState) {
  return state !== "idle";
}
