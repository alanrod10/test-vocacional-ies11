import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router, viewerProcedure } from "./_core/trpc";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { TRPCError } from "@trpc/server";
import { buildVocationalCsv, createVocationalAssessment, deleteAllVocationalAssessments, getAdminUserByUsername, listVocationalAssessments, recordVocationalAdminAction } from "./db";
import { clearAdminCookie, setAdminCookie, signAdminToken } from "./_core/adminAuth";
import { CATALOG_VERSION, LEGACY_CATALOG_VERSION, LEGACY_PROGRAM_NAMES, LEGACY_PROGRAMS, PROGRAM_NAMES, PROGRAMS, QUESTIONNAIRE_VERSION, QUESTIONS, getInterestProfile, hasScorableSignal, scoreSelections } from "../shared/vocational";
import { HISTORICAL_ARCHIVE, HISTORICAL_ARCHIVE_MESSAGE } from "../shared/archive";

const assessmentInput = z.object({
  firstName: z.string().trim().min(2).max(80),
  lastName: z.string().trim().min(2).max(80),
  age: z.number().int().min(13).max(99),
  sex: z.enum(["Femenino", "Masculino", "Otro / Prefiero no decir"]),
  studyIntent: z.string().trim().min(2).max(100),
  locality: z.string().trim().min(2).max(120),
  educationStatus: z.string().trim().min(2).max(100),
  dataConsent: z.boolean().refine((value) => value, "Necesitamos tu consentimiento para guardar el resultado."),
  selections: z.array(z.number().int().min(0)).length(QUESTIONS.length),
});

const RESET_CHALLENGE_TTL_MS = 2 * 60 * 1000;
const ADMIN_ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const ADMIN_ATTEMPT_LIMIT = 5;
const BACKUP_RECEIPT_TTL_MS = 10 * 60 * 1000;
const adminAttempts = new Map<string, number[]>();
const backupReceipts = new Map<string, { expiresAt: number; recordCount: number }>();

function clientKey(request: { headers: Record<string, string | string[] | undefined>; socket?: { remoteAddress?: string } }) {
  const forwarded = request.headers["x-forwarded-for"];
  const forwardedValue = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return forwardedValue?.split(",")[0]?.trim() || request.socket?.remoteAddress || "unknown";
}

function enforceAdminRateLimit(request: Parameters<typeof clientKey>[0], action: string) {
  const key = `${action}:${clientKey(request)}`;
  const now = Date.now();
  const attempts = (adminAttempts.get(key) ?? []).filter((timestamp) => now - timestamp < ADMIN_ATTEMPT_WINDOW_MS);
  if (attempts.length >= ADMIN_ATTEMPT_LIMIT) throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Demasiados intentos. Esperá unos minutos antes de volver a intentar." });
  attempts.push(now);
  adminAttempts.set(key, attempts);
}

function clearAdminRateLimit(request: Parameters<typeof clientKey>[0], action: string) {
  adminAttempts.delete(`${action}:${clientKey(request)}`);
}

function requireAdminPasswordConfigured(): string {
  const password = process.env.ADMIN_ACTION_PASSWORD?.trim();
  if (!password) {
    throw new Error("[Seguridad] La variable de entorno ADMIN_ACTION_PASSWORD es obligatoria y no está configurada.");
  }
  return password;
}

function requireJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) {
    throw new Error("[Seguridad] La variable de entorno JWT_SECRET es obligatoria y no está configurada.");
  }
  return secret;
}

function hasValidAdminPassword(password: string) {
  const configuredPassword = requireAdminPasswordConfigured();
  const provided = Buffer.from(password);
  const expected = Buffer.from(configuredPassword);
  return provided.length === expected.length && timingSafeEqual(provided, expected);
}

function requireAdminPassword(password: string) {
  if (!hasValidAdminPassword(password)) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "La contraseña de coordinación no es válida." });
  }
}

