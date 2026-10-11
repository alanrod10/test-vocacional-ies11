import { describe, expect, it } from "vitest";
import { ANSWER_CONFIRMATION_MS, QUESTION_EXIT_MS, isAnswerLocked } from "./answerTransition";

describe("answer transition", () => {
  it("reserves a brief confirmation before the question exits", () => {
    expect(ANSWER_CONFIRMATION_MS).toBeGreaterThanOrEqual(100);
    expect(ANSWER_CONFIRMATION_MS + QUESTION_EXIT_MS).toBeLessThanOrEqual(320);
  });

  it("locks interactions only while a response is being acknowledged or the card is leaving", () => {
    expect(isAnswerLocked("idle")).toBe(false);
    expect(isAnswerLocked("selected")).toBe(true);
    expect(isAnswerLocked("leaving")).toBe(true);
  });
});
