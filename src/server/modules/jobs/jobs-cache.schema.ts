import { pgTable, text, timestamp, jsonb, integer, boolean } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { user } from "@server/modules/identity/infrastructure/db/auth.schema";
import type { JobListing } from "@server/modules/jobs/jobs.service";

/**
 * Cache de vacantes por usuario.
 * - Se llena automáticamente al subir un CV.
 * - El usuario puede pedir refresh manual (máx 3/día).
 * - TTL de 24 horas para auto-refresh.
 */
export const jobsCache = pgTable("jobs_cache", {
  id: text("id").primaryKey().$defaultFn(() => createId()),

  userId: text("user_id")
    .notNull()
    .unique() // One cache record per user
    .references(() => user.id, { onDelete: "cascade" }),

  // Cached job listings as JSONB array
  jobs: jsonb("jobs").$type<JobListing[]>().notNull().default([]),

  // Search query used to fetch jobs
  searchQuery: text("search_query").notNull().default(""),

  // Rate limiting
  refreshCount: integer("refresh_count").notNull().default(0), // Resets daily
  lastRefreshAt: timestamp("last_refresh_at"),
  dailyResetAt: timestamp("daily_reset_at"), // When refreshCount was last reset to 0
  lastSearchFailed: boolean("last_search_failed").notNull().default(false), // evita re-fetch loop

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdateFn(() => new Date()),
});

export type JobsCacheRecord = typeof jobsCache.$inferSelect;