function requireOpenHistoricalArchive(action: "assessment" | "reset") {
  const blocked = action === "assessment" ? !HISTORICAL_ARCHIVE.allowNewAssessments : !HISTORICAL_ARCHIVE.allowReset;
  if (HISTORICAL_ARCHIVE.enabled && blocked) {
    throw new TRPCError({ code: "FORBIDDEN", message: HISTORICAL_ARCHIVE_MESSAGE });
  }
}

function createResetChallenge() {
  const payload = `${Date.now()}:${randomUUID()}`;
  const signature = createHmac("sha256", requireJwtSecret())
    .update(payload)
    .digest("base64url");
  return `${Buffer.from(payload).toString("base64url")}.${signature}`;
}

function isValidResetChallenge(challenge: string) {
  const [encodedPayload, signature, extra] = challenge.split(".");
  if (!encodedPayload || !signature || extra) return false;
  let payload = "";
  try {
    payload = Buffer.from(encodedPayload, "base64url").toString("utf8");
  } catch {
    return false;
  }
  const [issuedAtText, nonce, extraPayload] = payload.split(":");
  const issuedAt = Number(issuedAtText);
  if (!issuedAt || !nonce || extraPayload || !Number.isFinite(issuedAt) || Date.now() - issuedAt > RESET_CHALLENGE_TTL_MS || issuedAt > Date.now() + 10_000) return false;
  const expected = createHmac("sha256", requireJwtSecret()).update(payload).digest("base64url");
  const receivedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  return receivedBuffer.length === expectedBuffer.length && timingSafeEqual(receivedBuffer, expectedBuffer);
}

const MIN_PUBLIC_COUNT = 3;

function safeDistribution(counts: Record<string, number>) {
  return Object.entries(counts)
    .filter(([, value]) => value >= MIN_PUBLIC_COUNT)
    .map(([label, value]) => ({ label, value }));
}

function calculateCatalogAnalytics(rows: Awaited<ReturnType<typeof listVocationalAssessments>>, programNames: string[], programs: Record<string, { area: string }>) {
  const total = rows.length;
  const programCounts = Object.fromEntries(programNames.map((program) => [program, 0])) as Record<string, number>;
  const topThreeCounts = Object.fromEntries(programNames.map((program) => [program, { first: 0, second: 0, third: 0, count: 0 }])) as Record<string, { first: number; second: number; third: number; count: number }>;
  const areaCounts: Record<string, number> = {};
  const sexCounts: Record<string, number> = {};
  const ageGroups: Record<string, number> = { "<18": 0, "18–24": 0, "25–34": 0, "35+": 0 };
  const localityCounts: Record<string, number> = {};
  const educationCounts: Record<string, number> = {};

  rows.forEach((row) => {
    programCounts[row.resultProgram] = (programCounts[row.resultProgram] ?? 0) + 1;
    const storedTopThree = row.scoreSnapshot
      .filter((item) => programNames.includes(item.program))
      .slice(0, 3);
    const placements = storedTopThree.length ? storedTopThree : [{ program: row.resultProgram, area: row.resultArea, score: 0 }];
    placements.forEach((item, index) => {
      const counts = topThreeCounts[item.program];
      if (!counts) return;
      if (index === 0) counts.first += 1;
      if (index === 1) counts.second += 1;
      if (index === 2) counts.third += 1;
      counts.count += 1;
    });
    areaCounts[row.resultArea] = (areaCounts[row.resultArea] ?? 0) + 1;
    sexCounts[row.sex] = (sexCounts[row.sex] ?? 0) + 1;
    localityCounts[row.locality] = (localityCounts[row.locality] ?? 0) + 1;
    educationCounts[row.educationStatus] = (educationCounts[row.educationStatus] ?? 0) + 1;
    const group = row.age < 18 ? "<18" : row.age <= 24 ? "18–24" : row.age <= 34 ? "25–34" : "35+";
    ageGroups[group] += 1;
  });

  const ranking = programNames.map((program) => ({
    program,
    area: programs[program].area,
    count: programCounts[program] ?? 0,
  })).sort((a, b) => b.count - a.count || a.program.localeCompare(b.program));

  const topThreeRanking = programNames.map((program) => ({
    program,
    area: programs[program].area,
    ...topThreeCounts[program],
  })).sort((a, b) => b.count - a.count || b.first - a.first || a.program.localeCompare(b.program));

  return {
    total,
    averageAge: total ? Number((rows.reduce((sum, row) => sum + row.age, 0) / total).toFixed(1)) : 0,
    topProgram: ranking[0] ?? null,
    ranking,
    topThreeRanking,
    areaDistribution: safeDistribution(areaCounts),
    sexDistribution: safeDistribution(sexCounts),
    ageDistribution: safeDistribution(ageGroups),
    localityDistribution: safeDistribution(localityCounts),
    educationDistribution: safeDistribution(educationCounts),
  };
}

