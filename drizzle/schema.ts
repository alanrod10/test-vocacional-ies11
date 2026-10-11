import { int, json, mysqlEnum, mysqlTable, text, timestamp, tinyint, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** User identifier (openId). Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const vocationalAssessments = mysqlTable("vocational_assessments", {
  id: int("id").autoincrement().primaryKey(),
  firstName: varchar("firstName", { length: 80 }).notNull(),
  lastName: varchar("lastName", { length: 80 }).notNull(),
  age: int("age").notNull(),
  sex: varchar("sex", { length: 40 }).notNull(),
  studyIntent: varchar("studyIntent", { length: 100 }).default("No especificado").notNull(),
  locality: varchar("locality", { length: 120 }).default("No informado").notNull(),
  educationStatus: varchar("educationStatus", { length: 100 }).default("No informado").notNull(),
  dataConsent: tinyint("dataConsent").$type<boolean>().default(false).notNull(),
  resultProgram: varchar("resultProgram", { length: 180 }).notNull(),
  resultArea: varchar("resultArea", { length: 100 }).notNull(),
  selections: json("selections").$type<number[]>().notNull(),
  scoreSnapshot: json("scoreSnapshot").$type<{ program: string; score: number; area: string }[]>().notNull(),
  questionnaireVersion: varchar("questionnaireVersion", { length: 50 }).default("2026.08-original").notNull(),
  catalogVersion: varchar("catalogVersion", { length: 50 }).default("2026.08-legado-19").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const vocationalAdminActions = mysqlTable("vocational_admin_actions", {
  id: int("id").autoincrement().primaryKey(),
  action: varchar("action", { length: 40 }).notNull(),
  outcome: varchar("outcome", { length: 24 }).notNull(),
  metadata: json("metadata").$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VocationalAssessment = typeof vocationalAssessments.$inferSelect;
export type InsertVocationalAssessment = typeof vocationalAssessments.$inferInsert;
