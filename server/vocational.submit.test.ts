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

  it("solo permite exportación dimensional a usuarios admin, anonimiza en origen y previene inyección de fórmulas (S7)", async () => {
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
        locality: "=SUM(A1:A10)", // Prueba de inyección de fórmulas CSV
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

    // 1. FactEvaluaciones (por defecto o parámetro explícito)
    const evalExport = await appRouter.createCaller(adminContext()).vocational.exportCsv({ table: "evaluations" });
    expect(evalExport.filename).toMatch(/^FactEvaluaciones-\d{4}-\d{2}-\d{2}\.csv$/);
    expect(evalExport.content.startsWith("\uFEFF")).toBe(true);

    const evalHeaderLine = evalExport.content.replace(/^\uFEFF/, "").split("\n")[0];
    const evalFirstDataLine = evalExport.content.replace(/^\uFEFF/, "").split("\n")[1];
    const evalHeaders = evalHeaderLine.split(";").map((h) => h.replace(/^"|"$/g, ""));
    const evalCells = parseQuotedCsvRow(evalFirstDataLine);

    // Formato largo dimensional de 15 columnas
    expect(evalHeaders).toHaveLength(15);
    expect(evalCells).toHaveLength(15);
    expect(evalHeaders).toEqual([
      "ID_Evaluacion",
      "Fecha_UTC",
      "Fecha_Argentina_Jujuy",
      "Version_Cuestionario",
      "Version_Catalogo",
      "Version_Motor",
      "Edad",
      "Grupo_Edad",
      "Sexo",
      "Localidad",
      "Situacion_Educativa",
      "Intencion_Estudiar_IES11",
      "Consentimiento_Datos",
      "Tecnicatura_Recomendada",
      "Area_Recomendada",
    ]);

    // Anonimización estricta en origen: no existen columnas de nombre ni apellido (S7)
    expect(evalHeaders).not.toContain("Nombre");
    expect(evalHeaders).not.toContain("Apellido");
    expect(evalHeaders).not.toContain("firstName");
    expect(evalHeaders).not.toContain("lastName");

    expect(evalCells[0]).toBe("7");
    expect(evalCells[evalHeaders.indexOf("Grupo_Edad")]).toBe("16-18");
    expect(evalCells[evalHeaders.indexOf("Tecnicatura_Recomendada")]).toBe(csvScores[0].program);

    // Prevención de inyección de fórmulas CSV (prefijo con apóstrofe)
    expect(evalCells[evalHeaders.indexOf("Localidad")]).toBe("'=SUM(A1:A10)");

    // 2. FactAfinidades (desglose dimensional de puntajes)
    const affExport = await appRouter.createCaller(adminContext()).vocational.exportCsv({ table: "affinities" });
    expect(affExport.filename).toMatch(/^FactAfinidades-\d{4}-\d{2}-\d{2}\.csv$/);
    expect(affExport.content.startsWith("\uFEFF")).toBe(true);

    const affHeaderLine = affExport.content.replace(/^\uFEFF/, "").split("\n")[0];
    const affHeaders = affHeaderLine.split(";").map((h) => h.replace(/^"|"$/g, ""));
    expect(affHeaders).toEqual([
      "ID_Evaluacion",
      "Posicion_Top",
      "Program_ID",
      "Carrera",
      "Puntaje_Afinidad",
      "Area",
      "Es_Afinidad_Ganadora",
      "Es_Empate_Top",
    ]);

    const affRows = affExport.content.replace(/^\uFEFF/, "").split("\n").slice(1);
    expect(affRows.length).toBe(csvScores.length);
    const topAffCells = parseQuotedCsvRow(affRows[0]);
    expect(topAffCells[0]).toBe("7"); // ID_Evaluacion
    expect(topAffCells[1]).toBe("1"); // Posicion_Top
    expect(topAffCells[2]).toBeTruthy(); // Program_ID estable
    expect(topAffCells[3]).toBe(csvScores[0].program); // Carrera
    expect(topAffCells[6]).toBe("Sí"); // Es_Afinidad_Ganadora

    // 3. FactRespuestas (desglose dimensional de ítems y respuestas)
    const respExport = await appRouter.createCaller(adminContext()).vocational.exportCsv({ table: "responses" });
    expect(respExport.filename).toMatch(/^FactRespuestas-\d{4}-\d{2}-\d{2}\.csv$/);
    expect(respExport.content.startsWith("\uFEFF")).toBe(true);

    const respHeaderLine = respExport.content.replace(/^\uFEFF/, "").split("\n")[0];
    const respHeaders = respHeaderLine.split(";").map((h) => h.replace(/^"|"$/g, ""));
    expect(respHeaders).toEqual([
      "ID_Evaluacion",
      "Numero_Pregunta",
      "Question_ID",
      "Pregunta_Texto",
      "Indice_Opcion",
      "Option_ID",
      "Texto_Opcion",
    ]);

    const respRows = respExport.content.replace(/^\uFEFF/, "").split("\n").slice(1);
    expect(respRows.length).toBe(14); // 14 preguntas del cuestionario
    const firstRespCells = parseQuotedCsvRow(respRows[0]);
    expect(firstRespCells[0]).toBe("7"); // ID_Evaluacion
    expect(firstRespCells[1]).toBe("1"); // Numero_Pregunta
    expect(firstRespCells[2]).toBe("q_proposal"); // Question_ID estable
    expect(firstRespCells[5]).toBeTruthy(); // Option_ID estable
  });
});
