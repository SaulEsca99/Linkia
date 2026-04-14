import { relations } from "drizzle-orm";
import { user } from "@server/modules/identity/infrastructure/db/auth.schema";
import { cvs } from "@server/modules/cv/infrastructure/db/cv.schema";
import { jobSearches } from "@server/modules/jobs/infrastructure/db/job-search.schema";
import { matches } from "@server/modules/match/infrastructure/db/match.schema";

// ── User relations ──────────────────────────────────────────────────────
export const userRelations = relations(user, ({ many }) => ({
  cvs: many(cvs),
  jobSearches: many(jobSearches),
  matches: many(matches),
}));

// ── CV relations ────────────────────────────────────────────────────────
export const cvRelations = relations(cvs, ({ one, many }) => ({
  user: one(user, {
    fields: [cvs.userId],
    references: [user.id],
  }),
  matches: many(matches),
}));

// ── Job Search relations ────────────────────────────────────────────────
export const jobSearchRelations = relations(jobSearches, ({ one, many }) => ({
  user: one(user, {
    fields: [jobSearches.userId],
    references: [user.id],
  }),
  matches: many(matches),
}));

// ── Match relations ─────────────────────────────────────────────────────
export const matchRelations = relations(matches, ({ one }) => ({
  user: one(user, {
    fields: [matches.userId],
    references: [user.id],
  }),
  cv: one(cvs, {
    fields: [matches.cvId],
    references: [cvs.id],
  }),
  jobSearch: one(jobSearches, {
    fields: [matches.jobSearchId],
    references: [jobSearches.id],
  }),
}));
