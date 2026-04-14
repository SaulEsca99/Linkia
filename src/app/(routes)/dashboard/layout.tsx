import { Sidebar } from "@/client/components/dashboard/sidebar"
import { MobileNav } from "@/client/components/dashboard/mobile-nav"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar />
      <MobileNav />
      <main className="lg:pl-72 pb-20 lg:pb-0">
        {children}
      </main>
    </div>
  )
}
