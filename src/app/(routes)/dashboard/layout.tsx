import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | JobAI",
  description: "Tu panel de control para encontrar el trabajo ideal",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar — se implementará en Semana 5 */}
      <aside className="hidden w-64 border-r border-gray-200 bg-gray-50 lg:block">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <span className="text-xl font-bold text-indigo-600">JobAI</span>
        </div>
        <nav className="space-y-1 p-4">
          <a
            href="/dashboard"
            className="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700"
          >
            📊 Dashboard
          </a>
          <a
            href="/dashboard/cv"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            📄 Mi CV
          </a>
          <a
            href="/dashboard/jobs"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            💼 Vacantes
          </a>
          <a
            href="/dashboard/matches"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            🎯 Matches
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <header className="flex h-16 items-center justify-between border-b px-6">
          <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
