"use server";

import { updateTag } from 'next/cache'
import { ApiTicket, NewTicketRequest, Ticket, TicketUpdateRequest } from "@/lib/ticket.types";
import { mapUrgency, mapCategory } from '@/lib/ticket-mapping';

const TICKET_TAG = "ticket";

function getApiUrl() {
  const apiUrl = process.env.API_URL;
  if (!apiUrl) {
    throw new Error("API_URL is not configured");
  }
  return apiUrl.replace(/\/$/, "");
};

function getApiKey() {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY is not configured");
  }
  return apiKey;
};

function normalizeTicket(ticket: ApiTicket): Ticket {
  const urgency = mapUrgency(ticket.urgency);
  const sentiment = ticket.sentiment_score ?? undefined;

  return {
    id: ticket.id,
    message: ticket.message,
    status: ticket.status,
    category: mapCategory(ticket.category),
    score:
      urgency && sentiment !== undefined
        ? {
          sentiment,
          urgency,
        }
        : undefined,
    draftResponse: ticket.draft_response ?? undefined,
    createdAt: ticket.created_at,
    error: ticket.error ?? undefined,
  };
};

export async function listTickets(): Promise<Ticket[]> {
  const response = await fetch(`${getApiUrl()}/tickets`, {
    headers: {
      "x-api-key": getApiKey(),
    },
    cache: "no-store",
    next: { tags: [TICKET_TAG] }
  });

  if (!response.ok) {
    throw new Error("Failed to fetch tickets");
  }

  const data = (await response.json()) as ApiTicket[];
  return data.map(normalizeTicket);
};

export async function getTicket(id: string): Promise<Ticket | null> {
  const response = await fetch(`${getApiUrl()}/tickets/${id}`, {
    headers: {
      "x-api-key": getApiKey(),
    },
    cache: "no-store",
    next: { tags: [`${TICKET_TAG}-${id}`] }
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to fetch ticket");
  }

  const data = (await response.json()) as ApiTicket;
  return normalizeTicket(data);
};

export async function createTicket(body: NewTicketRequest): Promise<Ticket> {
  const response = await fetch(`${getApiUrl()}/tickets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to create ticket");
  }

  const data = (await response.json()) as ApiTicket;
  updateTag(TICKET_TAG);
  return normalizeTicket(data);
};

export async function updateTicket(
  id: string,
  body: TicketUpdateRequest,
): Promise<Ticket> {
  const response = await fetch(`${getApiUrl()}/tickets/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": getApiKey(),
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to update ticket");
  }

  const data = (await response.json()) as ApiTicket;
  updateTag(`${TICKET_TAG}-${id}`);
  return normalizeTicket(data);
};

export type TicketCreateIdle = {
  status: "idle"
}

export type TicketCreateSuccess = {
  status: "success"
  ticket: Ticket;
}

export type TicketCreateError = {
  status: "error";
  error: string;
}

export type TicketCreateState = TicketCreateIdle | TicketCreateSuccess | TicketCreateError;

export async function createTicketFrom(
  _: TicketCreateState,
  formData: FormData,
): Promise<TicketCreateState> {
  const subject = formData.get("subject");
  const messsage = formData.get("message");
  const requesterName = formData.get("requester_name");
  const requesterEmail = formData.get("requester_email");

  const trimmedSubject = typeof subject === "string" ? subject.trim() : "";
  const trimmedMessage = typeof messsage === "string" ? messsage.trim() : "";
  const trimmedRequesterName = typeof requesterName === "string" ? requesterName.trim() : null;
  const trimmedRequesterEmail = typeof requesterEmail === "string" ? requesterEmail.trim() : null;

  try {
    const ticket = await createTicket({
      subject: trimmedSubject,
      message: trimmedMessage,
      requester_name: trimmedRequesterName,
      requester_email: trimmedRequesterEmail,
    });
    return {
      status: "success",
      ticket,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to submit";
    return {
      status: "error",
      error: message,
    };
  }
};