import z from "zod";
import { TICKET_STATUS, TICKET_STATUSES } from "./types.ts";

export const ticketCreateSchema = z.object({
  subject: z.string().min(1),
  message: z.string().min(1),
  requester_name: z.string().min(1),
  requester_email: z.string().email(),
});

export const ticketUpdateSchema = z.object({
  draft_response: z.string().min(1),
  status: z.literal(TICKET_STATUS.RESOLVED).optional(),
});

const ticketStatusSchema = z.enum(TICKET_STATUSES);

function readStatusParam(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    return typeof value[0] === "string" ? value[0] : undefined;
  }

  return typeof value === "string" ? value : undefined;
};

export const ticketListQuerySchema = z.object({
  status: z.preprocess(readStatusParam, ticketStatusSchema.optional()),
});

function readIdParam(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    return typeof value[0] === "string" ? value[0] : undefined;
  }

  return typeof value === "string" ? value : undefined;
};

export const ticketParamsSchema = z.object({
  id: z.preprocess(readIdParam, z.string().min(1)),
});
