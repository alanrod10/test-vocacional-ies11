import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { parse as parseCookie } from "cookie";
import { ADMIN_COOKIE_NAME, AdminSessionUser, verifyAdminToken } from "./adminAuth";

export type { AdminSessionUser };

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  adminUser: AdminSessionUser | null;
  clientIp: string;
};

export function extractClientIp(req: CreateExpressContextOptions["req"]): string {
  if (req.ip) return req.ip;
  const forwarded = req.headers["x-forwarded-for"];
  const forwardedValue = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  if (forwardedValue) {
    const firstIp = forwardedValue.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }
  return req.socket?.remoteAddress || "127.0.0.1";
}

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;
  let adminUser: AdminSessionUser | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }

  // Leer y verificar sesión de administrador desde cookie HttpOnly o encabezado Bearer
  try {
    const cookieHeader = opts.req.headers.cookie;
    let token: string | undefined;
    if (cookieHeader) {
      const parsed = parseCookie(cookieHeader);
      token = parsed[ADMIN_COOKIE_NAME];
    }
    if (!token && typeof opts.req.headers.authorization === "string" && opts.req.headers.authorization.startsWith("Bearer ")) {
      token = opts.req.headers.authorization.slice(7);
    }
    if (token) {
      adminUser = await verifyAdminToken(token);
    }
  } catch {
    adminUser = null;
  }

  const clientIp = extractClientIp(opts.req);

  return {
    req: opts.req,
    res: opts.res,
    user,
    adminUser,
    clientIp,
  };
}