export function calculateAnalytics(rows: Awaited<ReturnType<typeof listVocationalAssessments>>) {
  const legacyRows = rows.filter((row) => row.catalogVersion === LEGACY_CATALOG_VERSION);
  const officialRows = rows.filter((row) => row.catalogVersion === CATALOG_VERSION);
  const consolidatedProgramNames = Array.from(new Set([...LEGACY_PROGRAM_NAMES, ...PROGRAM_NAMES]));
  const consolidatedPrograms = { ...LEGACY_PROGRAMS, ...PROGRAMS };
  const recognizedRows = [...legacyRows, ...officialRows];
  const unknownRows = rows.filter((row) => row.catalogVersion !== LEGACY_CATALOG_VERSION && row.catalogVersion !== CATALOG_VERSION);
  const catalogViews = [
    { version: LEGACY_CATALOG_VERSION, label: "Catálogo histórico de 19 tecnicaturas", programCount: LEGACY_PROGRAM_NAMES.length, ...calculateCatalogAnalytics(legacyRows, LEGACY_PROGRAM_NAMES, LEGACY_PROGRAMS) },
    { version: CATALOG_VERSION, label: "Oferta oficial vigente de 18 tecnicaturas", programCount: PROGRAM_NAMES.length, ...calculateCatalogAnalytics(officialRows, PROGRAM_NAMES, PROGRAMS) },
    { version: "2026.08-historico-consolidado", label: "Consolidado histórico (18 + 19 TS)", programCount: consolidatedProgramNames.length, isConsolidated: true, ...calculateCatalogAnalytics(recognizedRows, consolidatedProgramNames, consolidatedPrograms) },
  ];
  const active = catalogViews.find((view) => view.version === CATALOG_VERSION && view.total > 0)
    ?? catalogViews.find((view) => view.version === LEGACY_CATALOG_VERSION)
    ?? calculateCatalogAnalytics([], PROGRAM_NAMES, PROGRAMS);

  return { ...active, totalAll: rows.length, catalogViews, unknownCatalogTotal: unknownRows.length, unknownCatalogVersions: Array.from(new Set(unknownRows.map((row) => row.catalogVersion))) };
}

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  adminAuth: router({
    login: publicProcedure
      .input(z.object({ username: z.string().trim().min(1, "El usuario es obligatorio"), password: z.string().min(1, "La contraseña es obligatoria") }))
      .mutation(async ({ input, ctx }) => {
        enforceAdminRateLimit(ctx.req, "admin_login");
        const user = await getAdminUserByUsername(input.username);
        if (!user) {
          await recordVocationalAdminAction("login", "denied", { username: input.username }, ctx.clientIp, input.username);
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Credenciales incorrectas." });
        }
        const matches = await bcrypt.compare(input.password, user.passwordHash);
        if (!matches) {
          await recordVocationalAdminAction("login", "denied", { username: input.username }, ctx.clientIp, input.username);
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Credenciales incorrectas." });
        }
        clearAdminRateLimit(ctx.req, "admin_login");
        const token = await signAdminToken({
          id: user.id,
          username: user.username,
          role: user.role,
        });
        setAdminCookie(ctx.res as any, token);
        await recordVocationalAdminAction("login", "success", { username: user.username, role: user.role }, ctx.clientIp, user.username);
        return {
          success: true,
          user: { id: user.id, username: user.username, role: user.role },
        };
      }),
    logout: publicProcedure.mutation(async ({ ctx }) => {
      if (ctx.adminUser) {
        await recordVocationalAdminAction("logout", "success", {}, ctx.clientIp, ctx.adminUser.username);
      }
      clearAdminCookie(ctx.res as any);
      return { success: true };
    }),
    me: publicProcedure.query(({ ctx }) => {
      return ctx.adminUser;
    }),
  }),

  vocational: router({
    submit: publicProcedure.input(assessmentInput).mutation(async ({ input }) => {
      requireOpenHistoricalArchive("assessment");
      input.selections.forEach((selection, index) => {
        if (selection >= QUESTIONS[index]?.options.length) throw new Error("Hay una respuesta fuera del rango permitido.");
      });
      if (!hasScorableSignal(input.selections)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Para calcular una afinidad, elegí al menos una actividad que te represente.",
        });
      }
      const scores = scoreSelections(input.selections);
      const winner = scores[0];
      if (!winner) throw new Error("No fue posible calcular el resultado.");
      const id = await createVocationalAssessment({
        ...input,
        resultProgram: winner.program,
        resultArea: winner.area,
        scoreSnapshot: scores,
        questionnaireVersion: QUESTIONNAIRE_VERSION,
        catalogVersion: CATALOG_VERSION,
      });
      return { id, winner, topThree: scores.slice(0, 3), interestProfile: getInterestProfile(input.selections) };
    }),
    analytics: viewerProcedure.query(async () => calculateAnalytics(await listVocationalAssessments())),
    exportCsv: adminProcedure.mutation(async ({ ctx }) => {
      enforceAdminRateLimit(ctx.req, "export");
      const actor = ctx.adminUser.username;
      clearAdminRateLimit(ctx.req, "export");
      const rows = await listVocationalAssessments();
      const content = buildVocationalCsv(rows);
      const backupReceipt = randomUUID();
      backupReceipts.set(backupReceipt, { expiresAt: Date.now() + BACKUP_RECEIPT_TTL_MS, recordCount: rows.length });
      await recordVocationalAdminAction("export_csv", "success", { recordCount: rows.length }, ctx.clientIp, actor);
      return {
        content,
        filename: `resultados-vocacional-ies11-${new Date().toISOString().slice(0, 10)}.csv`,
        backupReceipt,
      };
    }),
    createResetChallenge: adminProcedure.mutation(() => {
      requireOpenHistoricalArchive("reset");
      return { challenge: createResetChallenge() };
    }),
    reset: adminProcedure.input(z.object({ challenge: z.string().min(20).max(500), backupReceipt: z.string().uuid() })).mutation(async ({ input, ctx }) => {
      requireOpenHistoricalArchive("reset");
      enforceAdminRateLimit(ctx.req, "reset");
      const actor = ctx.adminUser.username;
      clearAdminRateLimit(ctx.req, "reset");
      if (!isValidResetChallenge(input.challenge)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "La confirmación de reinicio venció o no es válida." });
      }
      const backup = backupReceipts.get(input.backupReceipt);
      if (!backup || backup.expiresAt < Date.now()) throw new TRPCError({ code: "BAD_REQUEST", message: "Antes de reiniciar necesitás descargar una copia reciente del CSV." });
      backupReceipts.delete(input.backupReceipt);
      const deleted = await deleteAllVocationalAssessments();
      await recordVocationalAdminAction("reset", "success", { deleted, backupRecordCount: backup.recordCount }, ctx.clientIp, actor);
      return { deleted };
    }),
  }),
});

export type AppRouter = typeof appRouter;
