import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { SectionCard } from "@/components/SectionCard";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useHistory, useSettings } from "@/lib/store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — AI Workplace Productivity Assistant" },
      {
        name: "description",
        content: "Set your default email tone, planner mode, dark mode and saved history.",
      },
      { property: "og:title", content: "Settings" },
      { property: "og:description", content: "Personalize your AI productivity workspace." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { settings, update } = useSettings();
  const { history, clear } = useHistory();

  return (
    <AppShell title="Settings" subtitle="Personalize how the assistant works for you.">
      <div className="grid gap-6">
        <SectionCard title="Default email tone">
          <div className="flex flex-wrap gap-2">
            {(["Formal", "Friendly", "Persuasive"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => update({ defaultTone: t })}
                className={`rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                  settings.defaultTone === t
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:bg-accent"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Default planner mode">
          <div className="flex gap-2">
            {(["Daily", "Weekly"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => update({ plannerMode: m })}
                className={`rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                  settings.plannerMode === m
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:bg-accent"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Appearance">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
            <Label htmlFor="dark" className="text-sm font-medium">
              Dark mode
            </Label>
            <Switch
              id="dark"
              checked={settings.darkMode}
              onCheckedChange={(v) => update({ darkMode: v })}
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Saved history"
          description={`${history.length} item${history.length === 1 ? "" : "s"} stored on this device.`}
        >
          <Button
            variant="outline"
            onClick={() => {
              clear();
              toast.success("History cleared");
            }}
          >
            Clear saved history
          </Button>
        </SectionCard>
      </div>
    </AppShell>
  );
}
