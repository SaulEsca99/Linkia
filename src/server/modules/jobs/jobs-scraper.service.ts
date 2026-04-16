/**
 * jobs-scraper.service.ts
 *
 * Scraper de vacantes para el mercado mexicano.
 * Fuentes:
 *  1. OCC Mundial  — usa el HTML SSR + API interno de detalles
 *  2. Computrabajo — usa el HTML SSR con selectores article.box_offer
 *
 * Estrategia: Promise.allSettled → los errores por fuente son independientes.
 */
import * as cheerio from "cheerio";

// ── Tipos públicos ────────────────────────────────────────────────────────────

export interface ScrapedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  salary?: string;
  type: string;
  tags: string[];
  source: "OCC" | "Computrabajo";
  scrapedAt: Date;
}

export interface ScrapeInput {
  keywords: string[];    // e.g. ["PHP", "MySQL"]
  ubicacion?: string;    // e.g. "Ciudad de México"
  maxPerSource?: number; // default 15
}

export interface ScrapeResult {
  jobs: ScrapedJob[];
  errors: { source: string; message: string }[];
  totalFound: number;
}

// ── Constantes ───────────────────────────────────────────────────────────────

const DEFAULT_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Language": "es-MX,es;q=0.9,en;q=0.8",
  "Accept-Encoding": "identity", // evitar gzip comprimido que puede fallar
  "Cache-Control": "no-cache",
  "Upgrade-Insecure-Requests": "1",
};

const TECH_TAGS = [
  "PHP","Python","JavaScript","TypeScript","Java","C#","C++","Ruby","Go","Rust","Kotlin","Swift",
  "React","Angular","Vue","Node","Laravel","Django","Spring","Next.js","NestJS","Express",
  "MySQL","PostgreSQL","Oracle","SQL Server","MongoDB","Redis","Elasticsearch","SQLite",
  "AWS","Azure","GCP","Docker","Kubernetes","Terraform","Linux","Git","GitHub","GitLab",
  "REST","GraphQL","gRPC","HTML","CSS","SCSS","Bootstrap","Tailwind",
  "SAP","Salesforce","Jira","Scrum","Agile","DevOps","CI/CD",
];

// ── Utilidades ────────────────────────────────────────────────────────────────

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extractTags(text: string): string[] {
  const upper = text.toUpperCase();
  return TECH_TAGS.filter(t => upper.includes(t.toUpperCase())).slice(0, 8);
}

function detectType(text: string): string {
  const t = text.toLowerCase();
  if (t.includes("home office") || t.includes("remoto") || t.includes("remote")) return "Remoto";
  if (t.includes("medio tiempo") || t.includes("part time")) return "Medio tiempo";
  if (t.includes("becario") || t.includes("pasante") || t.includes("practicante")) return "Becario";
  return "Tiempo completo";
}

function makeId(source: string, title: string, company: string): string {
  const raw = `${source}:${title.slice(0, 30)}:${company.slice(0, 20)}`;
  let hash = 5381;
  for (const c of raw) hash = ((hash << 5) + hash + c.charCodeAt(0)) >>> 0;
  return `${source.toLowerCase()}-${hash.toString(36)}`;
}

