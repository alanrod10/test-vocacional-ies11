import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, vocationalAdminActions, vocationalAssessments, users } from "../drizzle/schema";
import { getOptionLabelForQuestionnaireVersion, LEGACY_PROGRAM_NAMES, QUESTIONS } from "../shared/vocational";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export type CreateAssessmentInput = {
  firstName: string;
  lastName: string;
  age: number;
  sex: string;
  studyIntent: string;
  locality: string;
  educationStatus: string;
  dataConsent: boolean;
  resultProgram: string;
  resultArea: string;
  selections: number[];
  scoreSnapshot: { program: string; score: number; area: string }[];
  questionnaireVersion: string;
  catalogVersion: string;
};

export async function createVocationalAssessment(input: CreateAssessmentInput) {
  const db = await getDb();
  if (!db) throw new Error("La base de datos no está disponible.");
  const result = await db.insert(vocationalAssessments).values(input);
  return Number(result[0].insertId);
}

export async function listVocationalAssessments() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(vocationalAssessments).orderBy(desc(vocationalAssessments.createdAt));
}

function escapeCsv(value: unknown) {
  const text = value === null || value === undefined ? "" : String(value);
  // Evita que Excel interprete información aportada por una persona como una fórmula.
  const safeText = /^[=+\-@]/.test(text.trimStart()) ? `'${text}` : text;
  return `"${safeText.replace(/"/g, '""')}"`;
}

// Excel en configuraciones regionales en español abre el archivo directamente en
// columnas cuando el delimitador es punto y coma. Las comillas preservan valores
// que contengan comas, punto y coma o saltos de línea.
const CSV_DELIMITER = ";";

function formatUtcDate(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? String(value ?? "") : date.toISOString();
}

function formatJujuyDate(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const values = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Jujuy",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date).reduce<Record<string, string>>((parts, part) => {
    parts[part.type] = part.value;
    return parts;
  }, {});

  return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}:${values.second}-03:00`;
}

function getAnswerColumns(questionnaireVersion: string, selections: number[]) {
  return QUESTIONS.flatMap((question, index) => {
    const selection = selections[index];
    const isValidSelection = Number.isInteger(selection) && selection >= 0;
    return [isValidSelection ? selection + 1 : "", isValidSelection ? getOptionLabelForQuestionnaireVersion(questionnaireVersion, index, selection) : ""];
  });
}

function getAffinityColumns(scoreSnapshot: CreateAssessmentInput["scoreSnapshot"]) {
  return Array.from({ length: LEGACY_PROGRAM_NAMES.length }, (_, index) => {
    const affinity = scoreSnapshot[index];
    return affinity ? [affinity.program, affinity.score, affinity.area] : ["", "", ""];
  }).flat();
}

/** Exportación completa destinada únicamente a personal autorizado del IES N.° 11. */
export function buildVocationalCsv(rows: Awaited<ReturnType<typeof listVocationalAssessments>>) {
  const headers = [
    "ID", "Fecha_UTC", "Fecha_Argentina_Jujuy", "Version_Cuestionario", "Version_Catalogo", "Nombre", "Apellido", "Edad", "Sexo",
    "Localidad", "Situacion_Educativa", "Consentimiento_Datos",
    "Intencion_Estudiar_IES11", "Tecnicatura_Recomendada", "Area",
    ...QUESTIONS.flatMap((question) => {
      const prefix = `P${String(question.id).padStart(2, "0")}`;
      return [`${prefix}_Opcion`, `${prefix}_Texto`];
    }),
    ...Array.from({ length: LEGACY_PROGRAM_NAMES.length }, (_, index) => index + 1).flatMap((position) => [
      `Afinidad_${position}_Carrera`,
      `Afinidad_${position}_Puntaje`,
      `Afinidad_${position}_Area`,
    ]),
  ];
  const values = rows.map((row) => [
    row.id,
    formatUtcDate(row.createdAt),
    formatJujuyDate(row.createdAt),
    row.questionnaireVersion ?? "2026.08-original",
    row.catalogVersion ?? "2026.08-legado-19",
    row.firstName,
    row.lastName,
    row.age,
    row.sex,
    row.locality,
    row.educationStatus,
    row.dataConsent ? "Sí" : "No",
    row.studyIntent,
    row.resultProgram,
    row.resultArea,
    ...getAnswerColumns(row.questionnaireVersion, row.selections),
    ...getAffinityColumns(row.scoreSnapshot),
  ].map(escapeCsv).join(CSV_DELIMITER));

  return `\uFEFF${headers.map(escapeCsv).join(CSV_DELIMITER)}\n${values.join("\n")}`;
}

export async function deleteAllVocationalAssessments() {
  const db = await getDb();
  if (!db) throw new Error("La base de datos no está disponible.");
  const result = await db.delete(vocationalAssessments);
  return Number(result[0].affectedRows ?? 0);
}

export async function recordVocationalAdminAction(action: string, outcome: "success" | "denied", metadata: Record<string, unknown>) {
  const db = await getDb();
  if (!db) return;
  await db.insert(vocationalAdminActions).values({ action, outcome, metadata });
}
