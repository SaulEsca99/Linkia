# 🏗️ Plan de Flujo — Mi CV · Vacantes · Matches
> Análisis completo del repositorio Linkia · 14 Abril 2026

---

## 🔍 Diagnóstico del estado actual

### Lo que el código realmente hace hoy

```
Usuario sube PDF ──► Mi CV ──► analyzeCV() [Gemini 2.5 Flash, ~10k tokens]
                               │
                               ├─ ParsedProfile guardado en tabla cvs
                               ├─ LaTeX generado y guardado en cvs.latex_content
                               └─ refreshJobsCache() disparado en background (fire & forget)
                                   └─► JSearch + Adzuna + RemoteOK [3 API calls]
                                       └─► Guardado en tabla jobs_cache

Usuario va a Vacantes ──► GET /api/jobs/extract-and-search?userId
                          │
                          └─► getCachedJobs()
                               ├─ Si hay caché válido → devuelve jobs[] de BD ✅
                               ├─ Si caché vacío (jobs: []) → re-fetch automático
                               └─ Si caché > 12h → re-fetch automático

Usuario sube PDF en Vacantes ──► POST /api/jobs/extract-and-search
                                  │
                                  ├─ pdf-parse extrae texto
                                  ├─ extractSkillsFromText() [Gemini 2.0-flash, ~500 tokens]
                                  └─ refreshJobsCache() con nuevo query
```

### Problemas identificados

| # | Problema | Causa | Impacto |
|---|---------|-------|---------|
| 1 | `jobs:[]` en caché → bucle infinito de re-fetch | Si todas las APIs devuelven 0 resultados para un query, se guarda `[]` y en cada load se re-intenta indefinidamente | 🔴 Crítico |
| 2 | Error residual en React state | El `setError(null)` del loadFromCache no limpia errores de POSTs anteriores porque la condición de la UI opera sobre `jobs.length === 0` y el error se muestra en ese bloque | 🔴 Crítico |
| 3 | Query de búsqueda con skills legacy | Skills como "Power House", "Endevor", "TCP/IP" se usan para buscar en JSearch/Adzuna y no devuelven nada | 🟡 Importante |
| 4 | Matches llama a `/api/jobs/search` (ruta antigua) | Inconsistencia: Vacantes usa `extract-and-search`, Matches usa `search`. Tienen lógica diferente | 🟡 Importante |
| 5 | Skill levels en CV son inventados | Los niveles 95%, 90%, 88%... son hardcoded en el frontend, no vienen del análisis de Gemini | 🟢 Estético |
| 6 | `fire & forget` al subir CV puede fallar silenciosamente | Si refreshJobsCache falla en el use-case, el error se loguea pero no se reporta ni reintenta | 🟢 Menor |

---

## 🗺️ Flujo correcto propuesto

### Vision general de 3 módulos

```
┌─────────────────────────────────────────────────────────────────┐
│                         LINKIA PLATFORM                          │
├─────────────────┬───────────────────────┬────────────────────────┤
│     MI CV       │      VACANTES         │      MATCHES           │
│                 │                       │                        │
│ Mejorar tu CV   │ Encontrar empleos     │ Top empleos filtrados  │
│ + Descargar PDF │ con tu perfil         │ con análisis profundo  │
└─────────────────┴───────────────────────┴────────────────────────┘
```

---

## 📄 Módulo 1: Mi CV

### Propósito único
Crear, mejorar y descargar tu CV en formato Harvard PDF.

### Flujo correcto

