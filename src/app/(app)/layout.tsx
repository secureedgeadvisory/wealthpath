import { TrendingUp } from "lucide-react";
import Link from "next/link";
import { SignOutButton } from "@/components/auth-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sidebar } from "@/components/nav/sidebar";
import { BottomNav } from "@/components/nav/bottom-nav";
import { OfflineBanner } from "@/components/pwa/offline-banner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile/tablet top bar */}
        <header className="lg:hidden border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="px-4 flex items-center justify-between h-14">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-wealth flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold tracking-tight">WealthPath</span>
            </Link>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <SignOutButton />
            </div>
          </div>
        </header>

        {/* Desktop top bar (minimal — just theme + signout) */}
        <header className="hidden lg:flex items-center justify-end h-14 border-b border-border px-6 bg-card/30">
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <SignOutButton />
          </div>
        </header>

        {/* Offline banner */}
        <OfflineBanner />

        {/* Page content */}
        <main className="flex-1 pb-20 lg:pb-0">{children}</main>

        {/* Disclaimer footer — desktop only */}
        <footer className="hidden lg:block border-t border-border py-4 px-4">
          <p className="text-[10px] text-muted-foreground text-center max-w-2xl mx-auto">
            These projections are for educational purposes only. Past performance
            does not guarantee future results. This is not financial advice.
          </p>
        </footer>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
}
