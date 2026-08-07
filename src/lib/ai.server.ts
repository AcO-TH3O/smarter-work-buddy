import { streamText } from "ai";
import { CHAT_MODEL, getGateway } from "./ai-gateway.server";

export async function generateEmailImpl(data: {
  purpose: string;
  recipient: string;
  tone: "Formal" | "Friendly" | "Persuasive";
}) {
  const gateway = getGateway();
  const result = streamText({
    model: gateway(CHAT_MODEL),
    system:
      "You are a workplace communication assistant. Generate a professional email using the selected tone and workplace context. Return only the email: a 'Subject:' line, then the body with a greeting, concise paragraphs and a sign-off. No commentary, no markdown fences.",
    prompt: `Recipient: ${data.recipient}\nTone: ${data.tone}\nPurpose: ${data.purpose}`,
  });
  return { text: (await result.text).trim() };
}

async function generateJson(system: string, prompt: string): Promise<unknown> {
  const gateway = getGateway();
  const result = streamText({
    model: gateway(CHAT_MODEL),
    system: `${system}\n\nRespond with raw JSON only. No markdown fences, no commentary.`,
    prompt,
  });
  const raw = (await result.text).trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("The AI response could not be read. Try again.");
  return JSON.parse(raw.slice(start, end + 1));
}

const asStrings = (value: unknown): string[] =>
  Array.isArray(value) ? value.map((v) => (typeof v === "string" ? v : String(v))).filter(Boolean) : [];

export type MeetingSummary = {
  summary: string;
  actionItems: string[];
  decisions: string[];
  deadlines: string[];
};

export async function summarizeMeetingImpl(data: { notes: string }): Promise<MeetingSummary> {
  const json = (await generateJson(
    'Summarize the meeting into key points, action items, decisions, and deadlines. Use this exact JSON shape: {"summary": string, "actionItems": string[], "decisions": string[], "deadlines": string[]}. Keep the summary to a short paragraph and each list item to one short line. Use empty arrays when nothing applies.',
    data.notes,
  )) as Record<string, unknown>;

  return {
    summary: typeof json['summary'] === "string" ? json['summary'] : "",
    actionItems: asStrings(json['actionItems']),
    decisions: asStrings(json['decisions']),
    deadlines: asStrings(json['deadlines']),
  };
}

export type PlanResult = {
  blocks: { label: string; items: { task: string; priority: string; time: string }[] }[];
};

export async function planTasksImpl(data: {
  mode: "Daily" | "Weekly";
  tasks: { title: string; priority: "High" | "Medium" | "Low" }[];
}): Promise<PlanResult> {
  const list = data.tasks.map((t) => `- ${t.title} (priority: ${t.priority})`).join("\n");
  const shape =
    data.mode === "Daily"
      ? "Use exactly three blocks labelled Morning, Afternoon and Evening."
      : "Use one block per weekday, labelled Monday through Friday.";

  const json = (await generateJson(
    `Create an organized ${data.mode.toLowerCase()} schedule by prioritizing tasks based on urgency and importance. ${shape} Use this exact JSON shape: {"blocks": [{"label": string, "items": [{"task": string, "priority": "High"|"Medium"|"Low", "time": string}]}]}. The time is a short slot such as "09:00 - 10:00". Keep the workload balanced and realistic.`,
    list,
  )) as { blocks?: unknown };

  const blocks = Array.isArray(json.blocks) ? json.blocks : [];
  return {
    blocks: blocks.map((b) => {
      const block = (b ?? {}) as Record<string, unknown>;
      const items = Array.isArray(block['items']) ? block['items'] : [];
      return {
        label: typeof block['label'] === "string" ? block['label'] : "Schedule",
        items: items.map((i) => {
          const item = (i ?? {}) as Record<string, unknown>;
          return {
            task: typeof item['task'] === "string" ? item['task'] : String(item['task'] ?? ""),
            priority: typeof item['priority'] === "string" ? item['priority'] : "Medium",
            time: typeof item['time'] === "string" ? item['time'] : "",
          };
        }),
      };
    }),
  };
}