```
ESTADO INICIAL (sin CV)
  └─► Zona de upload con drag & drop
      └─► Usuario sube PDF

ANÁLISIS (~15 segundos)
  ├─ pdf-parse extrae texto
  ├─ Gemini 2.5 Flash analiza [~10k tokens]
  │   ├─ Extrae: nombre, email, teléfono, resumen, skills, experiencia, educación
  │   └─ Analiza: score Harvard, problemas críticos, keywords ATS, bullet rewrites
  ├─ Genera LaTeX (plantilla Harvard)
  └─ Guarda en BD tabla cvs (múltiples versiones)

RESULTADO (estado success)
  ├─ [Header] Nombre + Score Harvard + botón Exportar PDF
  ├─ [Banner Sugerencias] Problemas críticos con botón de acción real
  │   └─ "Mejorar bullet: X → Y (con verbo fuerte + cantidad)"
  ├─ [Perfil extraído]
  │   ├─ Datos personales (nombre, email, ubicación)
  │   └─ Historial de versiones (dropdown "CV del 14 Abr / CV del 10 Abr...")
  └─ [Tabs]
      ├─ Vista General (resumen + top skills)
      ├─ Experiencia (timeline)
      ├─ Habilidades (sin % inventados — solo chips por categoría)
      ├─ Educación
      └─ Código LaTeX (colapsado, con botón copiar + botón Overleaf)
```

### Lo que falta implementar
- [ ] Historial de CVs visible (dropdown de versiones con fechas)
- [ ] Skills sin porcentajes inventados → mostrar como categorías (Lenguajes, Frameworks, Cloud, etc.)
- [ ] Botón de sugerencias que haga ALGO real (abrir LaTeX, copiar bullet reescrito)
- [ ] Edición manual del perfil (formulario que actualiza cvs.parsed_profile)

---

## 💼 Módulo 2: Vacantes

### Propósito único
Buscar empleos relevantes usando tu CV como contexto. Sin análisis completo, sin guardar nada.

### Flujo correcto

```
CARGA DE PÁGINA
  ├─ GET /api/jobs/extract-and-search?userId=X
  │   ├─ ¿Tiene CV analizado en BD? (tabla cvs)
  │   │   ├─ SÍ → usa skills del parsedProfile → getCachedJobs()
  │   │   │       ├─ ¿Jobs en caché y frescos? → muestra empleos ✅
  │   │   │       └─ ¿Caché vacío o stale? → re-fetch en background
  │   │   └─ NO → devuelve { jobs: [], hasPreviousCV: false }
  │   └─ ¿No tiene caché ni CV? → muestra zona de upload
  └─ Siempre limpia error state al inicio

ZONA DE UPLOAD (solo si hasPreviousCV: false Y jobs: [])
  └─► Usuario sube PDF (solo para buscar, no se guarda en cvs)
      ├─ POST /api/jobs/extract-and-search [multipart/form-data]
      ├─ pdf-parse extrae texto
      ├─ Gemini 2.0 Flash extrae título + 12 skills [~500 tokens]
      ├─ Rate limit check (5/día)
      └─ refreshJobsCache() → muestra empleos

CON EMPLEOS CARGADOS
  ├─ Banner: "Buscando como: [título detectado]" + skills chips
  ├─ Filtros: Todos / Tiempo completo / Medio tiempo / Becario / Remoto
  ├─ Stats: Match promedio, jobs por fuente
  ├─ Listado ordenado por match% (mayor primero)
  │   ├─ Top matches (≥80%) al inicio → sección "Recomendados para ti"
  │   └─ Otros empleos (60-79%) → sección "Explorar más"
  ├─ Botón "Nuevo CV" → abre upload zone (reemplaza el query)
  └─ Modal de detalle → descripción completa + link original

RATE LIMITING (simplificado)
  ├─ 5 búsquedas manuales/día
  ├─ Auto-refresh (stale >12h) NO cuenta contra el límite
  └─ Cuando se agota → muestra banner con tiempo restante + usa caché guardado
```

### Bugs que corregir en este módulo
- [ ] `setError(null)` en TODOS los paths del loadFromCache, no solo en el bloque `if (data.success)`
- [ ] Cuando `getCachedJobs` devuelve `jobs: []` por 2ª vez → parar el re-fetch y mostrar mensaje de "No encontramos empleos, busca manualmente"
- [ ] Añadir `MAX_EMPTY_RETRIES = 1` para no loopear infinitamente

