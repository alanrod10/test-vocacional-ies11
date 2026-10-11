export function buildResultSharePath(programName: string) {
  return `/?resultado=${encodeURIComponent(programName)}`;
}

export function buildResultShareUrl(origin: string, programName: string) {
  return `${origin}${buildResultSharePath(programName)}`;
}
