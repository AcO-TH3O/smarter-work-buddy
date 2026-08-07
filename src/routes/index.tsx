import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, CalendarCheck, Gauge, Mail, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { SectionCard } from "@/components/SectionCard";
import { ResponsibleAINotice } from "@/components/ResponsibleAINotice";
import { useHistory } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — AI Workplace Productivity Assistant" },
      {
        name: "description",
        content:
          "Write emails, summarize meetings and plan tasks with AI-powered workplace productivity tools.",
      },
      { property: "og:title", content: "AI Workplace Productivity Assistant" },
      {
        property: "og:description",
        content: "AI tools for professional emails, meeting summaries and daily task planning.",
      },
    ],
  }),
  component: Dashboard,
});

const tools = [
  {
    to: "/email",
    icon: Mail,
    title: "Smart Email Generator",
    text: "Create professional emails in seconds using AI.",
  },
  {
    to: "/meetings",
    icon: BookOpen,
    title: "Meeting Notes Summarizer",
    text: "Convert long meeting notes into short, easy-to-read summaries.",
  },
  {
    to: "/planner",
    icon: CalendarCheck,
    title: "AI Task Planner",
    text: "Organize your day or week using AI.",
  },
] as const;

function Dashboard() {
  const { history } = useHistory();
  const emails = history.filter((h) => h.kind === "email").length;
  const meetings = history.filter((h) => h.kind === "meeting").length;
  const tasks = history.filter((h) => h.kind === "task").length;
  const score = Math.min(100, 40 + emails * 5 + meetings * 8 + tasks * 7);

  const stats = [
    { label: "Emails Generated", value: emails, icon: Mail },
    { label: "Meeting Summaries Created", value: meetings, icon: BookOpen },
    { label: "Tasks Planned", value: tasks, icon: CalendarCheck },
    { label: "Productivity Score", value: `${score}%`, icon: Gauge },
  ];

  return (
    <AppShell
      title="Welcome back!"
      subtitle="Boost your workplace productivity with AI-powered tools that help you write emails, summarize meetings, and organize your daily tasks."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-primary">
              <s.icon className="h-5 w-5" />
            </span>
            <p className="mt-4 text-3xl font-extrabold">{s.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {tools.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            className="group rounded-2xl border border-border bg-card p-6 shadow-card transition-shadow hover:shadow-raised"
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground">
              <t.icon className="h-5 w-5" />
            </span>
            <h2 className="mt-4 text-base font-bold">{t.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t.text}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
              Open tool
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <SectionCard title="Recent activity" description="Your latest AI-generated results.">
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nothing yet — generate an email, summary or plan to see it here.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {history.slice(0, 5).map((h) => (
                <li key={h.id} className="py-3">
                  <p className="text-sm font-semibold">{h.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{h.preview}</p>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <ResponsibleAINotice />
    </AppShell>
  );
}
