import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateEmailImpl, summarizeMeetingImpl, planTasksImpl } from "./ai.server";

const EmailInput = z.object({
  purpose: z.string().min(1),
  recipient: z.string().min(1),
  tone: z.enum(["Formal", "Friendly", "Persuasive"]),
});

const MeetingInput = z.object({
  notes: z.string().min(1),
});

const PlannerInput = z.object({
  mode: z.enum(["Daily", "Weekly"]),
  tasks: z.array(
    z.object({
      title: z.string(),
      priority: z.enum(["High", "Medium", "Low"]),
    }),
  ),
});

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => EmailInput.parse(input))
  .handler(async ({ data }) => generateEmailImpl(data));

export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => MeetingInput.parse(input))
  .handler(async ({ data }) => summarizeMeetingImpl(data));

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => PlannerInput.parse(input))
  .handler(async ({ data }) => planTasksImpl(data));
