import { describe, expect, it } from "vitest";
import { appendAnswer, resolveQuestionTransition } from "./questionFlow";
import { QUESTIONS } from "../../../shared/vocational";

describe("flujo de transición de preguntas", () => {
  it("prepara la respuesta y avanza un único paso una vez terminada la transición", () => {
    const pendingAnswers = appendAnswer([0, 2, 1], 3);
    const next = resolveQuestionTransition(3, pendingAnswers.length, QUESTIONS.length);

    expect(pendingAnswers).toEqual([0, 2, 1, 3]);
    expect(next).toEqual({ isComplete: false, nextQuestionIndex: 4 });
  });

  it("mantiene el índice visible cuando la última respuesta lleva al resultado", () => {
    const lastIndex = QUESTIONS.length - 1;
    const next = resolveQuestionTransition(lastIndex, QUESTIONS.length, QUESTIONS.length);

    expect(next).toEqual({ isComplete: true, nextQuestionIndex: lastIndex });
  });
});
