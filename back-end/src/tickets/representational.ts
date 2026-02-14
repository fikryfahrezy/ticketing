import express from "express";
import { type ZodError, z } from "zod";
import { apiKeyAuth } from "../middlewares/auth.ts";
import { type NewTicketInput, type Ticket, type TicketResponse, type TicketUpdateInput } from "./types.ts";
import { triageWithAi } from "./triage-ai.ts";
import * as ticketRepository from "./repository.ts";
import { TicketUsecase } from "./usecase.ts";
import {
  ticketCreateSchema,
  ticketListQuerySchema,
  ticketParamsSchema,
  ticketUpdateSchema,
} from "./schemas.ts";

function toTicketResponse(ticket: Ticket): TicketResponse {
  return {
    id: ticket.id,
    subject: ticket.subject,
    message: ticket.message,
    requester_name: ticket.requesterName,
    requester_email: ticket.requesterEmail,
    status: ticket.status,
    category: ticket.category,
    sentiment_score: ticket.sentimentScore,
    urgency: ticket.urgency,
    draft_response: ticket.draftResponse,
    error: ticket.error,
    created_at: ticket.createdAt,
    updated_at: ticket.updatedAt,
    resolved_at: ticket.resolvedAt,
  }
}

function toTicketsResponse(tickets: Ticket[]): TicketResponse[] {
  return tickets.map(toTicketResponse);
}

function validationErrorResponse(error: ZodError) {
  const flattened = z.flattenError(error);
  return {
    error: "Validation failed",
    fields: flattened.fieldErrors,
    formErrors: flattened.formErrors,
  };
}


const usecase = new TicketUsecase({
  repository: ticketRepository,
  triageService: { triage: triageWithAi },
});
usecase.startPendingTriageRecovery();

const router = express.Router();

router.post(
  "/",
  /* #swagger.tags = ["Tickets"] */
  /* #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["subject", "message"],
            properties: {
              subject: { type: "string", example: "Payment failed" },
              message: { type: "string", example: "My card keeps getting declined." },
              requester_name: { type: "string", example: "Ari" },
              requester_email: { type: "string", example: "ari@example.com" }
            }
          }
        }
      }
    } */
  async (req, res) => {
    const parsed = ticketCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(validationErrorResponse(parsed.error));
    }

    const input: NewTicketInput = {
      subject: parsed.data.subject.trim(),
      message: parsed.data.message.trim(),
      requesterName: parsed.data.requester_name.trim(),
      requesterEmail: parsed.data.requester_email.trim(),
    };

    const ticket = await usecase.createTicketWithTriage(input);
    return res.status(201).json(toTicketResponse(ticket));
  }
);

router.get(
  "/",
  apiKeyAuth(),
  /* #swagger.tags = ["Tickets"] */
  /* #swagger.security = [{"apiKeyAuth": []}] */
  async (req, res) => {
    const parsedQuery = ticketListQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      return res.status(400).json(validationErrorResponse(parsedQuery.error));
    }

    const tickets = await usecase.listAllTickets(parsedQuery.data.status);
    res.json(toTicketsResponse(tickets));
  }
);

router.get(
  "/:id",
  apiKeyAuth(),
  /* #swagger.tags = ["Tickets"] */
  /* #swagger.security = [{"apiKeyAuth": []}] */
  async (req, res) => {
    const parsedParams = ticketParamsSchema.safeParse(req.params);
    if (!parsedParams.success) {
      return res.status(400).json(validationErrorResponse(parsedParams.error));
    }

    const ticket = await usecase.findTicket(parsedParams.data.id);
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    return res.json(toTicketResponse(ticket));
  }
);

router.post(
  "/:id/retry",
  apiKeyAuth(),
  /* #swagger.tags = ["Tickets"] */
  /* #swagger.security = [{"apiKeyAuth": []}] */
  async (req, res) => {
    const parsedParams = ticketParamsSchema.safeParse(req.params);
    if (!parsedParams.success) {
      return res.status(400).json(validationErrorResponse(parsedParams.error));
    }

    const result = await usecase.retryFailedTicketTriage(parsedParams.data.id);
    if (!result) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    if (!result.queued) {
      return res.status(409).json({
        error: "Only failed tickets can be retried",
        status: result.ticket.status,
      });
    }

    return res.status(202).json({
      message: "Triage retry queued",
      ticket: toTicketResponse(result.ticket),
    });
  }
);

router.patch(
  "/:id",
  apiKeyAuth(),
  /* #swagger.tags = ["Tickets"] */
  /* #swagger.security = [{"apiKeyAuth": []}] */
  /* #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              draft_response: { type: "string", example: "Thanks for reaching out..." },
              status: { type: "string", example: "RESOLVED" }
            }
          }
        }
      }
    } */
  async (req, res) => {
    const parsedParams = ticketParamsSchema.safeParse(req.params);
    if (!parsedParams.success) {
      return res.status(400).json(validationErrorResponse(parsedParams.error));
    }

    const parsed = ticketUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(validationErrorResponse(parsed.error));
    }
    const input: TicketUpdateInput = {
      draftResponse: parsed.data.draft_response,
      status: parsed.data.status,
    };

    const ticket = await usecase.updateTicket(parsedParams.data.id, input);
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    return res.json(toTicketResponse(ticket));
  }
);

export default router;
