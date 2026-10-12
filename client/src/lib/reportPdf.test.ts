import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  addImage: vi.fn(), addPage: vi.fn(), line: vi.fn(), roundedRect: vi.fn(), save: vi.fn(), setDrawColor: vi.fn(), setFillColor: vi.fn(), setFont: vi.fn(), setFontSize: vi.fn(), setTextColor: vi.fn(), splitTextToSize: vi.fn((text: string) => text.split("\n")), text: vi.fn(),
}));

vi.mock("jspdf", () => ({ jsPDF: vi.fn(() => mocks) }));

import { downloadVocationalReport } from "./reportPdf";

describe("informe PDF vocacional", () => {
  it("compone y descarga un informe institucional con perfil, materias, bandas de afinidad y sin puntajes crudos", async () => {
    await downloadVocationalReport({
      participant: { name: "Ana Prueba", age: 18 },
      winner: { program: "TS en Desarrollo de Software", score: 91, area: "Tecnología e Innovación" },
      topThree: [
        { program: "TS en Desarrollo de Software", score: 91, area: "Tecnología e Innovación" },
        { program: "TS en Ciencias de Datos e Inteligencia Artificial", score: 82, area: "Tecnología e Innovación" },
        { program: "TS en Estadísticas de Salud", score: 70, area: "Salud y Bienestar" },
      ],
      profile: {
        area: "Tecnología e Innovación",
        profile: "Diseña soluciones digitales.",
        graduateRole: "Al finalizar, podrás colaborar en el desarrollo, prueba y mantenimiento de soluciones digitales con criterios de calidad y trabajo colaborativo.",
        tasks: ["Construir interfaces y servicios", "Modelar datos de aplicaciones", "Probar y documentar funcionalidades"],
        subjects: ["Programación", "Bases de datos", "Desarrollo web y móvil"],
        field: "Empresas y trabajo remoto desde Jujuy y el NOA.",
        interests: { R: 1, I: 5, A: 1, S: 0, E: 1, C: 2 },
      },
    });

    expect(mocks.text).toHaveBeenCalledWith(expect.arrayContaining([expect.stringContaining("Desarrollo de Software")]), expect.any(Number), expect.any(Number));
    expect(mocks.text).toHaveBeenCalledWith(expect.arrayContaining([expect.stringContaining("Programación")]), expect.any(Number), expect.any(Number));
    expect(mocks.text).toHaveBeenCalledWith(expect.arrayContaining([expect.stringContaining("Construir interfaces")]), expect.any(Number), expect.any(Number));
    expect(mocks.text).toHaveBeenCalledWith(expect.arrayContaining([expect.stringContaining("Afinidad Alta")]), expect.any(Number), expect.any(Number));

    // Verificar que NINGÚN texto contenga "/100"
    const allCalls = mocks.text.mock.calls.map((call) => JSON.stringify(call[0]));
    const hasRawScore = allCalls.some((c) => c.includes("/100"));
    expect(hasRawScore).toBe(false);

    expect(mocks.save).toHaveBeenCalledWith("informe-ies11-ana-prueba.pdf");
  });

  it("visibiliza empates en el PDF cuando dos carreras obtienen el mismo puntaje", async () => {
    mocks.text.mockClear();
    await downloadVocationalReport({
      participant: { name: "Carlos Empate", age: 19 },
      winner: { program: "TS en Desarrollo de Software", score: 85, area: "Tecnología e Innovación" },
      topThree: [
        { program: "TS en Desarrollo de Software", score: 85, area: "Tecnología e Innovación" },
        { program: "TS en Ciencias de Datos e Inteligencia Artificial", score: 85, area: "Tecnología e Innovación" },
        { program: "TS en Estadísticas de Salud", score: 65, area: "Salud y Bienestar" },
      ],
      profile: {
        area: "Tecnología e Innovación",
        profile: "Diseña soluciones digitales.",
        graduateRole: "Rol de egreso.",
        tasks: ["Tarea 1"],
        subjects: ["Materia 1"],
        field: "Campo laboral",
        interests: { R: 1, I: 5, A: 1, S: 0, E: 1, C: 2 },
      },
    });

    const allCalls = mocks.text.mock.calls.map((call) => JSON.stringify(call[0]));
    const hasEmpateTag = allCalls.some((c) => c.includes("[Empate]"));
    expect(hasEmpateTag).toBe(true);
  });
});
