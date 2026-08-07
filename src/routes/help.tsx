import { createFileRoute } from "@tanstack/react-router";
import { LifeBuoy, Mail } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { SectionCard } from "@/components/SectionCard";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ResponsibleAINotice } from "@/components/ResponsibleAINotice";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help & Support — AI Workplace Productivity Assistant" },
      {
        name: "description",
        content: "FAQs, a short user guide and support contact for the AI productivity assistant.",
      },
      { property: "og:title", content: "Help & Support" },
      { property: "og:description", content: "Find answers and get in touch with our team." },
    ],
  }),
  component: HelpPage,
});

const faqs = [
  {
    q: "How accurate is the AI-generated content?",
    a: "The assistant produces high-quality drafts, but it can make mistakes. Always review and adjust the output before sharing it.",
  },
  {
    q: "Where is my data stored?",
    a: "Your inputs are sent to the AI model to produce a result. Generated history is saved locally in your browser and can be cleared at any time in Settings.",
  },
  {
    q: "Can I change the generated result?",
    a: "Yes. Every result includes Edit, Copy, Clear and Regenerate controls.",
  },
  {
    q: "Which tone should I choose for emails?",
    a: "Formal for external or senior stakeholders, Friendly for teammates, and Persuasive when you need buy-in.",
  },
];

const guide = [
  "Smart Email Generator — describe the purpose, name the recipient, pick a tone and generate.",
  "Meeting Notes Summarizer — paste raw notes to get a summary, action items, decisions and deadlines.",
  "AI Task Planner — add tasks with priorities, choose Daily or Weekly, then generate a balanced schedule.",
  "History — revisit or delete anything you've generated.",
];

function HelpPage() {
  return (
    <AppShell title="Help & Support" subtitle="Need assistance? Start here.">
      <div className="grid gap-6">
        <SectionCard title="Frequently Asked Questions">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-sm font-semibold">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </SectionCard>

        <SectionCard title="User Guide">
          <ul className="grid gap-3">
            {guide.map((g, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-accent text-xs font-bold text-primary">
                  {i + 1}
                </span>
                <span className="min-w-0">{g}</span>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Contact Support">
          <div className="grid gap-3 text-sm">
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              <a className="font-medium text-primary hover:underline" href="mailto:support@awpa.app">
                support@awpa.app
              </a>
            </p>
            <p className="flex items-center gap-2 text-muted-foreground">
              <LifeBuoy className="h-4 w-4 text-primary" />
              Weekdays, 09:00 – 17:00. We reply within one business day.
            </p>
          </div>
        </SectionCard>
      </div>

      <ResponsibleAINotice />
    </AppShell>
  );
}
