import { pgTable, text, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { user } from "@server/modules/identity/infrastructure/db/auth.schema";

export const jobSourceEnum = pgEnum("job_source", [
  "occ",
  "indeed",
  "linkedin",
]);

/**
 * Resultado individual de una vacante scrapeada
 */
export type ScrapedJob = {
  title: string;
  company: string;
  location: string;
  salary?: string;
  description: string;
  url: string;
  postedAt?: string;
};

/**
 * Tabla de búsquedas de empleo realizadas
 */
export const jobSearches = pgTable("job_searches", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  keyword: text("keyword").notNull(),
  location: text("location"),

  source: jobSourceEnum("source").notNull().default("occ"),

  results: jsonb("results").$type<ScrapedJob[]>().default([]),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type JobSearchRecord = typeof jobSearches.$inferSelect;
export type NewJobSearchRecord = typeof jobSearches.$inferInsert;
