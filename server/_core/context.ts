import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
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

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  const clientIp = extractClientIp(opts.req);

  return {
    req: opts.req,
    res: opts.res,
    user,
    clientIp,
  };
}
