import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const mocks = vi.hoisted(() => ({
  rows: [] as any[],
  deleteAll: vi.fn(),
  list: vi.fn(),
  recordAdminAction: vi.fn(),
  getAdminUser: vi.fn(),
}));

vi.mock("./db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./db")>();
  return {
    ...actual,
    deleteAllVocationalAssessments: mocks.deleteAll,
    listVocationalAssessments: mocks.list,
    recordVocationalAdminAction: mocks.recordAdminAction,
    getAdminUserByUsername: mocks.getAdminUser,
  };
});

import { appRouter } from "./routers";

function publicContext(): TrpcContext {
  return {
    user: null,
    adminUser: null,
    req: { protocol: "https", headers: { "x-forwarded-for": "127.0.0.1" }, ip: "127.0.0.1", socket: { remoteAddress: "127.0.0.1" } } as any,
    res: { cookie: vi.fn(), clearCookie: vi.fn() } as any,
    clientIp: "127.0.0.1",
  };
}

function viewerContext(): TrpcContext {
  return {
    user: null,
    adminUser: { id: 2, username: "viewer", role: "viewer" },
    req: { protocol: "https", headers: { "x-forwarded-for": "127.0.0.1" }, ip: "127.0.0.1", socket: { remoteAddress: "127.0.0.1" } } as any,
    res: { cookie: vi.fn(), clearCookie: vi.fn() } as any,
    clientIp: "127.0.0.1",
  };
}

function adminContext(): TrpcContext {
  return {
    user: null,
    adminUser: { id: 1, username: "admin", role: "admin" },
    req: { protocol: "https", headers: { "x-forwarded-for": "127.0.0.1" }, ip: "127.0.0.1", socket: { remoteAddress: "127.0.0.1" } } as any,
    res: { cookie: vi.fn(), clearCookie: vi.fn() } as any,
    clientIp: "127.0.0.1",
  };
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
  mocks.getAdminUser.mockResolvedValue(null);
});

describe("reinicio protegido de resultados y control de acceso", () => {
  it("bloquea el reinicio para preservar el archivo histórico", async () => {
    mocks.rows = [exampleAssessment()];

    // Llamada sin autenticación -> UNAUTHORIZED
    const publicCaller = appRouter.createCaller(publicContext());
    await expect(publicCaller.vocational.createResetChallenge()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(publicCaller.vocational.reset({ challenge: "x".repeat(20), backupReceipt: "00000000-0000-4000-8000-000000000000" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });

    // Llamada con rol viewer -> FORBIDDEN
    const viewerCaller = appRouter.createCaller(viewerContext());
    await expect(viewerCaller.vocational.createResetChallenge()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(viewerCaller.vocational.reset({ challenge: "x".repeat(20), backupReceipt: "00000000-0000-4000-8000-000000000000" })).rejects.toMatchObject({ code: "FORBIDDEN" });

    // Llamada con rol admin en modo histórico -> FORBIDDEN por archivo histórico
    const adminCaller = appRouter.createCaller(adminContext());
    await expect(adminCaller.vocational.createResetChallenge()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(adminCaller.vocational.reset({ challenge: "x".repeat(20), backupReceipt: "00000000-0000-4000-8000-000000000000" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(mocks.deleteAll).not.toHaveBeenCalled();
  });

  it("limita los intentos fallidos de login para proteger el acceso administrativo", async () => {
    const caller = appRouter.createCaller(publicContext());
    for (let attempt = 0; attempt < 5; attempt += 1) {
      await expect(caller.adminAuth.login({ username: "admin", password: "contraseña-incorrecta" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    }
    await expect(caller.adminAuth.login({ username: "admin", password: "contraseña-incorrecta" })).rejects.toMatchObject({ code: "TOO_MANY_REQUESTS" });
  });
});
