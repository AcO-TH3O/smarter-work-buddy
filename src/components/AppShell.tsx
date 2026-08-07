import { Link, useRouterState } from "@tanstack/react-router";
import {
  BookOpen,
  CalendarCheck,
  HelpCircle,
  History,
  LayoutDashboard,
  Mail,
  Menu,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/email", label: "Smart Email Generator", icon: Mail },
  { to: "/meetings", label: "Meeting Notes Summarizer", icon: BookOpen },
  { to: "/planner", label: "AI Task Planner", icon: CalendarCheck },
  { to: "/history", label: "History", icon: History },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/help", label: "Help", icon: HelpCircle },
] as const;

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 flex h-16 items-center gap-3 bg-navy px-4 text-navy-foreground sm:px-6">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle navigation"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10 transition-colors hover:bg-white/20 lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="truncate text-base font-bold sm:text-lg">
            AI Workplace Productivity Assistant
          </span>
        </div>
      </header>

      <div className="flex">
        {open && (
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
            className="fixed inset-0 top-16 z-30 bg-navy/50 lg:hidden"
          />
        )}
        <aside
          className={`fixed top-16 bottom-0 left-0 z-30 w-72 shrink-0 overflow-y-auto bg-sidebar p-4 text-sidebar-foreground transition-transform lg:sticky lg:h-[calc(100vh-4rem)] lg:translate-x-0 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <nav className="flex flex-col gap-1">
            {nav.map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-raised"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="flex min-h-[calc(100vh-4rem)] w-full min-w-0 flex-col">
          <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10">
            <div className="mx-auto w-full max-w-5xl">
              <div className="mb-8">
                <h1 className="text-2xl font-extrabold sm:text-3xl">{title}</h1>
                {subtitle && (
                  <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
                )}
              </div>
              {children}
            </div>
          </main>
          <AppFooter />
        </div>
      </div>
    </div>
  );
}

function AppFooter() {
  return (
    <footer className="bg-navy px-4 py-8 text-navy-foreground sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-5xl">
        <p className="text-sm font-bold">AI Workplace Productivity Assistant</p>
        <p className="mt-1 text-sm text-navy-foreground/70">
          Empowering professionals through responsible AI solutions.
        </p>
        <p className="mt-4 text-xs text-navy-foreground/60">© 2026 All Rights Reserved.</p>
      </div>
    </footer>
  );
}