---

## 🎯 Módulo 3: Matches

### Propósito único
Vista especializada de los empleos con MAYOR compatibilidad + análisis detallado de por qué hacen match.

### Flujo correcto

```
CARGA
  └─► GET /api/jobs/extract-and-search?userId=X (MISMO endpoint que Vacantes)
      └─► Obtiene todos los jobs del caché con match scores

VISTA (2 paneles)
  ├─ [Lista — izquierda]
  │   ├─ Tabs: "Top Matches" (≥80%) | "Todos"
  │   ├─ Cada card: logo + título + empresa + match% badge + fuente
  │   └─ Al hacer clic → actualiza panel derecho
  │
  └─ [Detalle — derecha]
       ├─ Header: logo, título, empresa, ubicación, salario
       ├─ Barra de match% con color (verde/azul/ámbar)
       ├─ [Skills que tienes] ← de skill del empleo que aparecen en tu CV
       ├─ [Skills que pide y no tienes] ← gap analysis
       ├─ [Recomendación IA] ← frase contextual según score
       │   "85%+: Aplica hoy, destaca proyectos personales"
       │   "70-84%: Menciona cómo compensas los skills que faltan"
       │   "<70%: Adquiere X Y Z antes de aplicar"
       ├─ Descripción del puesto (800 chars + link "ver más")
       └─ Botones: "Aplicar ahora" → URL original | "Generar CV adaptado" (Pro)

CUANDO NO HAY JOBS
  └─► Banner: "Ve a Vacantes para buscar empleos primero" + botón Link
```

### Lo que falta implementar
- [ ] Conectar al mismo endpoint que Vacantes (actualmente usa `/api/jobs/search`)
- [ ] Skill gap real: comparar `job.tags` vs `profile.skills` del CV en BD
- [ ] "Generar CV adaptado" → Por ahora muestra modal "Próximamente en Pro"

---

## 🔧 Cambios técnicos necesarios (ordenados por prioridad)

### 🔴 Urgente

#### 1. Fix vacantes — error residual y loop de re-fetch

```typescript
// jobs-cache.service.ts
// Añadir flag para evitar re-fetch infinito cuando jobs siempre llega vacío
async function getCachedJobs(userId, profileSkills, retryIfEmpty = true) {
  // ...
  if (cachedList.length === 0 && retryIfEmpty) {
    const freshJobs = await refreshJobsCache(...)
    if (freshJobs.length === 0) {
      // No loopear — guardar metadata de "búsqueda fallida"
      return { jobs: [], status, fromCache: false, searchFailed: true }
    }
  }
}
```

```tsx
// vacantes/page.tsx — limpiar error siempre al cargar
const loadFromCache = useCallback(async () => {
  setLoading(true)
  setError(null)  // ← siempre limpiar
  try {
    const res = await fetch(...)
    const data = await res.json()
    setError(null) // ← limpiar también después de res.json()
    if (data.success) { /* set jobs */ }
    else { setError(data.error || "Error al cargar") }
  } catch (e) {
    setError("Error de conexión")
  } finally { setLoading(false) }
}, [userId])
```

#### 2. Fix Matches — conectar al caché correcto

```tsx
// matches/page.tsx — cambiar endpoint
// ANTES:
fetch(`/api/jobs/search?userId=${userId}`)
// DESPUÉS:
fetch(`/api/jobs/extract-and-search?userId=${userId}`)
```

### 🟡 Importantes (post-bug-fix)

#### 3. Skill gap real en Matches

```typescript
// Comparar tags del empleo vs skills del perfil guardado
function computeSkillGap(jobTags: string[], profileSkills: string[]) {
  const norm = (s: string) => s.toLowerCase().trim()
  const matched = jobTags.filter(tag =>
    profileSkills.some(skill => norm(skill).includes(norm(tag)) || norm(tag).includes(norm(skill)))
  )
  const missing = jobTags.filter(tag => !matched.includes(tag))
  return { matched, missing }
}
```

