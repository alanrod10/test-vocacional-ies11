import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  list: vi.fn(),
  deleteAssessment: vi.fn(),
  recordAdminAction: vi.fn(),
}));

vi.mock("./db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./db")>();
  return {
    ...actual,
    createVocationalAssessment: mocks.create,
    listVocationalAssessments: mocks.list,
    deleteVocationalAssessment: mocks.deleteAssessment,
    recordVocationalAdminAction: mocks.recordAdminAction,
  };
});

import { appRouter } from "./routers";
import { CATALOG_VERSION, QUESTIONNAIRE_VERSION, QUESTIONS, scoreSelections } from "../shared/vocational";

function publicContext(): TrpcContext {
  return { user: null, adminUser: null, req: { protocol: "https", headers: {}, ip: "127.0.0.1" } as any, res: {} as any, clientIp: "127.0.0.1" };
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

// Payload minimizado: NO contiene firstName ni lastName (S6/S7)
const validInput = {
  age: 18,
  sex: "Femenino" as const,
  studyIntent: "Sí, quiero conocer la propuesta y los pasos para inscribirme",
  locality: "San Salvador de Jujuy",
  educationStatus: "Secundario: último año",
  dataConsent: true,
  selections: [1, 1, 2, 0, 1, 0, 3, 3, 1, 1, 1, 1, 7, 0],
};

function adminContext(): TrpcContext {
  return {
    user: null,
    adminUser: { id: 1, username: "admin", role: "admin" },
    req: { protocol: "https", headers: {}, ip: "127.0.0.1" } as any,
    res: { cookie: vi.fn(), clearCookie: vi.fn() } as any,
    clientIp: "127.0.0.1",
  };
}

function viewerContext(): TrpcContext {
  return {
    user: null,
    adminUser: { id: 2, username: "viewer", role: "viewer" },
    req: { protocol: "https", headers: {}, ip: "127.0.0.1" } as any,
    res: { cookie: vi.fn(), clearCookie: vi.fn() } as any,
    clientIp: "127.0.0.1",
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.create.mockResolvedValue(42);
  mocks.list.mockResolvedValue([]);
  mocks.deleteAssessment.mockResolvedValue(true);
  mocks.recordAdminAction.mockResolvedValue(undefined);
});

describe("registro vocacional con privacidad de datos (S6/S7)", () => {
  it("bloquea nuevas evaluaciones para preservar el cierre histórico", async () => {
    process.env.INSTANCE_MODE = "historical";
    const caller = appRouter.createCaller(publicContext());
    await expect(caller.vocational.submit(validInput)).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("permite nuevas evaluaciones en modo permanente persistiendo solo datos anónimos", async () => {
    process.env.INSTANCE_MODE = "permanent";
    const caller = appRouter.createCaller(publicContext());
    const response = await caller.vocational.submit(validInput);
    expect(response.id).toBe(42);
    expect(mocks.create).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: null,
        lastName: null,
        age: 18,
        ageGroup: "16-18",
      })
    );
  });

  it("acepta ageGroup directamente o deriva el rango desde la edad", async () => {
    process.env.INSTANCE_MODE = "permanent";
    const caller = appRouter.createCaller(publicContext());
    const inputWithGroup = { ...validInput, age: 28 };
    await caller.vocational.submit(inputWithGroup);
    expect(mocks.create).toHaveBeenCalledWith(
      expect.objectContaining({
        ageGroup: "26+",
      })
    );
  });

  it("borrado individual: permite a administradores eliminar evaluaciones y bloquea observadores y público", async () => {
    process.env.INSTANCE_MODE = "permanent";
    // Público -> UNAUTHORIZED
    await expect(
      appRouter.createCaller(publicContext()).vocational.deleteAssessment({ id: 42 })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });

    // Observador -> FORBIDDEN
    await expect(
      appRouter.createCaller(viewerContext()).vocational.deleteAssessment({ id: 42 })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });

    // Admin en permanente -> Éxito
    const res = await appRouter.createCaller(adminContext()).vocational.deleteAssessment({ id: 42 });
    expect(res).toEqual({ success: true, id: 42 });
    expect(mocks.deleteAssessment).toHaveBeenCalledWith(42);

    // En modo histórico -> FORBIDDEN
    process.env.INSTANCE_MODE = "historical";
    await expect(
      appRouter.createCaller(adminContext()).vocational.deleteAssessment({ id: 42 })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("solo permite el CSV completo a usuarios admin y anonimiza nombres en modo permanente", async () => {
    process.env.INSTANCE_MODE = "permanent";
    const csvSelections = [1, 0, 2, 3, 1, 2, 0, 3, 1, 1, 0, 1, 7, 0];
    const csvScores = scoreSelections(csvSelections);
    mocks.list.mockResolvedValue([
      {
        id: 7,
        firstName: "Ana",
        lastName: "Prueba",
        age: 18,
        ageGroup: "16-18",
        sex: "Femenino",
        studyIntent: "Sí",
        locality: "San Salvador de Jujuy",
        educationStatus: "Secundario",
        discoverySource: "No informado",
        dataConsent: true,
        resultProgram: csvScores[0].program,
        resultArea: csvScores[0].area,
        selections: csvSelections,
        scoreSnapshot: csvScores,
        questionnaireVersion: QUESTIONNAIRE_VERSION,
        catalogVersion: CATALOG_VERSION,
        createdAt: new Date("2026-08-19T00:00:00.000Z"),
      },
    ]);

    await expect(appRouter.createCaller(publicContext()).vocational.exportCsv()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(appRouter.createCaller(viewerContext()).vocational.exportCsv()).rejects.toMatchObject({ code: "FORBIDDEN" });

    const exported = await appRouter.createCaller(adminContext()).vocational.exportCsv();
    const headerLine = exported.content.replace(/^\uFEFF/, "").split("\n")[0];
    const firstDataLine = exported.content.replace(/^\uFEFF/, "").split("\n")[1];
    const headers = headerLine.split(";").map((header) => header.replace(/^"|"$/g, ""));
    const firstDataCells = parseQuotedCsvRow(firstDataLine);
    expect(exported.filename).toMatch(/^resultados-vocacional-ies11-\d{4}-\d{2}-\d{2}\.csv$/);
    expect(exported.content.startsWith("\uFEFF")).toBe(true);
    expect(headerLine).toContain(";\"Fecha_UTC\"");
    expect(headers).toHaveLength(101);
    expect(firstDataCells).toHaveLength(101);
    expect(firstDataCells[0]).toBe("7");
    expect(headers).toContain("Grupo_Edad");
    expect(firstDataCells[headers.indexOf("Grupo_Edad")]).toBe("16-18");

    // En modo permanente los nombres deben estar vacíos para resguardar la privacidad (S6/S7)
    expect(firstDataCells[headers.indexOf("Nombre")]).toBe("");
    expect(firstDataCells[headers.indexOf("Apellido")]).toBe("");

    // Si cambia a modo histórico, las lecturas históricas conservan sus datos si existen
    process.env.INSTANCE_MODE = "historical";
    const historicalExport = await appRouter.createCaller(adminContext()).vocational.exportCsv();
    const histDataLine = historicalExport.content.replace(/^\uFEFF/, "").split("\n")[1];
    const histCells = parseQuotedCsvRow(histDataLine);
    expect(histCells[headers.indexOf("Nombre")]).toBe("Ana");
    expect(histCells[headers.indexOf("Apellido")]).toBe("Prueba");
  });
});