async function fetchHtml(url: string, extraHeaders: Record<string, string> = {}): Promise<string> {
  const res = await fetch(url, {
    headers: { ...DEFAULT_HEADERS, ...extraHeaders },
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  return res.text();
}

// ── Scraper: OCC Mundial ──────────────────────────────────────────────────────
// OCC renderiza los empleos en SSR. El HTML contiene:
//   <h2 class="text-grey-900 text-lg ...">TITULO</h2>
//   <a class="it-blank" ...>EMPRESA</a>
//   <p class="text-sm ...">UBICACION</p>
//   <div data-job-id> o script con IDs para construir la URL
// Los pares título + empresa están siempre en el HTML.

async function scrapeOCC(keywords: string[], ubicacion?: string, max = 15): Promise<ScrapedJob[]> {
  const query = keywords
    .slice(0, 3)
    .map(k => slugify(k))
    .join("-");

  const locPart = ubicacion ? `en-${slugify(ubicacion)}/` : "";
  const url = `https://www.occ.com.mx/empleos/de-${query}/${locPart}`;

  const html = await fetchHtml(url, {
    "Referer": "https://www.occ.com.mx/",
    "Sec-Fetch-Site": "same-origin",
  });

  const $ = cheerio.load(html);
  const jobs: ScrapedJob[] = [];

  // OCC estructura: cada empleo es un bloque con h2 title dentro de un contenedor de lista
  // Usamos el h2 con las clases conocidas como ancla y subimos al padre para extraer datos

  // Intentar primero con data-id (disponible si la página responde con JS hydrated):
  const byDataId = $("[data-id]");

  if (byDataId.length > 0) {
    byDataId.each((_, el) => {
      if (jobs.length >= max) return false;
      const card = $(el);
      const dataId = card.attr("data-id") ?? "";
      const title = card.find("h2").first().text().trim();
      if (!title) return;

      const company =
        card.find("a.it-blank").first().text().trim() ||
        card.find("a[href*='/bolsa-de-trabajo']").first().text().trim() ||
        "Empresa confidencial";

      const location =
        card.find("div.no-alter-loc-text p").first().text().trim() ||
        card.find("p.text-sm").first().text().trim() ||
        ubicacion || "México";

      const bullets: string[] = [];
      card.find("li").each((_, li) => {
        const t = $(li).text().trim();
        if (t.length > 3 && t.length < 150) bullets.push(t);
      });
      const description = bullets.slice(0, 3).join(" • ") || title;
      const salary = card.find("[class*='salary'], [class*='sueldo']").first().text().trim() || undefined;
      const jobUrl = dataId
        ? `https://www.occ.com.mx/empleos/oferta/?jobid=${dataId}`
        : url;

      jobs.push({
        id: makeId("OCC", title, company),
        title, company,
        location: location.replace(/\s+/g, " ").trim(),
        description,
        url: jobUrl,
        salary: salary && salary.includes("$") ? salary : undefined,
        type: detectType(title + " " + description),
        tags: extractTags(title + " " + description + " " + keywords.join(" ")),
        source: "OCC",
        scrapedAt: new Date(),
      });
    });
  } else {
    // Fallback: buscar h2 con clases específicas de OCC
    $("h2.text-lg, h2[class*='text-grey-900']").each((_, h2El) => {
      if (jobs.length >= max) return false;
      const h2 = $(h2El);
      const title = h2.text().trim();
      if (!title || title.length < 4) return;

      // Subir hasta el contenedor del card (~3 niveles arriba del h2)
      const card = h2.closest("div[class*='shadow'], div[class*='bg-white'], article, li").first()
        || h2.parent().parent().parent();

      const company =
        card.find("a.it-blank, a[href*='bolsa-de-trabajo']").first().text().trim() ||
        card.find("a[class*='company']").first().text().trim() ||
        "Empresa confidencial";

      const location =
        card.find("p.text-sm, p[class*='font-light']").first().text().trim() ||
        ubicacion || "México";

      const bullets: string[] = [];
      card.find("li").each((_, li) => {
        const t = $(li).text().trim();
        if (t.length > 3 && t.length < 150) bullets.push(t);
      });

      jobs.push({
        id: makeId("OCC", title, company),
        title, company,
        location: location.replace(/\s+/g, " ").trim(),
        description: bullets.slice(0, 3).join(" • ") || `${title} en OCC Mundial`,
        url,
        type: detectType(title + " " + bullets.join(" ")),
        tags: extractTags(title + " " + keywords.join(" ")),
        source: "OCC",
        scrapedAt: new Date(),
      });
    });
  }

  return jobs.slice(0, max);
}

// ── Scraper: Computrabajo ─────────────────────────────────────────────────────
// Computrabajo tiene HTML SSR clásico (sin JS necesario para el listado inicial).
// Estructura confirmada por inspección DOM:
//   article.box_offer
//     h2 a.js-o-link  → título + URL relativa
//     p.dFlex a.fc_base → empresa
//     p span.mr10 → ubicación

async function scrapeComputrabajo(keywords: string[], ubicacion?: string, max = 15): Promise<ScrapedJob[]> {
  const query = keywords
    .slice(0, 3)
    .map(k => slugify(k))
    .join("-");

  const locPart = ubicacion ? `-en-${slugify(ubicacion)}` : "";
  const path = `/trabajo-de-${query}${locPart}`;
  const url = `https://www.computrabajo.com.mx${path}`;

  const html = await fetchHtml(url, {
    "Referer": "https://www.computrabajo.com.mx/",
    "Sec-Fetch-Site": "same-origin",
    "Sec-Fetch-Dest": "document",
  });

  const $ = cheerio.load(html);
  const jobs: ScrapedJob[] = [];

  // Selector principal confirmado por inspección real del DOM
  const cards = $("article.box_offer, article[data-offers-grid-offer-item-container]");

  cards.each((_, el) => {
    if (jobs.length >= max) return false;
    const card = $(el);

    // Título + URL
    const titleLink = card.find("h2 a.js-o-link, h2 a[href*='/oferta-de-trabajo/']").first();
    const title = titleLink.text().trim();
    if (!title || title.length < 3) return;

    const relHref = titleLink.attr("href") ?? "";
    const jobUrl = relHref.startsWith("http")
      ? relHref
      : `https://www.computrabajo.com.mx${relHref}`;

    // Empresa
    const company =
      card.find("p.dFlex a.fc_base, p.fs16 a.fc_base").first().text().trim() ||
      card.find("a.fc_base").first().text().trim() ||
      card.find("p").eq(1).text().trim().split(/[\n|,]/)[0].trim() ||
      "Empresa confidencial";

    // Ubicación
    const location =
      card.find("p span.mr10").first().text().trim() ||
      card.find("span.mr10").first().text().trim() ||
      card.find("p.fs16").last().text().trim().split(/[\n|]+/)[0].trim() ||
      ubicacion || "México";

    // Descripción
    const description =
      card.find("p.fs16.mt5, p.mt5, div.mb5").text().trim().replace(/\s+/g, " ").slice(0, 400) ||
      `${title} - Vacante en Computrabajo`;

    // Salario
    const salaryText = card.find("[class*='fc_base b'], b.fc_base").text().trim();
    const salary = salaryText && salaryText.includes("$") ? salaryText : undefined;

    jobs.push({
      id: makeId("Computrabajo", title, company),
      title,
      company: company.replace(/\s+/g, " ").trim(),
      location: location.replace(/\s+/g, " ").trim(),
      description: description.trim(),
      url: jobUrl,
      salary,
      type: detectType(title + " " + description),
      tags: extractTags(title + " " + description + " " + keywords.join(" ")),
      source: "Computrabajo",
      scrapedAt: new Date(),
    });
  });

  // Si no encontramos con el selector principal, intentar con h2 genérico
  if (jobs.length === 0) {
    $("h2 a[href*='/oferta-de-trabajo/'], h2 a[href*='/empleo/']").each((_, el) => {
      if (jobs.length >= max) return false;
      const link = $(el);
      const title = link.text().trim();
      if (!title) return;
      const href = link.attr("href") ?? "";
      const card = link.closest("article, li, div[class*='offer']");
      const company = card.find("a[class*='company'], a[class*='fc_base']").first().text().trim() || "Empresa confidencial";
      const location = card.find("span[class*='mr10'], p[class*='location']").first().text().trim() || ubicacion || "México";

      jobs.push({
        id: makeId("Computrabajo", title, company),
        title, company,
        location,
        description: `${title} - Vacante en Computrabajo`,
        url: href.startsWith("http") ? href : `https://www.computrabajo.com.mx${href}`,
        type: detectType(title),
        tags: extractTags(title + " " + keywords.join(" ")),
        source: "Computrabajo",
        scrapedAt: new Date(),
      });
    });
  }

  return jobs.slice(0, max);
}

// ── Función pública ───────────────────────────────────────────────────────────

export async function scrapeJobs(input: ScrapeInput): Promise<ScrapeResult> {
  const { keywords, ubicacion, maxPerSource = 15 } = input;

  if (!keywords?.length) {
    return { jobs: [], errors: [{ source: "input", message: "keywords[] es requerido" }], totalFound: 0 };
  }

  const [occRes, ctRes] = await Promise.allSettled([
    scrapeOCC(keywords, ubicacion, maxPerSource),
    scrapeComputrabajo(keywords, ubicacion, maxPerSource),
  ]);

  const jobs: ScrapedJob[] = [];
  const errors: { source: string; message: string }[] = [];

  if (occRes.status === "fulfilled") {
    jobs.push(...occRes.value);
  } else {
    const msg = occRes.reason instanceof Error ? occRes.reason.message : String(occRes.reason);
    console.error("[scrapeOCC]", msg);
    errors.push({ source: "OCC", message: msg });
  }

  if (ctRes.status === "fulfilled") {
    jobs.push(...ctRes.value);
  } else {
    const msg = ctRes.reason instanceof Error ? ctRes.reason.message : String(ctRes.reason);
    console.error("[scrapeComputrabajo]", msg);
    errors.push({ source: "Computrabajo", message: msg });
  }

  // Deduplicar por título+empresa
  const seen = new Set<string>();
  const unique = jobs.filter(j => {
    const key = `${j.title.toLowerCase().slice(0, 25)}|${j.company.toLowerCase().slice(0, 20)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return { jobs: unique, errors, totalFound: unique.length };
}
