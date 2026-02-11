import OpenAI from "openai";
import { z } from "zod";
import {
  TICKET_CATEGORIES,
  TICKET_URGENCIES,
  type NewTicketInput,
  type TriageResult,
} from "./types.ts";

function getClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY not configured");
  }

  return new OpenAI({ apiKey });
};

function getModel(): string {
  return process.env.OPENAI_MODEL || "gpt-4o-mini";
};

const triageJsonSchema = {
  name: "triage_result",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      category: { type: "string", enum: TICKET_CATEGORIES },
      sentimentScore: { type: "integer", minimum: 1, maximum: 10 },
      urgency: { type: "string", enum: TICKET_URGENCIES },
      draftResponse: { type: "string" },
    },
    required: ["category", "sentimentScore", "urgency", "draftResponse"],
  },
} as const;

const triageResultSchema = z.object({
  category: z.enum([...TICKET_CATEGORIES]),
  sentimentScore: z.number().int().min(1).max(10),
  urgency: z.enum([...TICKET_URGENCIES]),
  draftResponse: z.string().min(1),
});

function parseTriageResult(raw: string): TriageResult {
  const parsed = triageResultSchema.parse(JSON.parse(raw));

  return {
    category: parsed.category,
    urgency: parsed.urgency,
    sentimentScore: parsed.sentimentScore,
    draftResponse: parsed.draftResponse.trim(),
  };
};

export const triageWithAi = async (ticket: NewTicketInput): Promise<TriageResult> => {
  const client = getClient();

  const input: OpenAI.Responses.ResponseInput = [
    {
      role: "system",
      content:
        "You are an AI support triage engine. Return JSON only with keys: " +
        "category (BILLING|TECHNICAL|FEATURE_REQUEST), " +
        "sentimentScore (1-10), urgency (HIGH|MEDIUM|LOW), " +
        "draftResponse (polite, concise reply).",
    },
    {
      role: "user",
      content: JSON.stringify({
        subject: ticket.subject,
        message: ticket.message,
        requesterName: ticket.requesterName ?? null,
        requesterEmail: ticket.requesterEmail ?? null,
      }),
    },
  ];

  const response = await client.responses.create({
    model: getModel(),
    input,
    temperature: 0.2,
    text: { format: { type: "json_schema", ...triageJsonSchema } },
  });

  const content = response.output_text;
  if (!content) {
    throw new Error("Empty AI response");
  }

  return parseTriageResult(content);
};
