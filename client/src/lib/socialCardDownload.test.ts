import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ toPng: vi.fn() }));

vi.mock("html-to-image", () => ({ toPng: mocks.toPng }));

import { buildSocialCardFilename, downloadSocialCardPng } from "./socialCardDownload";

describe("descarga de tarjeta social", () => {
  it("genera un nombre seguro y solicita una descarga PNG con configuración de alta resolución", async () => {
    mocks.toPng.mockResolvedValue("data:image/png;base64,tarjeta");
    const click = vi.fn();
    const link = { href: "", download: "", click };
    const downloadDocument = { createElement: vi.fn(() => link) };
    const node = {} as HTMLElement;
    const program = "TS en Ciencias de Datos e Inteligencia Artificial";

    const result = await downloadSocialCardPng(node, program, downloadDocument);

    expect(buildSocialCardFilename(program)).toBe("mi-resultado-vocacional-ies11-ts-en-ciencias-de-datos-e-inteligencia-artificial.png");
    expect(mocks.toPng).toHaveBeenCalledWith(node, { cacheBust: true, pixelRatio: 2, backgroundColor: "#102d54" });
    expect(downloadDocument.createElement).toHaveBeenCalledWith("a");
    expect(link.href).toBe("data:image/png;base64,tarjeta");
    expect(result.filename).toBe(link.download);
    expect(click).toHaveBeenCalledOnce();
  });
});
