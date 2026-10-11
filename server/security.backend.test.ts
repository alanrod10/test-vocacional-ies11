import { describe, expect, it, vi } from "vitest";
import { validateEnvironmentSecrets } from "./_core/index";
import { extractClientIp } from "./_core/context";

describe("seguridad backend (S1 a S10)", () => {
  describe("S1: validación de secretos de arranque", () => {
    it("arroja error si JWT_SECRET no está definido o está vacío", () => {
      const prevJwt = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;
      expect(() => validateEnvironmentSecrets()).toThrowError(/JWT_SECRET/);
      process.env.JWT_SECRET = "   ";
      expect(() => validateEnvironmentSecrets()).toThrowError(/JWT_SECRET/);
      process.env.JWT_SECRET = prevJwt;
    });

    it("arroja error si ADMIN_ACTION_PASSWORD no está definido o está vacío", () => {
      const prevAdmin = process.env.ADMIN_ACTION_PASSWORD;
      delete process.env.ADMIN_ACTION_PASSWORD;
      expect(() => validateEnvironmentSecrets()).toThrowError(/ADMIN_ACTION_PASSWORD/);
      process.env.ADMIN_ACTION_PASSWORD = "   ";
      expect(() => validateEnvironmentSecrets()).toThrowError(/ADMIN_ACTION_PASSWORD/);
      process.env.ADMIN_ACTION_PASSWORD = prevAdmin;
    });

    it("pasa exitosamente cuando ambos secretos están provistos", () => {
      expect(() => validateEnvironmentSecrets()).not.toThrow();
    });
  });

  describe("S9: extracción de IP de red para la bitácora", () => {
    it("prioriza req.ip cuando está disponible (trust proxy activo)", () => {
      const req = {
        ip: "203.0.113.195",
        headers: { "x-forwarded-for": "198.51.100.1" },
      } as any;
      expect(extractClientIp(req)).toBe("203.0.113.195");
    });

    it("extrae la primera IP de x-forwarded-for si req.ip no está presente", () => {
      const req = {
        headers: { "x-forwarded-for": "198.51.100.42, 10.0.0.1" },
      } as any;
      expect(extractClientIp(req)).toBe("198.51.100.42");
    });

    it("utiliza socket.remoteAddress o fallback local si no hay cabeceras proxy", () => {
      const reqSocket = {
        headers: {},
        socket: { remoteAddress: "192.168.1.50" },
      } as any;
      expect(extractClientIp(reqSocket)).toBe("192.168.1.50");

      const reqEmpty = { headers: {} } as any;
      expect(extractClientIp(reqEmpty)).toBe("127.0.0.1");
    });
  });
});
