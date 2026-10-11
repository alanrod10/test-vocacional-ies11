import type { Response } from "express";
import { SignJWT, jwtVerify } from "jose";

export const ADMIN_COOKIE_NAME = "admin_session";

export type AdminSessionUser = {
  id: number;
  username: string;
  role: "viewer" | "admin";
};

function getSecretKey() {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) {
    throw new Error("[Seguridad] La variable de entorno JWT_SECRET es obligatoria y no está configurada.");
  }
  return new TextEncoder().encode(secret);
}

export async function signAdminToken(user: AdminSessionUser): Promise<string> {
  const secretKey = getSecretKey();
  return new SignJWT({
    username: user.username,
    role: user.role,
  })
    .setSubject(String(user.id))
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secretKey);
}

export async function verifyAdminToken(token: string): Promise<AdminSessionUser | null> {
  try {
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ["HS256"],
    });

    if (!payload.sub || typeof payload.username !== "string" || !payload.role) {
      return null;
    }

    const role = payload.role as string;
    if (role !== "viewer" && role !== "admin") {
      return null;
    }

    return {
      id: Number(payload.sub),
      username: payload.username,
      role: role as "viewer" | "admin",
    };
  } catch {
    return null;
  }
}

export function setAdminCookie(
  res: Response,
  token: string,
  isProduction = process.env.NODE_ENV === "production"
) {
  if (typeof res?.cookie === "function") {
    res.cookie(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
    });
  }
}

export function clearAdminCookie(
  res: Response,
  isProduction = process.env.NODE_ENV === "production"
) {
  if (typeof res?.clearCookie === "function") {
    res.clearCookie(ADMIN_COOKIE_NAME, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
    });
  }
}
