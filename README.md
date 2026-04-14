# Linkia 🔗✨

**Tu copiloto inteligente para encontrar trabajo en México y LATAM.**

Linkia es una plataforma web impulsada por IA que analiza tu CV, encuentra vacantes compatibles y genera una versión adaptada para cada oferta — todo en minutos.

---

## 🚀 Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16 (App Router) |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS v4 + shadcn/ui |
| Base de datos | PostgreSQL + Drizzle ORM |
| Auth | Better Auth |
| IA | OpenAI GPT-4o |
| Infraestructura | Docker Compose |

---

## 📁 Estructura

```
src/
├── app/                    # Next.js App Router
│   ├── (routes)/
│   │   ├── (landing)/      # Página principal
│   │   ├── (auth)/         # sign-in, sign-up
│   │   └── dashboard/      # App principal
│   └── api/                # Route handlers
├── client/
│   └── components/
│       ├── landing/        # Componentes de la landing
│       ├── dashboard/      # Sidebar, MobileNav
│       └── ui/             # shadcn/ui components
└── server/
    └── modules/
        ├── cv/             # Análisis de CV con OpenAI
        ├── identity/       # Auth con Better Auth
        ├── jobs/           # Schema de vacantes
        └── match/          # Schema de matches
```

---

## 🛠️ Instalación

```bash
# 1. Instalar dependencias
pnpm install

# 2. Copiar variables de entorno
cp .env.example .env.local
# Edita .env.local con tus credenciales

# 3. Levantar base de datos
docker compose up -d

# 4. Correr migraciones
pnpm db:migrate

# 5. Iniciar servidor de desarrollo
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## 🔑 Variables de entorno

Ver `.env.example` para la lista completa. Las más importantes:

```env
DATABASE_URL=postgresql://linkia:password@localhost:5432/linkia-db
BETTER_AUTH_SECRET=tu_secret_aqui
OPENAI_API_KEY=sk-proj-...
```

---

## 📋 Comandos

```bash
pnpm dev          # Servidor de desarrollo
pnpm build        # Build de producción
pnpm db:generate  # Generar migraciones Drizzle
pnpm db:migrate   # Ejecutar migraciones
pnpm db:studio    # Drizzle Studio (UI de DB)
```
