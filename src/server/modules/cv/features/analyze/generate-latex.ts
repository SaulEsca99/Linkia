import { GoogleGenAI } from "@google/genai";
import type { ParsedProfile } from "@server/modules/cv/infrastructure/db/cv.schema";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "PENDING_KEY",
});

// Load the user's actual LaTeX template as the base
const TEMPLATE_BASE = `\\documentclass[11pt,letterpaper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=0.75in]{geometry}
\\usepackage{enumitem}
\\usepackage{xcolor}
\\usepackage{hyperref}
\\usepackage{titlesec}
\\usepackage{textcomp}

\\hypersetup{
    colorlinks=true,
    urlcolor=blue,
    linkcolor=blue,
}

\\titleformat{\\section}{\\centering\\large\\bfseries}{}{0em}{}[\\titlerule]
\\titlespacing{\\section}{0pt}{12pt}{8pt}

\\pagestyle{empty}
\\setlength{\\parindent}{0pt}
\\setlist{noitemsep, topsep=2pt, leftmargin=18pt}

\\begin{document}

% ============ CONTACT INFORMATION ============
\\begin{center}
    {\\LARGE\\bfseries <FULL_NAME>}\\\\[6pt]
    <CITY>, <COUNTRY>\\\\[2pt]
    <PHONE> \\textbullet{}
    \\href{mailto:<EMAIL>}{<EMAIL>} \\textbullet{}
    \\href{<GITHUB_URL>}{<GITHUB_HANDLE>} \\textbullet{}
    \\href{<LINKEDIN_URL>}{<LINKEDIN_HANDLE>}
\\end{center}

\\noindent
\\rule{\\linewidth}{0.8pt}
\\vspace{6pt}

% PROFESSIONAL SUMMARY
<SUMMARY_PARAGRAPH>

\\vspace{6pt}

% ============ TECHNICAL SKILLS ============
\\section*{Technical Skills}

<SKILLS_INLINE_BY_CATEGORY>

\\vspace{6pt}

% ============ FEATURED PROJECTS ============
\\section*{Featured AI \\& Development Projects}

<PROJECTS_ENTRIES>

\\vspace{6pt}

% ============ EDUCATION ============
\\section*{Education}

<EDUCATION_ENTRIES>

% ============ CERTIFICATIONS ============
\\section*{Certifications \\& Professional Development}

\\begin{itemize}[label=$\\bullet$]
<CERT_ITEMS>
\\end{itemize}

\\end{document}`;

const LATEX_PROMPT = `You are an elite LaTeX typographer and Harvard CV specialist. Your task is to fill in the following LaTeX CV TEMPLATE with real data from the candidate profile provided. Do NOT change the document structure, packages, or formatting commands — only replace the placeholder values.

TEMPLATE TO FILL:
${TEMPLATE_BASE}

FILLING RULES:
1. Replace <FULL_NAME> with the candidate's full name (e.g., Saúl Escamilla Lazcano)
2. Replace <CITY>, <COUNTRY>, <PHONE>, <EMAIL>, <GITHUB_URL>, <GITHUB_HANDLE>, <LINKEDIN_URL>, <LINKEDIN_HANDLE> with actual values from profile. If a URL is missing, use a reasonable guess or omit the \\href and just show the text.
3. <SUMMARY_PARAGRAPH>: Write a concise 2-3 sentence professional summary based on the candidate's background.
4. <SKILLS_INLINE_BY_CATEGORY>: Format as "\\textbf{Category:} skill1, skill2, skill3" — one line per category, no bullet points, group logically.
5. <PROJECTS_ENTRIES>: For each experience/project entry use this exact format:
   \\textbf{Project Title -- Subtitle} \\hfill \\textit{Mon Year}
   \\begin{itemize}
       \\item Action verb + method + quantified result.
       \\item (max 4 bullets per project)
   \\end{itemize}
   \\vspace{4pt}
6. <EDUCATION_ENTRIES>: Use this format:
   \\textbf{Institution Name} \\hfill StartYear -- EndYear\\\\
   Degree Name \\hfill City, Country
   \\begin{itemize}
       \\item Relevant Coursework: ...
   \\end{itemize}
   \\vspace{4pt}
7. <CERT_ITEMS>: Format as: \\item \\textbf{Cert Name} -- Issuer -- Year

CRITICAL LaTeX RULES:
- Escape these characters: & → \\&, % → \\%, # → \\#, $ → \\$
- Accented chars (á, é, í, ó, ú, ñ) are fine as-is (UTF-8 inputenc handles them)
- Do NOT add \\usepackage{fontenc} or any extra packages
- Do NOT use \\section (without *) — always use \\section*
- Return ONLY the complete .tex source code starting with \\documentclass and ending with \\end{document}. No markdown, no \`\`\`, no explanation.`;

export async function generateLatexFromProfile(profile: ParsedProfile): Promise<string> {
  const profileString = JSON.stringify(profile, null, 2);
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Fill in the LaTeX CV template with the following candidate profile data. Follow all rules exactly:\n\n${profileString}`,
    config: {
      systemInstruction: LATEX_PROMPT,
      temperature: 0.05, // Very low temperature for consistent, structured output
    }
  });

  let texCode = response.text || "";
  
  // Clean up any markdown code block wrappers Gemini may add
  texCode = texCode
    .replace(/^```latex\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  // Ensure it starts correctly
  if (!texCode.startsWith("\\documentclass")) {
    const start = texCode.indexOf("\\documentclass");
    if (start > -1) texCode = texCode.slice(start);
  }

  return texCode;
}
