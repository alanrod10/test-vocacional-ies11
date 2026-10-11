import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const homeSource = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
const styles = readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");

describe("revelación animada de resultados", () => {
  it("conserva las capas visuales para medalla, trayectoria, afinidades y comparación", () => {
    expect(homeSource).toContain("result-reveal-premium");
    expect(homeSource).toContain("result-trajectory");
    expect(homeSource).toContain("result-confetti");
    expect(homeSource).toContain("result-affinity-row");
    expect(homeSource).toContain("result-affinity-fill");
    expect(homeSource).toContain("result-comparison");
  });

  it("desactiva las animaciones decorativas cuando la persona solicita reducir movimiento", () => {
    expect(styles).toContain("@media (prefers-reduced-motion: reduce)");
    expect(styles).toContain(".result-trajectory-line");
    expect(styles).toContain(".result-confetti i");
    expect(styles).toContain(".result-affinity-fill");
    expect(styles).toContain(".comparison-row");
    expect(styles).toContain("animation: none");
  });
});
