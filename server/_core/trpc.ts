import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

// Middleware para usuarios con rol de visualizador o superior (viewer o admin)
const requireViewer = t.middleware(async (opts) => {
  const { ctx, next } = opts;

  if (!ctx.adminUser) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Se requiere iniciar sesión en el panel de administración.",
    });
  }

  return next({
    ctx: {
      ...ctx,
      adminUser: ctx.adminUser,
    },
  });
});

// Middleware para acciones exclusivas de administradores (rol admin)
const requireAdmin = t.middleware(async (opts) => {
  const { ctx, next } = opts;

  if (!ctx.adminUser) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Se requiere iniciar sesión en el panel de administración.",
    });
  }

  if (ctx.adminUser.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Se requieren permisos de administrador (rol admin) para realizar esta acción.",
    });
  }

  return next({
    ctx: {
      ...ctx,
      adminUser: ctx.adminUser,
    },
  });
});

export const viewerProcedure = t.procedure.use(requireViewer);
export const adminProcedure = t.procedure.use(requireAdmin);
