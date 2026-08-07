import { ShieldCheck } from "lucide-react";

export function ResponsibleAINotice() {
  return (
    <div className="mt-8 flex gap-3 rounded-2xl border border-border bg-card p-5 shadow-card">
      <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
      <div className="min-w-0">
        <p className="text-sm font-semibold">Responsible AI Notice</p>
        <p className="mt-1 text-sm text-muted-foreground">
          This application uses artificial intelligence to assist with workplace productivity.
          AI-generated content may contain inaccuracies or require adjustments. Always review and
          verify outputs before sharing or making business decisions.
        </p>
      </div>
    </div>
  );
}
