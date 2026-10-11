import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const mocks = vi.hoisted(() => ({
  rows: [] as any[],
  deleteAll: vi.fn(),
  list: vi.fn(),
  recordAdminAction: vi.fn(),
}));

vi.mock("./db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./db")>();
  return {
    ...actual,
    deleteAllVocationalAssessments: mocks.deleteAll,
    listVocationalAssessments: mocks.list,
    recordVocationalAdminAction: mocks.recordAdminAction,
  };
});

import { appRouter } from "./routers";

function publicContext() {
  return { user: null, req: { protocol: "https", headers: {} }, res: {} } as TrpcContext;
}

function exampleAssessment() {
  return {
    id: 1,
    firstName: "Prueba",
    lastName: "Temporal",
    age: 18,
    sex: "Femenino",
    resultProgram: "TS en Enfermería",
    resultArea: "Salud y Bienestar",
    selections: Array(10).fill(0),
    scoreSnapshot: [],
    questionnaireVersion: "2026.08-original",
    catalogVersion: "2026.08-legado-19",
    createdAt: new Date(),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.rows = [];
  mocks.list.mockImplementation(async () => mocks.rows);
  mocks.deleteAll.mockImplementation(async () => {
    const count = mocks.rows.length;
    mocks.rows = [];
    return count;
  });
  mocks.recordAdminAction.mockResolvedValue(undefined);
});

describe("reinicio protegido de resultados", () => {
  const configuredPassword = process.env.ADMIN_ACTION_PASSWORD!;

  it("bloquea el reinicio para preservar el archivo histórico", async () => {
    const prevMode = process.env.INSTANCE_MODE;
    process.env.INSTANCE_MODE = "historical";
    try {
      const caller = appRouter.createCaller(publicContext());
      mocks.rows = [exampleAssessment()];
      await expect(caller.vocational.createResetChallenge()).rejects.toMatchObject({ code: "FORBIDDEN" });
      await expect(caller.vocational.reset({ challenge: "x".repeat(20), password: configuredPassword, backupReceipt: "00000000-0000-4000-8000-000000000000" })).rejects.toMatchObject({ code: "FORBIDDEN" });
      expect(mocks.deleteAll).not.toHaveBeenCalled();
    } finally {
      process.env.INSTANCE_MODE = prevMode;
    }
  });

  it("limita los intentos fallidos de contraseña para proteger las acciones administrativas", async () => {
    const caller = appRouter.createCaller(publicContext());
    for (let attempt = 0; attempt < 5; attempt += 1) {
      await expect(caller.vocational.verifyAdminPassword({ password: "contraseña-incorrecta" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    }
    await expect(caller.vocational.verifyAdminPassword({ password: "contraseña-incorrecta" })).rejects.toMatchObject({ code: "TOO_MANY_REQUESTS" });
  });
});
