"use server";

import { db } from "@/server/db";
import { cvs } from "@server/modules/cv/infrastructure/db/cv.schema";
import { eq, desc } from "drizzle-orm";
import type { ParsedProfile } from "@server/modules/cv/infrastructure/db/cv.schema";

export async function getCvAction(userId: string) {
  try {
    const userCvs = await db
      .select()
      .from(cvs)
      .where(eq(cvs.userId, userId))
      .orderBy(desc(cvs.createdAt))
      .limit(1);

    if (userCvs.length === 0) {
      return { success: true, cv: null };
    }

    return { 
      success: true, 
      cv: {
        id: userCvs[0].id,
        parsedProfile: userCvs[0].parsedProfile as ParsedProfile,
        latexContent: userCvs[0].latexContent,
        originalFileName: userCvs[0].originalFileName,
        createdAt: userCvs[0].createdAt
      }
    };
  } catch (error) {
    console.error("[getCvAction] Error:", error);
    return { success: false, error: "Error al obtener el CV de la base de datos" };
  }
}
