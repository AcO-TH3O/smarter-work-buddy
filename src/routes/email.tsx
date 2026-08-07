import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { SectionCard } from "@/components/SectionCard";
import { OutputToolbar } from "@/components/OutputToolbar";
import { ResponsibleAINotice } from "@/components/ResponsibleAINotice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { generateEmail } from "@/lib/ai.functions";
import { addHistory, useSettings } from "@/lib/store";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — AI Workplace Assistant" },
      {
        name: "description",
        content: "Create polished, professional workplace emails in seconds with AI.",
      },
      { property: "og:title", content: "Smart Email Generator" },
      {
        property: "og:description",
        content: "Pick a purpose, recipient and tone, then generate a professional email.",
      },
    ],
  }),
  component: EmailPage,
});

const tones = ["Formal", "Friendly", "Persuasive"] as const;

function EmailPage() {
  const { settings } = useSettings();
  const run = useServerFn(generateEmail);
  const [purpose, setPurpose] = useState("Request annual leave for next Friday.");
  const [recipient, setRecipient] = useState("My line manager");
  const [tone, setTone] = useState<(typeof tones)[number]>(settings.defaultTone);
  const [output, setOutput] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  async function generate() {
    if (!purpose.trim() || !recipient.trim()) {
      toast.error("Add a purpose and a recipient first.");
      return;
    }
    setLoading(true);
    try {
      const res = await run({ data: { purpose, recipient, tone } });
      setOutput(res.text);
      setEditing(false);
      addHistory({ kind: "email", title: `Email · ${tone} · ${recipient}`, preview: res.text });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not generate the email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell
      title="Smart Email Generator"
      subtitle="Create professional emails in seconds using AI."
    >
      <SectionCard title="Email details">
        <div className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="purpose">Purpose of the email</Label>
            <Textarea
              id="purpose"
              rows={3}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Request annual leave for next Friday."
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="recipient">Recipient</Label>
            <Input
              id="recipient"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="My line manager"
            />
          </div>
          <div className="grid gap-2">
            <Label>Tone</Label>
            <div className="flex flex-wrap gap-2">
              {tones.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTone(t)}
                  className={`rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                    tone === t
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card hover:bg-accent"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Button onClick={generate} disabled={loading}>
              {loading ? "Generating…" : "Generate email"}
            </Button>
          </div>
        </div>
      </SectionCard>

      {output && (
        <div className="mt-6">
          <SectionCard
            title="Generated email"
            action={
              <OutputToolbar
                editing={editing}
                onToggleEdit={() => setEditing((v) => !v)}
                copyText={output}
                onClear={() => setOutput("")}
                onRegenerate={generate}
                regenerating={loading}
              />
            }
          >
            {editing ? (
              <Textarea
                rows={16}
                value={output}
                onChange={(e) => setOutput(e.target.value)}
                className="font-normal"
              />
            ) : (
              <pre className="text-sm whitespace-pre-wrap">{output}</pre>
            )}
          </SectionCard>
        </div>
      )}

      <ResponsibleAINotice />
    </AppShell>
  );
}
