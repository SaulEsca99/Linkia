import type { ParsedProfile } from "@server/modules/cv/infrastructure/db/cv.schema";

export type CvAnalysisResult = {
  success: true;
  profile: ParsedProfile;
  latexContent?: string;
  rawText: string;
} | {
  success: false;
  error: string;
};

export type CvUploadInput = {
  userId: string;
  file: File;
};
