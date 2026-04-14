import {
  FileText,
  Search,
  Target,
  TrendingUp,
  Upload,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Bienvenido a JobAI 👋
        </h2>
        <p className="mt-1 text-gray-500">
          Tu copiloto de búsqueda de empleo con IA
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "CVs subidos",
            value: "0",
            icon: FileText,
            color: "text-blue-600 bg-blue-100",
          },
          {
            label: "Búsquedas",
            value: "0",
            icon: Search,
            color: "text-purple-600 bg-purple-100",
          },
          {
            label: "Matches",
            value: "0",
            icon: Target,
            color: "text-emerald-600 bg-emerald-100",
          },
          {
            label: "Score promedio",
            value: "—",
            icon: TrendingUp,
            color: "text-amber-600 bg-amber-100",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}
            >
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Link
          href="/dashboard/cv"
          className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
            <Upload className="h-7 w-7 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">Subir mi CV</h3>
            <p className="text-sm text-gray-500">
              Sube tu PDF y la IA extraerá tu perfil profesional
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-300 transition group-hover:translate-x-1 group-hover:text-indigo-500" />
        </Link>

        <Link
          href="/dashboard/jobs"
          className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
            <Search className="h-7 w-7 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">Buscar vacantes</h3>
            <p className="text-sm text-gray-500">
              Encuentra ofertas compatibles con tu perfil
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-300 transition group-hover:translate-x-1 group-hover:text-emerald-500" />
        </Link>
      </div>

      {/* Empty state hint */}
      <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
        <FileText className="mx-auto h-12 w-12 text-gray-300" />
        <h3 className="mt-4 text-lg font-semibold text-gray-600">
          Empieza subiendo tu CV
        </h3>
        <p className="mt-2 text-sm text-gray-400">
          Una vez que subas tu CV, podrás buscar vacantes y ver tus matches aquí
        </p>
        <Link
          href="/dashboard/cv"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
        >
          <Upload className="h-4 w-4" />
          Subir CV
        </Link>
      </div>
    </div>
  );
}
