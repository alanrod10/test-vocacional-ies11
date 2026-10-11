export function appendAnswer(answers: number[], optionIndex: number) {
  return [...answers, optionIndex];
}

export function resolveQuestionTransition(currentIndex: number, nextAnswerCount: number, totalQuestions: number) {
  const isComplete = nextAnswerCount >= totalQuestions;
  return {
    isComplete,
    nextQuestionIndex: isComplete ? currentIndex : Math.min(currentIndex + 1, totalQuestions - 1),
  };
}
