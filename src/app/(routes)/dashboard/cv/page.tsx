"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/client/components/ui/card"
import { Button } from "@/client/components/ui/button"
import {
  Upload, Loader2, CheckCircle, User, MapPin, Mail, Phone, RefreshCw,
  Sparkles, FileText, Briefcase, GraduationCap, Languages, Code, Award,
  Download, Edit3, Eye, ChevronRight, Star, TrendingUp, AlertCircle,
  CheckCircle2, ArrowUpRight, X,
} from "lucide-react"
import { cn } from "@/client/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/client/components/ui/tabs"
import { authClient } from "@/app/lib/auth-client"
import { analyzeCvAction } from "@/server/modules/cv/features/analyze/analyze-cv.action"
import { getCvAction } from "@/server/modules/cv/features/analyze/get-cv.action"
import type { ParsedProfile } from "@/server/modules/cv/infrastructure/db/cv.schema"

type UploadState = "idle" | "analyzing" | "success"

// Consts and helpers// AI improvement suggestions
const aiSuggestions = [
  { type: "high", title: "Agrega métricas a tu resumen", desc: "Tu resumen no tiene números concretos. Agrega algo como 'aumenté ventas 30%' para destacar más.", action: "Mejorar resumen" },
  { type: "high", title: "Incluye keywords de LinkedIn", desc: "Faltan palabras clave populares: 'CI/CD', 'Agile', 'REST API'. Aumentan tu visibilidad en 40%.", action: "Ver keywords" },
  { type: "medium", title: "Foto de perfil profesional", desc: "Los CVs con foto tienen 21% más de respuestas. Usar una foto profesional es recomendable.", action: "Agregar foto" },
  { type: "medium", title: "Sección de proyectos personales", desc: "Agrega 2-3 proyectos de GitHub para mostrar tu pasión por el código fuera del trabajo.", action: "Agregar proyectos" },
  { type: "low", title: "Certificaciones más recientes", desc: "Tu certificación de AWS tiene más de 2 años. Considera renovarla o agregar una más reciente.", action: "Ver cursos" },
]

