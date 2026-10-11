import { beforeEach, describe, expect, it, vi } from "vitest";
import bcrypt from "bcryptjs";
import type { TrpcContext } from "./_core/context";
import { signAdminToken, verifyAdminToken, ADMIN_COOKIE_NAME } from "./_core/adminAuth";

const mocks = vi.hoisted(() => ({
  getAdminUser: vi.fn(),
  recordAdminAction: vi.fn(),
  listAssessments: vi.fn(),
}));

vi.mock("./db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./db")>();
  return {
    ...actual,
    getAdminUserByUsername: mocks.getAdminUser,
    recordVocationalAdminAction: mocks.recordAdminAction,
    listVocationalAssessments: mocks.listAssessments,
  };
});

import { appRouter } from "./routers";

function createMockContext(adminUser: TrpcContext["adminUser"] = null) {
  const cookies: { name: string; val: string; options: any }[] = [];
  const clearedCookies: { name: string; options: any }[] = [];

  const ctx: TrpcContext = {
    user: null,
    adminUser,
    req: {
      protocol: "https",
      headers: { "x-forwarded-for": "10.0.0.1" },
      ip: "10.0.0.1",
      socket: { remoteAddress: "10.0.0.1" },
    } as any,
    res: {
      cookie: (name: string, val: string, options: any) => {
        cookies.push({ name, val, options });
      },
      clearCookie: (name: string, options: any) => {
        clearedCookies.push({ name, options });
      },
    } as any,
    clientIp: "10.0.0.1",
  };

  return { ctx, cookies, clearedCookies };
}

describe("Autenticación administrativa y control de roles (S2)", () => {
  const samplePassword = "SuperAdminPassword123!";
  let sampleHash: string;

  beforeEach(async () => {
    vi.clearAllMocks();
    mocks.recordAdminAction.mockResolvedValue(undefined);
    mocks.listAssessments.mockResolvedValue([]);
    sampleHash = await bcrypt.hash(samplePassword, 10);
  });

  describe("Firmado y verificación de tokens JWT de sesión", () => {
    it("firma un token válido y lo decodifica correctamente", async () => {
      const payload = { id: 1, username: "coord_ies11", role: "admin" as const };
      const token = await signAdminToken(payload);
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3);

      const verified = await verifyAdminToken(token);
      expect(verified).not.toBeNull();
      expect(verified?.id).toBe(payload.id);
      expect(verified?.username).toBe(payload.username);
      expect(verified?.role).toBe(payload.role);
    });

    it("retorna null si el token fue manipulado o alterado", async () => {
      const token = await signAdminToken({ id: 1, username: "coord_ies11", role: "admin" });
      const tampered = token.slice(0, -5) + "abcde";
      const verified = await verifyAdminToken(tampered);
      expect(verified).toBeNull();
    });
  });

  describe("adminAuth.login", () => {
    it("rechaza el inicio de sesión si el usuario no existe", async () => {
      mocks.getAdminUser.mockResolvedValue(null);
      const { ctx } = createMockContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.adminAuth.login({ username: "inexistente", password: "password" })
      ).rejects.toMatchObject({ code: "UNAUTHORIZED", message: "Credenciales incorrectas." });

      expect(mocks.recordAdminAction).toHaveBeenCalledWith(
        "login",
        "denied",
        expect.any(Object),
        "10.0.0.1",
        "inexistente"
      );
    });

    it("rechaza el inicio de sesión si la contraseña es errónea", async () => {
      mocks.getAdminUser.mockResolvedValue({
        id: 1,
        username: "admin_test",
        passwordHash: sampleHash,
        role: "admin",
        createdAt: new Date(),
      });
      const { ctx } = createMockContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.adminAuth.login({ username: "admin_test", password: "wrong-password" })
      ).rejects.toMatchObject({ code: "UNAUTHORIZED", message: "Credenciales incorrectas." });
    });

    it("inicia sesión exitosamente, establece cookie HttpOnly y devuelve datos del usuario", async () => {
      mocks.getAdminUser.mockResolvedValue({
        id: 1,
        username: "admin_test",
        passwordHash: sampleHash,
        role: "admin",
        createdAt: new Date(),
      });
      const { ctx, cookies } = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const res = await caller.adminAuth.login({
        username: "admin_test",
        password: samplePassword,
      });

      expect(res.success).toBe(true);
      expect(res.user).toEqual({ id: 1, username: "admin_test", role: "admin" });
      expect(cookies).toHaveLength(1);
      expect(cookies[0].name).toBe(ADMIN_COOKIE_NAME);
      expect(cookies[0].options.httpOnly).toBe(true);
      expect(cookies[0].options.sameSite).toBe("lax");
      expect(typeof cookies[0].val).toBe("string");
    });
  });

  describe("adminAuth.logout", () => {
    it("limpia la cookie de sesión de administración", async () => {
      const { ctx, clearedCookies } = createMockContext({
        id: 1,
        username: "admin_test",
        role: "admin",
      });
      const caller = appRouter.createCaller(ctx);

      const res = await caller.adminAuth.logout();
      expect(res.success).toBe(true);
      expect(clearedCookies).toHaveLength(1);
      expect(clearedCookies[0].name).toBe(ADMIN_COOKIE_NAME);
    });
  });

  describe("adminAuth.me", () => {
    it("devuelve null cuando no hay sesión activa", async () => {
      const { ctx } = createMockContext(null);
      const caller = appRouter.createCaller(ctx);
      const user = await caller.adminAuth.me();
      expect(user).toBeNull();
    });

    it("devuelve los datos de la sesión activa", async () => {
      const { ctx } = createMockContext({ id: 5, username: "observador", role: "viewer" });
      const caller = appRouter.createCaller(ctx);
      const user = await caller.adminAuth.me();
      expect(user).toEqual({ id: 5, username: "observador", role: "viewer" });
    });
  });

  describe("Control de roles: viewerProcedure vs adminProcedure", () => {
    it("permite ver analíticas a usuarios con rol viewer", async () => {
      const { ctx } = createMockContext({ id: 2, username: "observador", role: "viewer" });
      const caller = appRouter.createCaller(ctx);
      const analytics = await caller.vocational.analytics();
      expect(analytics).toBeDefined();
    });

    it("permite ver analíticas a usuarios con rol admin", async () => {
      const { ctx } = createMockContext({ id: 1, username: "coord", role: "admin" });
      const caller = appRouter.createCaller(ctx);
      const analytics = await caller.vocational.analytics();
      expect(analytics).toBeDefined();
    });

    it("bloquea el acceso a analíticas a usuarios no autenticados", async () => {
      const { ctx } = createMockContext(null);
      const caller = appRouter.createCaller(ctx);
      await expect(caller.vocational.analytics()).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      });
    });

    it("bloquea exportCsv a usuarios con rol viewer", async () => {
      const { ctx } = createMockContext({ id: 2, username: "observador", role: "viewer" });
      const caller = appRouter.createCaller(ctx);
      await expect(caller.vocational.exportCsv()).rejects.toMatchObject({
        code: "FORBIDDEN",
      });
    });

    it("bloquea createResetChallenge a usuarios con rol viewer", async () => {
      const { ctx } = createMockContext({ id: 2, username: "observador", role: "viewer" });
      const caller = appRouter.createCaller(ctx);
      await expect(caller.vocational.createResetChallenge()).rejects.toMatchObject({
        code: "FORBIDDEN",
      });
    });
  });
});
