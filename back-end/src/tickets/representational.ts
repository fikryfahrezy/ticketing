import express from "express";
import { apiKeyAuth } from "../auth.ts";
import type { NewTicketInput, TicketUpdateInput } from "./types.ts";
import { triageWithAi } from "./triage-ai.ts";
import * as ticketRepository from "./repository.ts";
import { TicketUsecase } from "./usecase.ts";
import {
  ticketCreateSchema,
  ticketListQuerySchema,
  ticketParamsSchema,
  ticketUpdateSchema,
} from "./schemas.ts";

const usecase = new TicketUsecase({
  repository: ticketRepository,
  triageService: { triage: triageWithAi },
});

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
              requesterName: { type: "string", example: "Ari" },
              requesterEmail: { type: "string", example: "ari@example.com" }
            }
          }
        }
      }
    } */
  async (req, res) => {
    const parsed = ticketCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    const input: NewTicketInput = {
      subject: parsed.data.subject.trim(),
      message: parsed.data.message.trim(),
      requesterName: parsed.data.requesterName?.trim() ?? null,
      requesterEmail: parsed.data.requesterEmail?.trim() ?? null,
    };

    const ticket = await usecase.createTicketWithTriage(input);
    return res.status(201).json(ticket);
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
      return res.status(400).json({ error: "Invalid status filter" });
    }

    const tickets = await usecase.listAllTickets(parsedQuery.data.status);
    res.json(tickets);
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
      return res.status(400).json({ error: "Ticket id is required" });
    }

    const ticket = await usecase.findTicket(parsedParams.data.id);
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    return res.json(ticket);
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
              draftResponse: { type: "string", example: "Thanks for reaching out..." },
              status: { type: "string", example: "RESOLVED" }
            }
          }
        }
      }
    } */
  async (req, res) => {
    const parsedParams = ticketParamsSchema.safeParse(req.params);
    if (!parsedParams.success) {
      return res.status(400).json({ error: "Ticket id is required" });
    }

    const parsed = ticketUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    const update: TicketUpdateInput = {
      draftResponse: parsed.data.draftResponse,
      status: parsed.data.status,
    };

    if (update.draftResponse === undefined && update.status === undefined) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    const ticket = await usecase.updateTicket(parsedParams.data.id, update);
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    return res.json(ticket);
  }
);

export default router;
