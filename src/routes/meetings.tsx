import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { SectionCard } from "@/components/SectionCard";
import { OutputToolbar } from "@/components/OutputToolbar";
import { ResponsibleAINotice } from "@/components/ResponsibleAINotice";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { summarizeMeeting } from "@/lib/ai.functions";
import { addHistory } from "@/lib/store";

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — AI Workplace Assistant" },
      {
        name: "description",
        content:
          "Turn long meeting notes into a short summary with action items, decisions and deadlines.",
      },
      { property: "og:title", content: "Meeting Notes Summarizer" },
      {
        property: "og:description",
        content: "Paste your notes and get a concise summary with action items and deadlines.",
      },
    ],
  }),
  component: MeetingsPage,
});

type Summary = {
  summary: string;
  actionItems: string[];
  decisions: string[];
  deadlines: string[];
};

function MeetingsPage() {
  const run = useServerFn(summarizeMeeting);
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<Summary | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  async function generate() {
    if (!notes.trim()) {
      toast.error("Paste your meeting notes first.");
      return;
    }
    setLoading(true);
    try {
      const res = (await run({ data: { notes } })) as Summary;
      setResult(res);
      setEditing(false);
      addHistory({ kind: "meeting", title: "Meeting summary", preview: res.summary });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not summarize the notes.");
    } finally {
      setLoading(false);
    }
  }

  const copyText = result
    ? [
        `Summary\n${result.summary}`,
        `Action Items\n${result.actionItems.map((i) => `- ${i}`).join("\n")}`,
        `Key Decisions\n${result.decisions.map((i) => `- ${i}`).join("\n")}`,
        `Deadlines\n${result.deadlines.map((i) => `- ${i}`).join("\n")}`,
      ].join("\n\n")
    : "";

  function updateList(key: "actionItems" | "decisions" | "deadlines", value: string) {
    setResult((prev) =>
      prev ? { ...prev, [key]: value.split("\n").filter((l) => l.trim()) } : prev,
    );
  }

  return (
    <AppShell
      title="Meeting Notes Summarizer"
      subtitle="Convert long meeting notes into short, easy-to-read summaries."
    >
      <SectionCard title="Meeting notes">
        <Textarea
          rows={10}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Paste your meeting notes here…"
        />
        <div className="mt-5">
          <Button onClick={generate} disabled={loading}>
            {loading ? "Summarizing…" : "Generate summary"}
          </Button>
        </div>
      </SectionCard>

      {result && (
        <div className="mt-6 grid gap-6">
          <SectionCard
            title="Summary"
            action={
              <OutputToolbar
                editing={editing}
                onToggleEdit={() => setEditing((v) => !v)}
                copyText={copyText}
                onClear={() => setResult(null)}
                onRegenerate={generate}
                regenerating={loading}
              />
            }
          >
            {editing ? (
              <Textarea
                rows={5}
                value={result.summary}
                onChange={(e) =>
                  setResult((prev) => (prev ? { ...prev, summary: e.target.value } : prev))
                }
              />
            ) : (
              <p className="text-sm leading-relaxed">{result.summary}</p>
            )}
          </SectionCard>

          <div className="grid gap-6 lg:grid-cols-3">
            <ListCard
              title="Action Items"
              items={result.actionItems}
              editing={editing}
              onChange={(v) => updateList("actionItems", v)}
            />
            <ListCard
              title="Key Decisions"
              items={result.decisions}
              editing={editing}
              onChange={(v) => updateList("decisions", v)}
            />
            <ListCard
              title="Deadlines"
              items={result.deadlines}
              editing={editing}
              onChange={(v) => updateList("deadlines", v)}
            />
          </div>
        </div>
      )}

      <ResponsibleAINotice />
    </AppShell>
  );
}

function ListCard({
  title,
  items,
  editing,
  onChange,
}: {
  title: string;
  items: string[];
  editing: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <SectionCard title={title}>
      {editing ? (
        <Textarea rows={6} value={items.join("\n")} onChange={(e) => onChange(e.target.value)} />
      ) : items.length ? (
        <ul className="grid gap-2">
          {items.map((item, i) => (
            <li key={i} className="flex gap-2 text-sm">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span className="min-w-0">{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">None identified.</p>
      )}
    </SectionCard>
  );
}
