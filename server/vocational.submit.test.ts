import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  list: vi.fn(),
}));

vi.mock("./db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./db")>();
  return { ...actual, createVocationalAssessment: mocks.create, listVocationalAssessments: mocks.list };
});

import { appRouter } from "./routers";
import { CATALOG_VERSION, QUESTIONNAIRE_VERSION, QUESTIONS, scoreSelections } from "../shared/vocational";

function publicContext() {
  return { user: null, req: { protocol: "https", headers: {} }, res: {} } as TrpcContext;
}

function parseQuotedCsvRow(row: string, delimiter = ";") {
  const cells: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < row.length; index += 1) {
    const character = row[index];
    if (character === '"') {
      if (quoted && row[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === delimiter && !quoted) {
      cells.push(cell);
      cell = "";
    } else {
      cell += character;
    }
  }
  cells.push(cell);
  return cells;
}

const validInput = {
  firstName: "Ana",
  lastName: "Prueba",
  age: 18,
  sex: "Femenino" as const,
  studyIntent: "Sí, quiero conocer la propuesta y los pasos para inscribirme",
  locality: "San Salvador de Jujuy",
  educationStatus: "Secundario: último año",
  dataConsent: true,
  selections: [1, 1, 2, 0, 1, 0, 3, 3, 1, 1, 1, 1, 7, 0],
};

function adminContext() {
  return {
    user: { id: 1, openId: "coordinacion-ies11", name: "Coordinación", email: null, loginMethod: "oauth", role: "admin", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} },
    res: {},
  } as TrpcContext;
}

function userContext() {
  return {
    user: { id: 2, openId: "visitante-ies11", name: "Visitante", email: null, loginMethod: "oauth", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} },
    res: {},
  } as TrpcContext;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.create.mockResolvedValue(42);
  mocks.list.mockResolvedValue([]);
});

describe("registro vocacional sin teléfono", () => {
  it("bloquea nuevas evaluaciones para preservar el cierre histórico", async () => {
    const caller = appRouter.createCaller(publicContext());
    await expect(caller.vocational.submit(validInput)).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("valida la contraseña privada configurada mediante una llamada administrativa liviana", async () => {
    const configuredPassword = process.env.ADMIN_ACTION_PASSWORD;
    expect(configuredPassword).toBeTruthy();

    const caller = appRouter.createCaller(publicContext());
    await expect(caller.vocational.verifyAdminPassword({ password: configuredPassword! })).resolves.toEqual({ authorized: true });
    await expect(caller.vocational.verifyAdminPassword({ password: "contraseña-incorrecta" })).rejects.toBeTruthy();
  });

  it("solo permite el CSV completo con la contraseña privada y entrega columnas tabulares para análisis", async () => {
    const csvSelections = [1, 0, 2, 3, 1, 2, 0, 3, 1, 1, 0, 1, 7, 0];
    const csvScores = scoreSelections(csvSelections);
    mocks.list.mockResolvedValue([{ id: 7, firstName: "Ana", lastName: "Prueba", age: 18, sex: "Femenino", studyIntent: "Sí", locality: "San Salvador de Jujuy", educationStatus: "Secundario", discoverySource: "No informado", dataConsent: true, resultProgram: csvScores[0].program, resultArea: csvScores[0].area, selections: csvSelections, scoreSnapshot: csvScores, questionnaireVersion: QUESTIONNAIRE_VERSION, catalogVersion: CATALOG_VERSION, createdAt: new Date("2026-08-19T00:00:00.000Z") }]);
    const configuredPassword = process.env.ADMIN_ACTION_PASSWORD;
    expect(configuredPassword).toBeTruthy();
    await expect(appRouter.createCaller(publicContext()).vocational.exportCsv({ password: "contraseña-incorrecta" })).rejects.toBeTruthy();
    await expect(appRouter.createCaller(userContext()).vocational.exportCsv({ password: "contraseña-incorrecta" })).rejects.toBeTruthy();

    const exported = await appRouter.createCaller(publicContext()).vocational.exportCsv({ password: configuredPassword! });
    const headerLine = exported.content.replace(/^\uFEFF/, "").split("\n")[0];
    const firstDataLine = exported.content.replace(/^\uFEFF/, "").split("\n")[1];
    const headers = headerLine.split(";").map((header) => header.replace(/^"|"$/g, ""));
    const firstDataCells = parseQuotedCsvRow(firstDataLine);
    expect(exported.filename).toMatch(/^resultados-vocacional-ies11-\d{4}-\d{2}-\d{2}\.csv$/);
    expect(exported.content.startsWith("\uFEFF")).toBe(true);
    expect(headerLine).toContain(";\"Fecha_UTC\"");
    expect(headers).toHaveLength(100);
    expect(firstDataCells).toHaveLength(100);
    expect(firstDataCells[0]).toBe("7");
    expect(firstDataCells[headers.indexOf("Version_Catalogo")]).toBe(CATALOG_VERSION);
    expect(firstDataCells[headers.indexOf("Afinidad_18_Carrera")]).toBeTruthy();
    expect(firstDataCells[headers.indexOf("Afinidad_19_Carrera")]).toBe("");
    expect(exported.content).toContain("Nombre");
    expect(exported.content).toContain("Ana");
    expect(exported.content).toContain("Fecha_Argentina_Jujuy");
    expect(exported.content).toContain("Version_Cuestionario");
    expect(exported.content).toContain("Version_Catalogo");
    expect(exported.content).toContain(QUESTIONNAIRE_VERSION);
    expect(exported.content).toContain(CATALOG_VERSION);
    expect(exported.content).toContain("P01_Opcion");
    expect(exported.content).toContain("P01_Texto");
    expect(exported.content).toContain("Afinidad_1_Carrera");
    expect(exported.content).toContain("Afinidad_3_Area");
    expect(exported.content).toContain("Afinidad_19_Carrera");
    expect(exported.content).toContain(QUESTIONS[0].options[1].label);
    expect(exported.content).toContain("TS en Desarrollo de Software");
    expect(exported.content).toContain("TS en Diseño de Indumentaria");
    expect(exported.content).not.toContain("Respuestas");
    expect(exported.content).not.toContain("Afinidades");
    expect(exported.content).not.toContain("WhatsApp");
    expect(exported.content).not.toContain("Canal de llegada");
  });
});
