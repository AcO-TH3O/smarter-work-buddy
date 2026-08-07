import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { SectionCard } from "@/components/SectionCard";
import { OutputToolbar } from "@/components/OutputToolbar";
import { ResponsibleAINotice } from "@/components/ResponsibleAINotice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { planTasks } from "@/lib/ai.functions";
import { addHistory, useSettings } from "@/lib/store";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — AI Workplace Assistant" },
      {
        name: "description",
        content: "Organize your day or week with an AI-balanced, priority-aware schedule.",
      },
      { property: "og:title", content: "AI Task Planner" },
      {
        property: "og:description",
        content: "Add tasks, set priorities and generate a balanced daily or weekly schedule.",
      },
    ],
  }),
  component: PlannerPage,
});

const priorities = ["High", "Medium", "Low"] as const;
type Priority = (typeof priorities)[number];
type Task = { id: string; title: string; priority: Priority };
type Plan = { blocks: { label: string; items: { task: string; priority: string; time: string }[] }[] };

const priorityClass: Record<string, string> = {
  High: "bg-destructive/10 text-destructive",
  Medium: "bg-warning/15 text-warning",
  Low: "bg-success/15 text-success",
};

function PlannerPage() {
  const { settings } = useSettings();
  const run = useServerFn(planTasks);
  const [mode, setMode] = useState<"Daily" | "Weekly">(settings.plannerMode);
  const [draft, setDraft] = useState("");
  const [draftPriority, setDraftPriority] = useState<Priority>("Medium");
  const [tasks, setTasks] = useState<Task[]>([
    { id: "1", title: "Respond to emails", priority: "High" },
    { id: "2", title: "Finish presentation", priority: "High" },
    { id: "3", title: "Client follow-up", priority: "Medium" },
  ]);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  function addTask() {
    if (!draft.trim()) return;
    setTasks((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title: draft.trim(), priority: draftPriority },
    ]);
    setDraft("");
  }

  async function generate() {
    if (tasks.length === 0) {
      toast.error("Add at least one task.");
      return;
    }
    setLoading(true);
    try {
      const res = (await run({
        data: { mode, tasks: tasks.map(({ title, priority }) => ({ title, priority })) },
      })) as Plan;
      setPlan(res);
      setEditing(false);
      addHistory({
        kind: "task",
        title: `${mode} plan · ${tasks.length} tasks`,
        preview: res.blocks.map((b) => `${b.label}: ${b.items.length} items`).join(" · "),
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not build the schedule.");
    } finally {
      setLoading(false);
    }
  }

  const copyText = plan
    ? plan.blocks
        .map(
          (b) =>
            `${b.label}\n${b.items.map((i) => `- ${i.time} ${i.task} (${i.priority})`).join("\n")}`,
        )
        .join("\n\n")
    : "";

  return (
    <AppShell title="AI Task Planner" subtitle="Organize your day or week using AI.">
      <SectionCard title="Your tasks">
        <div className="grid gap-5">
          <div className="grid gap-2">
            <Label>Planning mode</Label>
            <div className="flex gap-2">
              {(["Daily", "Weekly"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                    mode === m
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card hover:bg-accent"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="task">Add a task</Label>
            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
              <Input
                id="task"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTask()}
                placeholder="Team meeting"
              />
              <div className="flex gap-2">
                {priorities.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setDraftPriority(p)}
                    className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                      draftPriority === p
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card hover:bg-accent"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <Button type="button" variant="outline" onClick={addTask}>
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
          </div>

          <ul className="grid gap-2">
            {tasks.map((t) => (
              <li
                key={t.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border bg-secondary/60 px-4 py-3"
              >
                <span className="truncate text-sm font-medium">{t.title}</span>
                <span className="flex items-center gap-2">
                  <span
                    className={`rounded-lg px-2 py-1 text-xs font-semibold ${priorityClass[t.priority]}`}
                  >
                    {t.priority}
                  </span>
                  <button
                    type="button"
                    aria-label={`Remove ${t.title}`}
                    onClick={() => setTasks((prev) => prev.filter((x) => x.id !== t.id))}
                    className="text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </span>
              </li>
            ))}
          </ul>

          <div>
            <Button onClick={generate} disabled={loading}>
              {loading ? "Planning…" : "Generate schedule"}
            </Button>
          </div>
        </div>
      </SectionCard>

      {plan && (
        <div className="mt-6 grid gap-6">
          <SectionCard
            title={`${mode} schedule`}
            action={
              <OutputToolbar
                editing={editing}
                onToggleEdit={() => setEditing((v) => !v)}
                copyText={copyText}
                onClear={() => setPlan(null)}
                onRegenerate={generate}
                regenerating={loading}
              />
            }
          >
            <div className="grid gap-5">
              {plan.blocks.map((block, bi) => (
                <div key={bi}>
                  <p className="text-sm font-bold text-primary">{block.label}</p>
                  <ul className="mt-2 grid gap-2">
                    {block.items.map((item, ii) => (
                      <li
                        key={ii}
                        className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border px-4 py-3"
                      >
                        {editing ? (
                          <Input
                            value={item.task}
                            onChange={(e) =>
                              setPlan((prev) => {
                                if (!prev) return prev;
                                const blocks = prev.blocks.map((b, i) =>
                                  i === bi
                                    ? {
                                        ...b,
                                        items: b.items.map((it, j) =>
                                          j === ii ? { ...it, task: e.target.value } : it,
                                        ),
                                      }
                                    : b,
                                );
                                return { blocks };
                              })
                            }
                          />
                        ) : (
                          <span className="min-w-0 text-sm">
                            <span className="font-medium">{item.task}</span>
                            {item.time && (
                              <span className="ml-2 text-muted-foreground">{item.time}</span>
                            )}
                          </span>
                        )}
                        <span
                          className={`rounded-lg px-2 py-1 text-xs font-semibold ${
                            priorityClass[item.priority] ?? "bg-secondary text-foreground"
                          }`}
                        >
                          {item.priority}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}

      <ResponsibleAINotice />
    </AppShell>
  );
}