export default function CVPage() {
  const [state, setState] = useState<UploadState>("idle")
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState("")
  const [analysisStep, setAnalysisStep] = useState(0)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [dismissedSuggestions, setDismissedSuggestions] = useState<number[]>([])
  
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;
  const [profile, setProfile] = useState<ParsedProfile | null>(null);
  const [latexContent, setLatexContent] = useState<string>("");
  const [showLatex, setShowLatex] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Cargar perfil existente de la DB al inicio
  useEffect(() => {
    if (!userId) return;
    getCvAction(userId).then(res => {
      if (res.success && res.cv) {
        setProfile(res.cv.parsedProfile);
        setLatexContent(res.cv.latexContent || "");
        setFileName(res.cv.originalFileName);
        setState("success");
      }
    });
  }, [userId]);

  const analysisSteps = [
    "Extrayendo texto del documento...",
    "Identificando secciones...",
    "Analizando experiencia laboral...",
    "Evaluando habilidades...",
    "Generando perfil profesional...",
  ]

  const processFile = async (file: File) => {
    if (file.type !== "application/pdf") { alert("Por favor sube un archivo PDF"); return }
    if (!userId) { alert("Por favor inicia sesión"); return; }
    
    setFileName(file.name)
    setState("analyzing")
    setAnalysisStep(0)
    
    // Simular el avance visual de los pasos
    const interval = setInterval(() => {
      setAnalysisStep((prev) => prev < analysisSteps.length - 1 ? prev + 1 : prev)
    }, 1500);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);

    try {
      const res = await analyzeCvAction(formData);
      clearInterval(interval);
      
      if (res.success) {
        setProfile(res.profile);
        setLatexContent(res.latexContent || "");
        setAnalysisStep(analysisSteps.length - 1);
        setTimeout(() => setState("success"), 500);
      } else {
        alert(res.error || "Hubo un error analizando el CV");
        setState("idle");
      }
    } catch (e) {
      clearInterval(interval);
      alert("Fallo de conexión al analizar el CV");
      setState("idle");
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }, [])

  const activeSuggestions = profile?.coachAnalysis?.criticalIssues?.map((issue, i) => ({
    title: "Problema Crítico de Formato Harvard",
    desc: issue,
    action: "Corregir",
    type: "high"
  })).filter((_, i) => !dismissedSuggestions.includes(i)) || [];

  const downloadPdf = async () => {
    if (!userId) return;
    setExporting(true);
    try {
      const response = await fetch(`/api/cv/export-pdf?userId=${userId}`);
      if (!response.ok) {
        let errMsg = "Error al generar el PDF";
        try { const err = await response.json(); errMsg = err.error || errMsg; } catch {}
        alert(errMsg);
        return;
      }
      const blob = await response.blob();
      const name = profile?.fullName
        ? profile.fullName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, "_")
        : "CV";
      const filename = `${name}_Harvard_CV.pdf`;
      // Create a hidden anchor with the blob URL and proper filename
      const blobWithType = new Blob([await blob.arrayBuffer()], { type: "application/pdf" });
      const url = URL.createObjectURL(blobWithType);
      const link = document.createElement("a");
      link.style.display = "none";
      link.href = url;
      link.setAttribute("download", filename);
      link.setAttribute("type", "application/pdf");
      document.body.appendChild(link);
      link.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 1000);
    } catch (e) {
      console.error(e);
      alert("Error al descargar el PDF. Verifica que el CV tenga código LaTeX generado.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 bg-muted/30 backdrop-blur-sm border-b border-border">
        <div className="px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-foreground">Mi CV</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {state === "success" ? "Tu perfil profesional analizado por IA" : "Sube tu CV y nuestra IA creará tu perfil"}
              </p>
            </div>
            {state === "success" && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2" onClick={() => { setState("idle"); setFileName("") }}>
                  <RefreshCw className="h-4 w-4" /><span className="hidden sm:inline">Actualizar CV</span>
                </Button>
                <Button size="sm" className="gap-2" onClick={downloadPdf} disabled={exporting}>
                  {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  <span className="hidden sm:inline">{exporting ? "Generando PDF..." : "Exportar"}</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="px-4 lg:px-8 py-6">
        {/* Idle */}
        {state === "idle" && (
          <div className="max-w-2xl mx-auto">
            <Card className="border-2 border-dashed border-border hover:border-primary/50 transition-all bg-card overflow-hidden">
              <CardContent className="p-0">
                <label htmlFor="cv-upload"
                  className={cn("flex flex-col items-center justify-center py-20 px-6 cursor-pointer transition-all", isDragging && "bg-primary/5 border-primary")}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}>
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-6 shadow-lg">
                    <Upload className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Arrastra tu CV aquí</h3>
                  <p className="text-muted-foreground mb-6">o haz clic para seleccionar archivo</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5"><FileText className="h-4 w-4" />Solo PDF</span>
                    <span className="flex items-center gap-1.5"><Sparkles className="h-4 w-4" />Análisis con IA</span>
                  </div>
                  <input id="cv-upload" type="file" accept=".pdf" className="hidden" onChange={handleFileSelect} />
                </label>
              </CardContent>
            </Card>
            <div className="grid sm:grid-cols-3 gap-4 mt-8">
              {[
                { icon: Sparkles, title: "Análisis IA", desc: "Extrae tu info automáticamente" },
                { icon: TrendingUp, title: "Score de CV", desc: "Evalúa tu competitividad" },
                { icon: Edit3, title: "Editable", desc: "Ajusta los datos extraídos" },
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground text-sm">{feature.title}</h4>
                    <p className="text-xs text-muted-foreground">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analyzing */}
        {state === "analyzing" && (
          <div className="max-w-lg mx-auto">
            <Card className="border-0 shadow-lg bg-card overflow-hidden">
              <CardContent className="p-8">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-8">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <Loader2 className="h-12 w-12 text-primary animate-spin" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Analizando tu CV</h3>
                  <p className="text-sm text-muted-foreground mb-6">{fileName}</p>
                  <div className="w-full space-y-3">
                    {analysisSteps.map((step, index) => (
                      <div key={index} className={cn("flex items-center gap-3 p-3 rounded-lg transition-all", index < analysisStep && "bg-emerald-50", index === analysisStep && "bg-primary/10", index > analysisStep && "opacity-40")}>
                        {index < analysisStep ? <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" /> : index === analysisStep ? <Loader2 className="h-5 w-5 text-primary animate-spin shrink-0" /> : <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 shrink-0" />}
                        <span className={cn("text-sm text-left", index <= analysisStep ? "text-foreground" : "text-muted-foreground")}>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Success */}
        {state === "success" && (
          <div className="space-y-6">
            {/* AI Suggestions Banner */}
            {showSuggestions && activeSuggestions.length > 0 && (
              <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Recomendaciones de IA para mejorar tu CV</h3>
                        <p className="text-sm text-muted-foreground">{activeSuggestions.length} sugerencias para aumentar tu score</p>
                      </div>
                    </div>
                    <button onClick={() => setShowSuggestions(false)} className="p-1.5 rounded-lg hover:bg-amber-100 text-muted-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {activeSuggestions.map((suggestion, i) => (
                      <div key={i} className="flex items-start gap-4 p-4 bg-white/80 rounded-xl border border-amber-100">
                        <div className={cn("w-2 h-2 rounded-full mt-2 shrink-0", suggestion.type === "high" ? "bg-red-500" : suggestion.type === "medium" ? "bg-amber-500" : "bg-blue-500")} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm">{suggestion.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{suggestion.desc}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-amber-200 hover:bg-amber-50">
                            {suggestion.action} <ArrowUpRight className="h-3 w-3" />
                          </Button>
                          <button onClick={() => setDismissedSuggestions(prev => [...prev, aiSuggestions.indexOf(suggestion)])} className="p-1 rounded hover:bg-amber-100 text-muted-foreground">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-amber-200 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <Button size="sm" className="gap-2 bg-amber-600 hover:bg-amber-500" onClick={() => setShowLatex(!showLatex)}>
                        <Sparkles className="h-4 w-4" /> {showLatex ? "Ocultar Código Harvard LaTeX" : "Mejorar CV automáticamente con IA (Generar LaTeX)"}
                      </Button>
                      <span className="text-xs text-muted-foreground">Tu versión optimizada de Harvard, generada por IA lista para usar</span>
                    </div>

                    {showLatex && latexContent && (
                      <div className="mt-2 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
                          <span className="text-xs font-mono text-slate-400">harvard-cv.tex</span>
                          <Button size="sm" variant="ghost" className="h-7 hover:bg-slate-800 text-slate-300" onClick={() => {
                            navigator.clipboard.writeText(latexContent);
                            alert("¡Código LaTeX copiado al portapapeles! Pégalo en Overleaf.");
                          }}>
                            Copiar código
                          </Button>
                        </div>
                        <pre className="p-4 overflow-x-auto text-xs font-mono text-emerald-400 max-h-96 overflow-y-auto">
                          {latexContent}
                        </pre>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* CV Preview / Perfil Extraído */}
            <Card className="border-0 shadow-sm bg-card overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-primary via-primary/80 to-accent" />
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">Perfil Extraído de tu CV</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">BETA</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">Datos detectados automáticamente por IA · Edición manual próximamente</p>
                    </div>
                  </div>
                  <div className="text-center px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100 shrink-0">
                    <p className="text-2xl font-bold text-emerald-600">{profile?.coachAnalysis?.overallScore || 0}</p>
                    <p className="text-xs text-emerald-600 font-medium">Score Harvard</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Avatar */}
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-border flex items-center justify-center">
                      <User className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <span className="text-xs text-muted-foreground text-center">Foto próximamente</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 space-y-1">
                    <h2 className="text-xl font-bold text-foreground">{profile?.fullName}</h2>
                    <p className="text-primary font-medium text-sm">{profile?.experience?.[0]?.title || "Profesional"}</p>
                    <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3 text-sm text-muted-foreground">
                      {profile?.email && <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{profile.email}</span>}
                      {profile?.phone && <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{profile.phone}</span>}
                      {profile?.location && <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{profile.location}</span>}
                    </div>
                  </div>
                </div>

                {/* Info banner */}
                <div className="mt-5 flex items-start gap-3 p-3 rounded-xl bg-muted/60 border border-border">
                  <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">¿Información incorrecta?</span> Próximamente podrás editar y guardar tu perfil manualmente. Por ahora, vuelve a subir tu CV actualizado para que la IA re-extraiga los datos.
                  </p>
                </div>
              </CardContent>
            </Card>


            {/* Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="bg-card border border-border p-1 h-auto flex-wrap">
                <TabsTrigger value="overview" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Eye className="h-4 w-4" />Vista General</TabsTrigger>
                <TabsTrigger value="experience" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Briefcase className="h-4 w-4" />Experiencia</TabsTrigger>
                <TabsTrigger value="skills" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Code className="h-4 w-4" />Habilidades</TabsTrigger>
                <TabsTrigger value="education" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><GraduationCap className="h-4 w-4" />Educación</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <Card className="border-0 shadow-sm bg-card">
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" />Resumen Profesional</h3>
                        <p className="text-muted-foreground leading-relaxed">{profile?.summary}</p>
                      </CardContent>
                    </Card>
                    <Card className="border-0 shadow-sm bg-card">
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Code className="h-4 w-4 text-primary" />Top Habilidades</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {profile?.skills.slice(0, 6).map((skillName, i) => {
                            const lvl = [95, 90, 88, 85, 80, 75, 70][i % 7];
                            return (
                              <div key={i} className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="font-medium text-foreground">{skillName}</span>
                                  <span className="text-muted-foreground">{lvl}%</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                  <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full" style={{ width: `${lvl}%` }} />
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="space-y-6">
                    <Card className="border-0 shadow-sm bg-card">
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Languages className="h-4 w-4 text-violet-500" />Idiomas</h3>
                        <div className="space-y-3">
                          {profile?.languages.map((lang, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                              <span className="font-medium text-foreground">{lang}</span>
                              <span className="text-sm text-muted-foreground">-</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-0 shadow-sm bg-card">
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Award className="h-4 w-4 text-amber-500" />Certificaciones</h3>
                        <div className="space-y-2">
                          {profile?.certifications?.map((cert, i) => (
                            <div key={i} className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                              <Star className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                              <span className="text-sm text-foreground">{cert}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="experience" className="space-y-4">
                {profile?.experience.map((exp, i) => (
                  <Card key={i} className="border-0 shadow-sm bg-card">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-lg font-bold text-primary shrink-0">{exp.company.charAt(0)}</div>
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                            <div>
                              <h4 className="font-semibold text-foreground">{exp.title}</h4>
                              <p className="text-primary font-medium">{exp.company}</p>
                            </div>
                            <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full w-fit">{exp.startDate} - {exp.endDate}</span>
                          </div>
                          <p className="text-muted-foreground text-sm mb-4">{exp.description}</p>
                          <div className="space-y-2">
                            {exp.description && exp.description.split('. ').filter(Boolean).map((h, hi) => (
                              <div key={hi} className="flex items-start gap-2 text-sm">
                                <ChevronRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                <span className="text-foreground">{h}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="skills">
                <Card className="border-0 shadow-sm bg-card">
                  <CardContent className="p-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      {profile?.skills.map((skillName, i) => {
                        const lvl = [95, 90, 88, 85, 80, 75, 70][i % 7];
                        return (
                          <div key={i} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-foreground">{skillName}</span>
                              <span className={cn("text-sm font-medium px-2 py-0.5 rounded", lvl >= 90 ? "bg-emerald-100 text-emerald-700" : lvl >= 80 ? "bg-blue-100 text-blue-700" : lvl >= 70 ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-700")}>
                                {lvl >= 90 ? "Experto" : lvl >= 80 ? "Avanzado" : lvl >= 70 ? "Intermedio" : "Básico"}
                              </span>
                            </div>
                            <div className="h-3 bg-muted rounded-full overflow-hidden">
                              <div className={cn("h-full rounded-full transition-all", lvl >= 90 ? "bg-emerald-500" : lvl >= 80 ? "bg-blue-500" : lvl >= 70 ? "bg-amber-500" : "bg-gray-500")} style={{ width: `${lvl}%` }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="education" className="space-y-4">
                {profile?.education.map((edu, i) => (
                  <Card key={i} className="border-0 shadow-sm bg-card">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                          <GraduationCap className="h-6 w-6 text-violet-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                              <h4 className="font-semibold text-foreground">{edu.degree}</h4>
                              <p className="text-primary">{edu.institution}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">{edu.year}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  )
}
