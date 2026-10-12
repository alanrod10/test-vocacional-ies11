import { desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import bcrypt from "bcryptjs";
import { AdminUser, adminUsers, InsertAdminUser, InsertUser, vocationalAdminActions, vocationalAssessments, users } from "../drizzle/schema";
import {
  CATALOG_VERSION,
  EXPO_CATALOG_VERSION,
  getOptionLabelForQuestionnaireVersion,
  LEGACY_CATALOG_VERSION,
  LEGACY_PROGRAM_NAMES,
  LEGACY_PROGRAMS,
  PROGRAM_CATALOG,
  PROGRAM_NAMES,
  PROGRAMS,
  QUESTIONS,
  RETIRED_PROGRAM,
  selectionsToIndices,
} from "../shared/vocational";
import { applyPrivacySuppression, DistributionItem } from "./privacySuppression";
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
  firstName?: string | null;
  lastName?: string | null;
  age?: number | null;
  ageGroup?: string | null;
  sex: string;
  studyIntent: string;
  locality: string;
  educationStatus: string;
  dataConsent: boolean;
  resultProgram: string;
  resultArea: string;
  selections: Record<string, string> | number[];
  scoreSnapshot: { id?: string; program: string; score: number; area: string }[];
  questionnaireVersion: string;
  catalogVersion: string;
  engineVersion?: string;
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

export type AggregatedCatalogView = {
  version: string;
  label: string;
  programCount: number;
  isConsolidated?: boolean;
  total: number;
  averageAge: number;
  tieCount: number;
  tieRate: number;
  topProgram: { program: string; count: number; area: string } | null;
  ranking: { program: string; area: string; count: number }[];
  topThreeRanking: { program: string; area: string; first: number; second: number; third: number; count: number }[];
  areaDistribution: DistributionItem[];
  sexDistribution: DistributionItem[];
  ageDistribution: DistributionItem[];
  localityDistribution: DistributionItem[];
  educationDistribution: DistributionItem[];
  studyIntentDistribution: DistributionItem[];
};

export type AggregatedAnalyticsResult = AggregatedCatalogView & {
  totalAll: number;
  catalogViews: AggregatedCatalogView[];
  unknownCatalogTotal: number;
  unknownCatalogVersions: string[];
};

function buildEmptyCatalogView(
  version: string,
  label: string,
  programNames: string[],
  programs: Record<string, { area: string }>,
  isConsolidated = false
): AggregatedCatalogView {
  return {
    version,
    label,
    programCount: programNames.length,
    isConsolidated,
    total: 0,
    averageAge: 0,
    tieCount: 0,
    tieRate: 0,
    topProgram: null,
    ranking: programNames.map((program) => ({
      program,
      area: programs[program]?.area ?? "Otras",
      count: 0,
    })),
    topThreeRanking: programNames.map((program) => ({
      program,
      area: programs[program]?.area ?? "Otras",
      first: 0,
      second: 0,
      third: 0,
      count: 0,
    })),
    areaDistribution: [],
    sexDistribution: [],
    ageDistribution: [],
    localityDistribution: [],
    educationDistribution: [],
    studyIntentDistribution: [],
  };
}

/**
 * Consulta y agrupa las estadísticas analíticas directamente en el motor de base de datos SQL (Drizzle).
 * No carga registros individuales ni datos PII en memoria RAM.
 * Aplica supresión estricta de grupos menores a 3 con supresión complementaria (S6).
 */
export async function getAggregatedAnalytics(catalogVersionFilter?: string): Promise<AggregatedAnalyticsResult> {
  const expo18Programs = PROGRAM_CATALOG.filter((p) => p.name !== RETIRED_PROGRAM && p.name !== "TS en Acompañamiento Terapéutico");
  const expo18ProgramNames = expo18Programs.map((p) => p.name);
  const expo18ProgramsRecord = Object.fromEntries(expo18Programs.map((p) => [p.name, p]));
  const consolidatedProgramNames = Array.from(new Set([...LEGACY_PROGRAM_NAMES, ...PROGRAM_NAMES]));
  const consolidatedPrograms = { ...LEGACY_PROGRAMS, ...PROGRAMS };

  const emptyViews: AggregatedCatalogView[] = [
    buildEmptyCatalogView(LEGACY_CATALOG_VERSION, "Catálogo histórico de 19 tecnicaturas", LEGACY_PROGRAM_NAMES, LEGACY_PROGRAMS),
    buildEmptyCatalogView(EXPO_CATALOG_VERSION, "Oferta oficial Expo 2026 (18 tecnicaturas)", expo18ProgramNames, expo18ProgramsRecord),
    buildEmptyCatalogView(CATALOG_VERSION, "Oferta oficial vigente de 17 tecnicaturas", PROGRAM_NAMES, PROGRAMS),
    buildEmptyCatalogView("2026.08-historico-consolidado", "Consolidado histórico (17 + 18 + 19 TS)", consolidatedProgramNames, consolidatedPrograms, true),
  ];

  const db = await getDb();
  if (!db) {
    const active = (catalogVersionFilter ? emptyViews.find((v) => v.version === catalogVersionFilter) : undefined) ?? emptyViews[2] ?? emptyViews[0];
    return {
      ...active,
      totalAll: 0,
      catalogViews: emptyViews,
      unknownCatalogTotal: 0,
      unknownCatalogVersions: [],
    };
  }

  try {
    // 1. Totales y KPIs agrupados por versión de catálogo
    const summaryRows = await db
      .select({
        catalogVersion: vocationalAssessments.catalogVersion,
        total: sql<number>`count(*)`,
        averageAge: sql<number>`coalesce(round(avg(case when ${vocationalAssessments.age} is not null and ${vocationalAssessments.age} > 0 then ${vocationalAssessments.age} else null end), 1), 0)`,
        tieCount: sql<number>`coalesce(sum(case when json_extract(${vocationalAssessments.scoreSnapshot}, '$[0].score') = json_extract(${vocationalAssessments.scoreSnapshot}, '$[1].score') then 1 else 0 end), 0)`,
      })
      .from(vocationalAssessments)
      .groupBy(vocationalAssessments.catalogVersion);

  // 2. Ranking de programas (Top 1)
  const programRows = await db
    .select({
      catalogVersion: vocationalAssessments.catalogVersion,
      program: vocationalAssessments.resultProgram,
      area: vocationalAssessments.resultArea,
      count: sql<number>`count(*)`,
    })
    .from(vocationalAssessments)
    .groupBy(vocationalAssessments.catalogVersion, vocationalAssessments.resultProgram, vocationalAssessments.resultArea);

  // 3. Top 3 colocaciones
  const firstRows = await db
    .select({
      catalogVersion: vocationalAssessments.catalogVersion,
      program: sql<string>`coalesce(json_unquote(json_extract(${vocationalAssessments.scoreSnapshot}, '$[0].program')), ${vocationalAssessments.resultProgram})`,
      count: sql<number>`count(*)`,
    })
    .from(vocationalAssessments)
    .groupBy(vocationalAssessments.catalogVersion, sql`coalesce(json_unquote(json_extract(${vocationalAssessments.scoreSnapshot}, '$[0].program')), ${vocationalAssessments.resultProgram})`);

  const secondRows = await db
    .select({
      catalogVersion: vocationalAssessments.catalogVersion,
      program: sql<string>`json_unquote(json_extract(${vocationalAssessments.scoreSnapshot}, '$[1].program'))`,
      count: sql<number>`count(*)`,
    })
    .from(vocationalAssessments)
    .where(sql`json_extract(${vocationalAssessments.scoreSnapshot}, '$[1].program') is not null`)
    .groupBy(vocationalAssessments.catalogVersion, sql`json_unquote(json_extract(${vocationalAssessments.scoreSnapshot}, '$[1].program'))`);

  const thirdRows = await db
    .select({
      catalogVersion: vocationalAssessments.catalogVersion,
      program: sql<string>`json_unquote(json_extract(${vocationalAssessments.scoreSnapshot}, '$[2].program'))`,
      count: sql<number>`count(*)`,
    })
    .from(vocationalAssessments)
    .where(sql`json_extract(${vocationalAssessments.scoreSnapshot}, '$[2].program') is not null`)
    .groupBy(vocationalAssessments.catalogVersion, sql`json_unquote(json_extract(${vocationalAssessments.scoreSnapshot}, '$[2].program'))`);

  // 4. Áreas
  const areaRows = await db
    .select({
      catalogVersion: vocationalAssessments.catalogVersion,
      area: vocationalAssessments.resultArea,
      count: sql<number>`count(*)`,
    })
    .from(vocationalAssessments)
    .groupBy(vocationalAssessments.catalogVersion, vocationalAssessments.resultArea);

  // 5. Demografía: Sexo
  const sexRows = await db
    .select({
      catalogVersion: vocationalAssessments.catalogVersion,
      sex: vocationalAssessments.sex,
      count: sql<number>`count(*)`,
    })
    .from(vocationalAssessments)
    .groupBy(vocationalAssessments.catalogVersion, vocationalAssessments.sex);

  // 6. Demografía: Grupos de Edad
  const ageGroupExpr = sql<string>`case
    when ${vocationalAssessments.age} is not null and ${vocationalAssessments.age} > 0 then
      case
        when ${vocationalAssessments.age} < 18 then '<18'
        when ${vocationalAssessments.age} <= 24 then '18–24'
        when ${vocationalAssessments.age} <= 34 then '25–34'
        else '35+'
      end
    when ${vocationalAssessments.ageGroup} in ('13-15', '16-18') then '<18'
    when ${vocationalAssessments.ageGroup} = '19-25' then '18–24'
    when ${vocationalAssessments.ageGroup} = '26+' then '25–34'
    else 'No informado'
  end`;

  const ageRows = await db
    .select({
      catalogVersion: vocationalAssessments.catalogVersion,
      ageGroup: ageGroupExpr,
      count: sql<number>`count(*)`,
    })
    .from(vocationalAssessments)
    .groupBy(vocationalAssessments.catalogVersion, ageGroupExpr);

  // 7. Demografía: Localidad
  const localityRows = await db
    .select({
      catalogVersion: vocationalAssessments.catalogVersion,
      locality: vocationalAssessments.locality,
      count: sql<number>`count(*)`,
    })
    .from(vocationalAssessments)
    .groupBy(vocationalAssessments.catalogVersion, vocationalAssessments.locality);

  // 8. Demografía: Situación Educativa
  const educationRows = await db
    .select({
      catalogVersion: vocationalAssessments.catalogVersion,
      educationStatus: vocationalAssessments.educationStatus,
      count: sql<number>`count(*)`,
    })
    .from(vocationalAssessments)
    .groupBy(vocationalAssessments.catalogVersion, vocationalAssessments.educationStatus);

  // 9. Intención de Estudio
  const studyIntentRows = await db
    .select({
      catalogVersion: vocationalAssessments.catalogVersion,
      studyIntent: vocationalAssessments.studyIntent,
      count: sql<number>`count(*)`,
    })
    .from(vocationalAssessments)
    .groupBy(vocationalAssessments.catalogVersion, vocationalAssessments.studyIntent);

  const recognizedVersions = [LEGACY_CATALOG_VERSION, EXPO_CATALOG_VERSION, CATALOG_VERSION];
  const totalAll = summaryRows.reduce((acc, row) => acc + Number(row.total || 0), 0);
  const unknownRows = summaryRows.filter((r) => !recognizedVersions.includes(r.catalogVersion));
  const unknownCatalogTotal = unknownRows.reduce((acc, r) => acc + Number(r.total || 0), 0);
  const unknownCatalogVersions = Array.from(new Set(unknownRows.map((r) => r.catalogVersion)));

  const buildCatalogView = (
    version: string,
    label: string,
    programNames: string[],
    programs: Record<string, { area: string }>,
    versionFilter: (v: string) => boolean,
    isConsolidated = false
  ): AggregatedCatalogView => {
    const matchingSummaries = summaryRows.filter((r) => versionFilter(r.catalogVersion));
    const total = matchingSummaries.reduce((acc, r) => acc + Number(r.total || 0), 0);
    const tieCount = matchingSummaries.reduce((acc, r) => acc + Number(r.tieCount || 0), 0);
    const tieRate = total > 0 ? Number(((tieCount / total) * 100).toFixed(1)) : 0;

    let averageAge = 0;
    if (total > 0) {
      const sumAge = matchingSummaries.reduce((acc, r) => acc + Number(r.averageAge || 0) * Number(r.total || 0), 0);
      averageAge = Number((sumAge / total).toFixed(1));
    }

    const progCounts: Record<string, number> = {};
    programRows
      .filter((r) => versionFilter(r.catalogVersion))
      .forEach((r) => {
        progCounts[r.program] = (progCounts[r.program] || 0) + Number(r.count || 0);
      });

    const ranking = programNames
      .map((program) => ({
        program,
        area: programs[program]?.area ?? "Otras",
        count: progCounts[program] ?? 0,
      }))
      .sort((a, b) => b.count - a.count || a.program.localeCompare(b.program));

    const firstCounts: Record<string, number> = {};
    firstRows.filter((r) => versionFilter(r.catalogVersion)).forEach((r) => { firstCounts[r.program] = (firstCounts[r.program] || 0) + Number(r.count || 0); });
    const secondCounts: Record<string, number> = {};
    secondRows.filter((r) => versionFilter(r.catalogVersion)).forEach((r) => { secondCounts[r.program] = (secondCounts[r.program] || 0) + Number(r.count || 0); });
    const thirdCounts: Record<string, number> = {};
    thirdRows.filter((r) => versionFilter(r.catalogVersion)).forEach((r) => { thirdCounts[r.program] = (thirdCounts[r.program] || 0) + Number(r.count || 0); });

    const topThreeRanking = programNames
      .map((program) => {
        const first = firstCounts[program] || 0;
        const second = secondCounts[program] || 0;
        const third = thirdCounts[program] || 0;
        return {
          program,
          area: programs[program]?.area ?? "Otras",
          first,
          second,
          third,
          count: first + second + third,
        };
      })
      .sort((a, b) => b.count - a.count || b.first - a.first || a.program.localeCompare(b.program));

    const areaCounts: Record<string, number> = {};
    areaRows.filter((r) => versionFilter(r.catalogVersion)).forEach((r) => { areaCounts[r.area] = (areaCounts[r.area] || 0) + Number(r.count || 0); });
    const areaDistribution = Object.entries(areaCounts).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);

    // Demográficos con Supresión Estricta N < 3 y Complementaria
    const sexCounts: Record<string, number> = {};
    sexRows.filter((r) => versionFilter(r.catalogVersion)).forEach((r) => { sexCounts[r.sex] = (sexCounts[r.sex] || 0) + Number(r.count || 0); });
    const sexDistribution = applyPrivacySuppression(Object.entries(sexCounts).map(([label, value]) => ({ label, value })));

    const ageCounts: Record<string, number> = {};
    ageRows.filter((r) => versionFilter(r.catalogVersion)).forEach((r) => { ageCounts[r.ageGroup] = (ageCounts[r.ageGroup] || 0) + Number(r.count || 0); });
    const ageDistribution = applyPrivacySuppression(Object.entries(ageCounts).map(([label, value]) => ({ label, value })));

    const localityCounts: Record<string, number> = {};
    localityRows.filter((r) => versionFilter(r.catalogVersion)).forEach((r) => { localityCounts[r.locality] = (localityCounts[r.locality] || 0) + Number(r.count || 0); });
    const localityDistribution = applyPrivacySuppression(Object.entries(localityCounts).map(([label, value]) => ({ label, value })));

    const educationCounts: Record<string, number> = {};
    educationRows.filter((r) => versionFilter(r.catalogVersion)).forEach((r) => { educationCounts[r.educationStatus] = (educationCounts[r.educationStatus] || 0) + Number(r.count || 0); });
    const educationDistribution = applyPrivacySuppression(Object.entries(educationCounts).map(([label, value]) => ({ label, value })));

    const studyIntentCounts: Record<string, number> = {};
    studyIntentRows.filter((r) => versionFilter(r.catalogVersion)).forEach((r) => { studyIntentCounts[r.studyIntent] = (studyIntentCounts[r.studyIntent] || 0) + Number(r.count || 0); });
    const studyIntentDistribution = applyPrivacySuppression(Object.entries(studyIntentCounts).map(([label, value]) => ({ label, value })));

    return {
      version,
      label,
      programCount: programNames.length,
      isConsolidated,
      total,
      averageAge,
      tieCount,
      tieRate,
      topProgram: ranking[0] ?? null,
      ranking,
      topThreeRanking,
      areaDistribution,
      sexDistribution,
      ageDistribution,
      localityDistribution,
      educationDistribution,
      studyIntentDistribution,
    };
  };

  const catalogViews: AggregatedCatalogView[] = [
    buildCatalogView(LEGACY_CATALOG_VERSION, "Catálogo histórico de 19 tecnicaturas", LEGACY_PROGRAM_NAMES, LEGACY_PROGRAMS, (v) => v === LEGACY_CATALOG_VERSION),
    buildCatalogView(EXPO_CATALOG_VERSION, "Oferta oficial Expo 2026 (18 tecnicaturas)", expo18ProgramNames, expo18ProgramsRecord, (v) => v === EXPO_CATALOG_VERSION),
    buildCatalogView(CATALOG_VERSION, "Oferta oficial vigente de 17 tecnicaturas", PROGRAM_NAMES, PROGRAMS, (v) => v === CATALOG_VERSION),
    buildCatalogView("2026.08-historico-consolidado", "Consolidado histórico (17 + 18 + 19 TS)", consolidatedProgramNames, consolidatedPrograms, (v) => recognizedVersions.includes(v), true),
  ];

  const active =
    (catalogVersionFilter ? catalogViews.find((v) => v.version === catalogVersionFilter) : undefined) ??
    catalogViews.find((v) => v.version === CATALOG_VERSION && v.total > 0) ??
    catalogViews.find((v) => v.version === EXPO_CATALOG_VERSION && v.total > 0) ??
    catalogViews.find((v) => v.version === LEGACY_CATALOG_VERSION) ??
    catalogViews[0];

    return {
      ...active,
      totalAll,
      catalogViews,
      unknownCatalogTotal,
      unknownCatalogVersions,
    };
  } catch (error) {
    console.warn("[Database] Cannot execute aggregated analytics query (database unavailable or disconnected):", error);
    const active =
      (catalogVersionFilter ? emptyViews.find((v) => v.version === catalogVersionFilter) : undefined) ??
      emptyViews[2] ??
      emptyViews[0];
    return {
      ...active,
      totalAll: 0,
      catalogViews: emptyViews,
      unknownCatalogTotal: 0,
      unknownCatalogVersions: [],
    };
  }
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

function getAnswerColumns(questionnaireVersion: string, selections: Record<string, string> | number[]) {
  const indices = selectionsToIndices(selections);
  return QUESTIONS.flatMap((question, index) => {
    const selection = indices[index];
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
  const isHistorical = (process.env.INSTANCE_MODE || "historical") === "historical";
  const headers = [
    "ID", "Fecha_UTC", "Fecha_Argentina_Jujuy", "Version_Cuestionario", "Version_Catalogo", "Nombre", "Apellido", "Edad", "Grupo_Edad", "Sexo",
    "Localidad", "Situacion_Educativa", "Consentimiento_Datos",
    "Intencion_Estudiar_IES11", "Tecnicatura_Recomendada", "Area",
    ...QUESTIONS.flatMap((question) => {
      const prefix = `P${String(question.numericId).padStart(2, "0")}`;
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
    isHistorical ? (row.firstName ?? "") : "",
    isHistorical ? (row.lastName ?? "") : "",
    row.age ?? "",
    row.ageGroup ?? "",
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

export async function deleteVocationalAssessment(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("La base de datos no está disponible.");
  const result = await db.delete(vocationalAssessments).where(eq(vocationalAssessments.id, id));
  return Number(result[0].affectedRows ?? 0) > 0;
}

export async function deleteAllVocationalAssessments() {
  const db = await getDb();
  if (!db) throw new Error("La base de datos no está disponible.");
  const result = await db.delete(vocationalAssessments);
  return Number(result[0].affectedRows ?? 0);
}

export async function recordVocationalAdminAction(
  action: string,
  outcome: "success" | "denied",
  metadata: Record<string, unknown>,
  ipAddress?: string | null,
  actor?: string
) {
  const db = await getDb();
  if (!db) return;
  await db.insert(vocationalAdminActions).values({
    action,
    outcome,
    metadata,
    ipAddress: ipAddress ?? null,
    actor: actor ?? "admin",
  });
}

export async function getAdminUserByUsername(username: string): Promise<AdminUser | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(adminUsers).where(eq(adminUsers.username, username)).limit(1);
  return result[0];
}

export async function getAdminUserById(id: number): Promise<AdminUser | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(adminUsers).where(eq(adminUsers.id, id)).limit(1);
  return result[0];
}

export async function countAdminUsers(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select().from(adminUsers);
  return result.length;
}

export async function createAdminUser(user: { username: string; passwordHash: string; role?: "viewer" | "admin" }): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("La base de datos no está disponible.");
  const result = await db.insert(adminUsers).values({
    username: user.username,
    passwordHash: user.passwordHash,
    role: user.role ?? "viewer",
  });
  return Number(result[0].insertId);
}

export async function seedInitialAdminUser(): Promise<void> {
  const initialUsername = (process.env.ADMIN_INITIAL_USER || "admin").trim();
  const initialPassword = (process.env.ADMIN_INITIAL_PASSWORD || process.env.ADMIN_ACTION_PASSWORD)?.trim();

  if (!initialPassword) {
    return;
  }

  const db = await getDb();
  if (!db) return;

  try {
    const existing = await countAdminUsers();
    if (existing === 0) {
      const passwordHash = await bcrypt.hash(initialPassword, 10);
      await db.insert(adminUsers).values({
        username: initialUsername,
        passwordHash,
        role: "admin",
      });
      console.log(`[Seguridad] Administrador inicial sembrado: ${initialUsername}`);
    }
  } catch (error) {
    console.warn("[Seguridad] No se pudo verificar o sembrar el usuario administrador inicial:", error);
  }
}
