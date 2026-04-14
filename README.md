# JobAI 🤖💼

**Tu Copiloto Inteligente para Encontrar Trabajo en LATAM**

JobAI es una plataforma web impulsada por inteligencia artificial que actúa como copiloto personal en la búsqueda de empleo. Sube tu CV, encuentra vacantes compatibles y obtén una versión adaptada para cada oferta — todo en minutos.

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 16 + React 19 |
| Lenguaje | TypeScript 5 |
| Estilos | Tailwind CSS 4 + shadcn/ui |
| ORM / DB | Drizzle ORM + PostgreSQL |
| Auth | Better Auth |
| IA | OpenAI GPT-4o-mini |
| PDF Parser | pdf-parse |
| Estado | TanStack Query |
| Validación | Zod |

## Requisitos

- Node.js 18+
- pnpm 10+
- Docker (para PostgreSQL local)
- API Key de OpenAI

## Setup

```bash
# 1. Clonar el repositorio
git clone <tu-repo-url>
cd jobai

# 2. Instalar dependencias
pnpm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales

# 4. Levantar la base de datos
docker compose up -d

# 5. Aplicar schemas a la DB
pnpm db:push

# 6. Arrancar el servidor de desarrollo
pnpm dev
```

## Arquitectura

El proyecto sigue una arquitectura hexagonal con separación estricta entre capas:

```
src/
├── app/           # Next.js App Router (Presentation)
├── client/        # Módulos del lado del cliente
│   └── modules/
│       ├── identity/   # Auth (Better Auth)
│       ├── cv/         # Upload y preview de CV
│       ├── jobs/       # Listado de vacantes
│       └── match/      # Comparación CV vs Vacante
├── server/        # Módulos del lado del servidor
│   ├── db/             # Drizzle connection + schemas
│   └── modules/
│       ├── identity/   # Auth config
│       ├── cv/         # Análisis de CV con IA
│       ├── jobs/       # Scraper de vacantes
│       └── match/      # Scoring + CV adaptado
└── shared/        # Tipos TypeScript compartidos
```

## Autor

**Saúl Escalante** — Proyecto Startup · LATAM · 2026
