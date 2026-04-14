import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { user } from "@server/modules/identity/infrastructure/db/auth.schema";

/**
 * Perfil estructurado del CV extraído por OpenAI
 */
export type ParsedProfile = {
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  summary: string;
  skills: string[];
  experience: {
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
    description: string;
  }[];
  education: {
    degree: string;
    institution: string;
    year: string;
  }[];
  languages: string[];
  certifications?: string[];
};

/**
 * Tabla de CVs subidos por los usuarios
 */
export const cvs = pgTable("cvs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  originalFileName: text("original_file_name").notNull(),

  originalText: text("original_text").notNull(),

  blobUrl: text("blob_url"),

  parsedProfile: jsonb("parsed_profile").$type<ParsedProfile>(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date()),
});

export type CvRecord = typeof cvs.$inferSelect;
export type NewCvRecord = typeof cvs.$inferInsert;
