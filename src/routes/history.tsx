import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, CalendarCheck, Mail, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { SectionCard } from "@/components/SectionCard";
import { Button } from "@/components/ui/button";
import { useHistory, type HistoryKind } from "@/lib/store";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "History — AI Workplace Productivity Assistant" },
      { name: "description", content: "Review and manage your saved AI-generated results." },
      { property: "og:title", content: "History" },
      { property: "og:description", content: "Every email, summary and plan you've generated." },
    ],
  }),
  component: HistoryPage,
});

const icons: Record<HistoryKind, typeof Mail> = {
  email: Mail,
  meeting: BookOpen,
  task: CalendarCheck,
};

function HistoryPage() {
  const { history, remove, clear } = useHistory();

  return (
    <AppShell title="History" subtitle="Everything you've generated, stored on this device.">
      <SectionCard
        title={`${history.length} saved item${history.length === 1 ? "" : "s"}`}
        action={
          history.length > 0 ? (
            <Button variant="outline" size="sm" onClick={clear}>
              Clear all
            </Button>
          ) : undefined
        }
      >
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground">No history yet.</p>
        ) : (
          <ul className="grid gap-3">
            {history.map((h) => {
              const Icon = icons[h.kind];
              return (
                <li
                  key={h.id}
                  className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 rounded-xl border border-border p-4"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{h.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{h.preview}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(h.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label="Delete item"
                    onClick={() => remove(h.id)}
                    className="text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>
    </AppShell>
  );
}
