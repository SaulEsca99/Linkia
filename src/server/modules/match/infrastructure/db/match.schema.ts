import {
  pgTable,
  text,
  timestamp,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { user } from "@server/modules/identity/infrastructure/db/auth.schema";
import { cvs } from "@server/modules/cv/infrastructure/db/cv.schema";
import { jobSearches } from "@server/modules/jobs/infrastructure/db/job-search.schema";

export const matchStatusEnum = pgEnum("match_status", [
  "pending",
  "adapted",
  "applied",
]);

/**
 * Tabla de matches — relación CV + Vacante con score de compatibilidad
 */
export const matches = pgTable("matches", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  cvId: text("cv_id")
    .notNull()
    .references(() => cvs.id, { onDelete: "cascade" }),

  jobSearchId: text("job_search_id").references(() => jobSearches.id, {
    onDelete: "set null",
  }),

  jobTitle: text("job_title").notNull(),
  company: text("company").notNull(),
  jobUrl: text("job_url"),

  score: integer("score").notNull().default(0),
  justification: text("justification"),

  adaptedCvText: text("adapted_cv_text"),
  adaptedCvBlobUrl: text("adapted_cv_blob_url"),

  status: matchStatusEnum("status").notNull().default("pending"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type MatchRecord = typeof matches.$inferSelect;
export type NewMatchRecord = typeof matches.$inferInsert;
