import { BetterAuthOptions } from "better-auth";
import { admin } from "better-auth/plugins";

import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware } from "better-auth/api";

import { env } from "@/env";
import { db } from "@/server/db";

import { betterAuthSignUpAdapter } from "../../features/auth-flow/sign-up/sign-up.adapter";

import * as authSchema from "../db/auth.schema";

import { adminOptions } from "./admin.plugin";

export const authConfig = {
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { ...authSchema },
  }),

  user: {
    additionalFields: {
      onboardingCompleted: {
        type: "boolean",
        input: false,
        defaultValue: false,
      },

      role: { type: "string", input: false },

      phone: { type: "string", input: true, required: false },
      birthDate: { type: "date", input: true, required: false },
    },
  },

  emailAndPassword: {
    enabled: true,
  },

  socialProviders: env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
    ? {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
    }
    : {},

  secret: env.BETTER_AUTH_SECRET,

  // Permitir acceso desde localhost y desde la red local (IP del equipo)
  trustedOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    // Red local (cambia si tu IP cambia)
    "http://10.100.67.14:3000",
    // Acepta cualquier origen en desarrollo
    ...(process.env.NODE_ENV === "development" ? [process.env.NEXT_PUBLIC_APP_URL ?? ""] : []),
  ].filter(Boolean),

  advanced: {
    // Deshabilitar la validación de CSRF en desarrollo para evitar bloqueos por IP
    disableCSRFCheck: process.env.NODE_ENV === "development",
    crossSubDomainCookies: {
      enabled: false,
    },
  },

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-up/email") return betterAuthSignUpAdapter(ctx);
    }),
  },

  plugins: [admin(adminOptions)],
} satisfies BetterAuthOptions;
