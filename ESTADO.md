# 📊 Estado del Proyecto — Linkia
> Última actualización: 14 Abril 2026

---

## ✅ Lo que funciona

### 🔐 Autenticación
- Login / Registro con email y contraseña (Better Auth)
- Sesión persistente con cookies
- `trustedOrigins` configurado para red local `10.100.67.14`
- `allowedDevOrigins` en Next.js (sin warnings de CORS)

### 📄 Mi CV — Creador de CV Harvard
- Upload de PDF (validación tipo + tamaño máximo 10MB)
- Extracción de texto con `pdf-parse`
- Análisis completo con **Gemini 2.5 Flash**: score 0-100, problemas críticos, keywords ATS, sugerencias — todo en español
- Generación de **LaTeX estilo Harvard** (basado en template real)
- Visualización del código LaTeX con syntax highlight en el dashboard
- Exportación y descarga real de **PDF** con `pdflatex`
- Historial de múltiples CVs en BD (siempre muestra el más reciente)
- Perfil extraído con badge **BETA** y aviso honesto de "edición próximamente"

### 🗄️ Base de Datos
- PostgreSQL (Docker, puerto 5433)
- Tablas activas: `user`, `session`, `account`, `cvs`, `jobs_cache`, `job_search`, `match`
- Drizzle ORM con esquemas sincronizados

### 💼 Vacantes — Arquitectura
- Servicio multi-fuente: **JSearch** (LinkedIn/Indeed), **Adzuna MX**, **RemoteOK**
- API keys configuradas: `RAPIDAPI_KEY`, `ADZUNA_APP_ID`, `ADZUNA_APP_KEY`
- Caché en PostgreSQL (`jobs_cache`) con TTL de 12h
- Rate limiting: **5 búsquedas/día** por usuario (sin cooldown)
- Algoritmo de match: compara `skills del CV` vs `tags del empleo` → score 60–98%
- Endpoint ligero `/api/jobs/extract-and-search`: extrae skills del PDF sin análisis completo (ahorra tokens)
- Auto-búsqueda al subir CV: dispara refresh en background (fire & forget)

---

## 🔴 Bugs activos

### 1. Vacantes — "Error del servidor" al cargar
**Síntoma:** La página muestra error aunque el usuario ya tiene CV analizado.

**Causa raíz:**
- El caché tiene `jobs: []` de una búsqueda anterior con un query demasiado específico ("Power House Harvest Endevor TCP/IP"), que no devuelve resultados en JSearch ni Adzuna
- El error "Error del servidor" es un **estado residual** de cuando se agotó el rate limit en pruebas previas y no se limpió correctamente en el frontend

**Fix pendiente:**
- [ ] Envolver `refreshJobsCache` en try-catch dentro de `getCachedJobs` para que no burbujee al usuario
- [ ] En `loadFromCache` del frontend: limpiar error residual aunque el API devuelva `success: true`
- [ ] Mejorar el query: filtrar skills legacy muy específicas (Endevor, Harvest, Power House) y buscar términos más amplios
- [ ] Cuando todos los resultados son `[]`: mostrar mensaje amigable + campo de búsqueda manual

### 2. Matches — Llama a ruta desactualizada
- La página de Matches llama a `/api/jobs/search` (ruta antigua sin caché)
- Debería llamar a `/api/jobs/extract-and-search` para ser consistente con Vacantes

---

## 🟡 Existe pero sin funcionalidad real

| Módulo | Estado UI | Qué falta |
|--------|-----------|-----------|
| **Configuración** | Completa | Guardar nombre/email en tabla `user` de Better Auth |
| **Notificaciones** | Placeholder | Lógica de alertas cuando hay nuevas vacantes |
| **Pago / Pro** | UI de upgrade | Integración con Stripe o sistema de pagos |
| **Historial de CVs** | Guardado en BD | UI para ver y restaurar versiones anteriores |
| **Aplicar a vacante** | Ruta existe | Contenido (redirige al portal original) |

---

## 🗺️ Prioridad recomendada

### 🔴 Urgente (bloquea la demo)
1. Fix bug de Vacantes — error residual + caché vacío + query inteligente para skills legacy
2. Fix Matches — conectar a la misma caché que Vacantes

### 🟡 Importante (completa el MVP)
3. Configuración — guardar datos de perfil reales
4. Match mejorado — explicar POR QUÉ matches (skills específicas que coinciden)

### 🟢 Post-MVP
5. Historial de CVs con UI
6. Notificaciones de nuevas vacantes
7. Pro / Pago (Stripe)
8. Deploy en producción (resolver pdflatex en cloud)

---

## 📐 Arquitectura actual

```
Browser
  │
  ├── /dashboard/cv
  │     ├── POST /api/cv/analyze    → Gemini análisis completo + LaTeX
  │     └── GET  /api/cv/export-pdf → pdflatex → descarga PDF
  │
  ├── /dashboard/vacantes
  │     ├── GET  /api/jobs/extract-and-search  → Caché inteligente (PostgreSQL)
  │     └── POST /api/jobs/extract-and-search  → Upload PDF → extrae skills → busca empleos
  │
  ├── /dashboard/matches
  │     └── GET  /api/jobs/search  ⚠️ Ruta desactualizada, usar extract-and-search
  │
  └── /api/dev/reset-job-limit  → Solo desarrollo, eliminar en producción
```

---

## ⚠️ Notas Importantes

> **Seguridad:** Las API keys están en `.env.local`. Verificar que esté en `.gitignore` antes de subir a GitHub.

> **Deploy:** `pdflatex` está instalado localmente. En Vercel/Railway sin Docker, el PDF export fallará. Alternativas: Gotenberg, Puppeteer o API de Overleaf.

> **Tokens:** Cada análisis completo de CV usa ~10,000 tokens de Gemini. El endpoint ligero de Vacantes usa ~500 tokens. El caché evita re-analizar en cada carga de página.
