import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { cvs } from "@server/modules/cv/infrastructure/db/cv.schema";
import { eq, desc } from "drizzle-orm";
import { exec } from "child_process";
import { writeFile, readFile, unlink, mkdir } from "fs/promises";
import { join } from "path";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  try {
    // Get latest CV record
    const userCvs = await db
      .select()
      .from(cvs)
      .where(eq(cvs.userId, userId))
      .orderBy(desc(cvs.createdAt))
      .limit(1);

    if (userCvs.length === 0 || !userCvs[0].latexContent) {
      return NextResponse.json({ error: "No LaTeX CV found. Please upload a CV first." }, { status: 404 });
    }

    const latexSource = userCvs[0].latexContent;
    const safeId = userId.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 16);

    // Create temp directory
    const tmpDir = join("/tmp", `cv_${safeId}`);
    await mkdir(tmpDir, { recursive: true });

    const texFile = join(tmpDir, "cv.tex");
    const pdfFile = join(tmpDir, "cv.pdf");

    // Write the .tex file
    await writeFile(texFile, latexSource, "utf-8");

    // Compile with pdflatex (run twice for proper rendering)
    await execAsync(`/usr/bin/pdflatex -interaction=nonstopmode -output-directory="${tmpDir}" "${texFile}"`, {
      timeout: 30000,
    }).catch(() => {
      // Run a second time to resolve references even if first pass has warnings
    });

    // Second pass
    await execAsync(`/usr/bin/pdflatex -interaction=nonstopmode -output-directory="${tmpDir}" "${texFile}"`, {
      timeout: 30000,
    });

    // Read the PDF
    const pdfBuffer = await readFile(pdfFile);

    // Cleanup temp files (fire and forget)
    execAsync(`rm -rf "${tmpDir}"`).catch(() => {});

    // Return the PDF
    const userName = userCvs[0].parsedProfile?.fullName || "CV";
    const safeFileName = userName.replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, "_");

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeFileName}_Harvard_CV.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("[export-pdf] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF. Make sure pdflatex is installed." },
      { status: 500 }
    );
  }
}
