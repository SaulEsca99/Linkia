/**
 * Endpoint SOLO PARA DESARROLLO — resetea el rate limit del caché de empleos.
 * Eliminar antes de producción.
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { jobsCache } from "@server/modules/jobs/jobs-cache.schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "No disponible en producción" }, { status: 403 });
  }

  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  const twentyFiveHoursAgo = new Date(Date.now() - 25 * 60 * 60 * 1000);

  await db.update(jobsCache).set({
    refreshCount: 0,
    dailyResetAt: twentyFiveHoursAgo,
  }).where(eq(jobsCache.userId, userId));

  return NextResponse.json({ success: true, message: "Rate limit reseteado. Ya puedes buscar empleos." });
}