#### 4. Query builder inteligente

```typescript
// Mejorar la selección de términos para el query de búsqueda
// Priorizar: títulos de trabajo > frameworks > lenguajes > herramientas cloud
// Ignorar: infraestructura genérica (TCP/IP, Windows Server), herramientas legacy muy específicas

const SEARCH_PRIORITY = ['react', 'node', 'python', 'java', 'typescript', 'sql', 'aws', 'docker']
function buildSmartQuery(title: string, skills: string[]): string {
  const titleWords = title.split(' ').slice(0, 2).join(' ')
  const prioritySkills = skills
    .filter(s => SEARCH_PRIORITY.some(p => s.toLowerCase().includes(p)))
    .slice(0, 2)
  const fallbackSkills = skills
    .filter(s => !GENERIC_SKILLS.has(s.toLowerCase()))
    .slice(0, 2)
  const searchTerms = [titleWords, ...(prioritySkills.length ? prioritySkills : fallbackSkills)]
  return searchTerms.filter(Boolean).join(' ') || 'desarrollador software mexico'
}
```

#### 5. Historial de CVs en Mi CV

```tsx
// Añadir dropdown en el header de Mi CV
const [cvVersions, setCvVersions] = useState<CvRecord[]>([])

useEffect(() => {
  // Llamar nuevo endpoint GET /api/cv/versions?userId=X que devuelve todos los CVs
  fetch(`/api/cv/versions?userId=${userId}`)
    .then(r => r.json())
    .then(data => setCvVersions(data.cvs))
}, [userId])

// UI: select/dropdown con fechas → al seleccionar carga esa versión
```

---

## 📊 Resumen visual del flujo completo

```
NUEVO USUARIO
      │
      ▼
  Registrarse
      │
      ├──────────────────────────────────────┐
      │                                      │
      ▼                                      ▼
  [MI CV]                              [VACANTES]
  Sube PDF                             Sube PDF
  Gemini análisis completo             Gemini extracción ligera
  (~10k tokens, ~15s)                  (~500 tokens, ~3s)
  LaTeX Harvard                        Solo title + skills
  Score Harvard                             │
  Sugerencias                               │
  Descarga PDF                              ▼
      │                              Busca en:
      │ (fire & forget)              JSearch (LinkedIn/Indeed)
      └───────────────────────►      Adzuna MX
                                     RemoteOK
                                          │
                                          ▼
                                   Guarda en jobs_cache
                                   (no vuelve a consultar APIs
                                    por 12h — caché)
                                          │
                  ┌───────────────────────┤
                  │                       │
                  ▼                       ▼
            [VACANTES]              [MATCHES]
            Lista completa          Solo los ≥80%
            ordenada por match%     Con skill gap analysis
            Filtros por tipo        Panel de detalle
            Fuente badge            Recomendación IA
            Modal de detalle        Link a aplicar
```

---

## ✅ Checklist de implementación

### Fase 1 — Fix bugs críticos (hoy)
- [ ] Fix `loadFromCache` — limpiar error siempre
- [ ] Fix Matches — cambiar endpoint a `extract-and-search`
- [ ] Fix loop de re-fetch con `searchFailed` flag
- [ ] Fix query builder — priorizar skills marketables

### Fase 2 — Completar flujo (esta semana)
- [ ] Historial de CVs en Mi CV
- [ ] Skills sin % inventados → chips por categoría
- [ ] Skill gap real en Matches (matched vs missing)
- [ ] Sección "Recomendados para ti" separada de "Explorar más" en Vacantes
- [ ] Edición manual de perfil guardado

### Fase 3 — Value-add (siguiente sprint)
- [ ] Notificaciones: alerta cuando llegan nuevas vacantes
- [ ] "Generar CV adaptado" para Pro (reutiliza LaTeX con keywords del empleo)
- [ ] Configuración: guardar nombre/ubicación del usuario en tabla user
- [ ] Deploy: resolver pdflatex en cloud (Gotenberg o Puppeteer)
