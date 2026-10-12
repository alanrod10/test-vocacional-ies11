/** Texto breve para una imagen social; el perfil ampliado se reserva para la pantalla de resultado y el PDF. */
export function buildSocialCardSummary(graduateRole: string, maxLength = 250) {
  const normalized = graduateRole.trim().replace(/\s+/g, " ");
  const firstSentence = normalized.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim() ?? normalized;
  if (firstSentence.length <= maxLength) return firstSentence;

  const shortened = firstSentence.slice(0, maxLength - 1);
  return `${shortened.slice(0, shortened.lastIndexOf(" ")).trim()}…`;
}

/**
 * Retorna la etiqueta descriptiva de afinidad para la tarjeta social,
 * visibilizando empates en la afinidad principal sin mostrar puntajes crudos.
 */
export function buildSocialCardAffinityCaption(band: string, isTie?: boolean) {
  return isTie ? `${band} · Empate en 1.er lugar` : band;
}
