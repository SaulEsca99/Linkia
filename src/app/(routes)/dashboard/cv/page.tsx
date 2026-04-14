"use client";

import { useCallback, useState } from "react";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  User,
  Briefcase,
  GraduationCap,
  Code,
  Globe,
} from "lucide-react";
import type { ParsedProfile } from "@server/modules/cv/infrastructure/db/cv.schema";

type AnalysisState =
  | { status: "idle" }
  | { status: "uploading"; fileName: string }
  | { status: "analyzing"; fileName: string }
  | { status: "success"; fileName: string; profile: ParsedProfile }
  | { status: "error"; message: string };

export default function CvUploadPage() {
  const [state, setState] = useState<AnalysisState>({ status: "idle" });
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    if (file.type !== "application/pdf") {
      setState({ status: "error", message: "Solo se permiten archivos PDF" });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setState({ status: "error", message: "El archivo excede 10MB" });
      return;
    }

    setState({ status: "uploading", fileName: file.name });

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", "demo-user"); // TODO: usar userId real de la sesión

      setState({ status: "analyzing", fileName: file.name });

      const res = await fetch("/api/cv/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setState({
          status: "error",
          message: data.error || "Error al analizar el CV",
        });
        return;
      }

      setState({
        status: "success",
        fileName: file.name,
        profile: data.profile,
      });
    } catch {
      setState({
        status: "error",
        message: "Error de conexión. Intenta de nuevo.",
      });
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Mi CV</h2>
        <p className="mt-1 text-gray-500">
          Sube tu CV en PDF y nuestra IA lo analizará para crear tu perfil
          profesional
        </p>
      </div>

      {/* Upload zone */}
      {(state.status === "idle" || state.status === "error") && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition-colors ${
            dragOver
              ? "border-indigo-500 bg-indigo-50"
              : "border-gray-300 bg-gray-50 hover:border-gray-400"
          }`}
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-indigo-100">
            <Upload className="h-8 w-8 text-indigo-600" />
          </div>
          <p className="text-lg font-semibold text-gray-700">
            Arrastra tu CV aquí
          </p>
          <p className="mt-1 text-sm text-gray-500">o haz clic para buscar</p>
          <input
            type="file"
            accept=".pdf"
            onChange={handleInputChange}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
          <p className="mt-4 text-xs text-gray-400">
            PDF • Máximo 10MB
          </p>

          {state.status === "error" && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              {state.message}
            </div>
          )}
        </div>
      )}

      {/* Loading states */}
      {(state.status === "uploading" || state.status === "analyzing") && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-12 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
          <p className="mt-4 text-lg font-semibold text-gray-700">
            {state.status === "uploading"
              ? "Subiendo archivo..."
              : "Analizando tu CV con IA..."}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            <FileText className="mr-1 inline h-4 w-4" />
            {state.fileName}
          </p>
          {state.status === "analyzing" && (
            <p className="mt-3 text-xs text-gray-400">
              Esto puede tomar unos segundos
            </p>
          )}
        </div>
      )}

      {/* Success: Profile display */}
      {state.status === "success" && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3 rounded-xl bg-emerald-50 px-6 py-4">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            <div>
              <p className="font-semibold text-emerald-800">
                CV analizado exitosamente
              </p>
              <p className="text-sm text-emerald-600">{state.fileName}</p>
            </div>
            <button
              onClick={() => setState({ status: "idle" })}
              className="ml-auto rounded-lg border border-emerald-200 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
            >
              Subir otro CV
            </button>
          </div>

          {/* Profile card */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            {/* Name & summary */}
            <div className="border-b p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
                  <User className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {state.profile.fullName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {state.profile.email}
                    {state.profile.phone && ` • ${state.profile.phone}`}
                    {state.profile.location && ` • ${state.profile.location}`}
                  </p>
                </div>
              </div>
              {state.profile.summary && (
                <p className="mt-4 text-sm leading-relaxed text-gray-600">
                  {state.profile.summary}
                </p>
              )}
            </div>

            <div className="grid gap-6 p-6 md:grid-cols-2">
              {/* Skills */}
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Code className="h-4 w-4 text-indigo-500" />
                  Skills
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {state.profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Globe className="h-4 w-4 text-purple-500" />
                  Idiomas
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {state.profile.languages.map((lang) => (
                    <span
                      key={lang}
                      className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Briefcase className="h-4 w-4 text-emerald-500" />
                  Experiencia
                </div>
                <div className="mt-3 space-y-4">
                  {state.profile.experience.map((exp, i) => (
                    <div key={i} className="rounded-lg bg-gray-50 p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            {exp.title}
                          </p>
                          <p className="text-sm text-gray-500">{exp.company}</p>
                        </div>
                        <span className="text-xs text-gray-400">
                          {exp.startDate} — {exp.endDate || "Actual"}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">
                        {exp.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <GraduationCap className="h-4 w-4 text-amber-500" />
                  Educación
                </div>
                <div className="mt-3 space-y-3">
                  {state.profile.education.map((edu, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {edu.degree}
                        </p>
                        <p className="text-sm text-gray-500">
                          {edu.institution}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400">{edu.year}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
