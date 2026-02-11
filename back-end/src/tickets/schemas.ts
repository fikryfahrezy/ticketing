import z from "zod";
import { TICKET_RESOLVED_STATUS, TICKET_STATUSES } from "./types.ts";

export const ticketCreateSchema = z.object({
  subject: z.string().min(1),
  message: z.string().min(1),
  requesterName: z.string().min(1).optional(),
  requesterEmail: z.string().email().optional(),
});

export const ticketUpdateSchema = z.object({
  draftResponse: z.string().min(1).optional(),
  status: z.literal(TICKET_RESOLVED_STATUS).optional(),
});

const ticketStatusSchema = z.enum(TICKET_STATUSES);

const readStatusParam = (value: unknown): string | undefined => {
  if (Array.isArray(value)) {
    return typeof value[0] === "string" ? value[0] : undefined;
  }

  return typeof value === "string" ? value : undefined;
};

export const ticketListQuerySchema = z.object({
  status: z.preprocess(readStatusParam, ticketStatusSchema.optional()),
});

const readIdParam = (value: unknown): string | undefined => {
  if (Array.isArray(value)) {
    return typeof value[0] === "string" ? value[0] : undefined;
  }

  return typeof value === "string" ? value : undefined;
};

export const ticketParamsSchema = z.object({
  id: z.preprocess(readIdParam, z.string().min(1)),
});
