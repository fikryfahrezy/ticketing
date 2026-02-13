"use server";

import { updateTag } from 'next/cache'
import { ApiTicket, NewTicketRequest, Ticket, TicketUpdateRequest } from "@/lib/ticket.types";
import { mapUrgency, mapCategory } from '@/lib/ticket-mapping';
import { ApiRequestError, parseApiRequestError } from "@/lib/api-request-error";

const TICKET_TAGS = {
  list: "tickets",
  detail: (id: string) => `ticket-${id}`,
};

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
    next: { tags: [TICKET_TAGS.list] }
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
    next: { tags: [TICKET_TAGS.detail(id)] }
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
    throw await parseApiRequestError(response, "Failed to create ticket");
  }

  const data = (await response.json()) as ApiTicket;
  updateTag(TICKET_TAGS.list);
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
    throw await parseApiRequestError(response, "Failed to update ticket");
  }

  const data = (await response.json()) as ApiTicket;
  updateTag(TICKET_TAGS.list);
  updateTag(TICKET_TAGS.detail(id));
  return normalizeTicket(data);
};

export async function retryTicketTriage(id: string): Promise<void> {
  const response = await fetch(`${getApiUrl()}/tickets/${id}/retry`, {
    method: "POST",
    headers: {
      "x-api-key": getApiKey(),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw await parseApiRequestError(response, "Failed to retry triage");
  }

  updateTag(TICKET_TAGS.list);
  updateTag(TICKET_TAGS.detail(id));
};

export type TicketMutationIdle = {
  status: "idle"
}

export type TicketMutationSuccess = {
  status: "success"
  formFields: Record<string, unknown>;
  ticket: Ticket;
}

export type TicketMutationError = {
  status: "error";
  formFields: Record<string, unknown>;
  error: string;
  errorFields?: Record<string, string[] | undefined>;
  formErrors?: string[];
}

export type TicketCreateState = TicketMutationIdle | TicketMutationSuccess | TicketMutationError;

export async function createTicketFrom(
  _: TicketCreateState,
  formData: FormData,
): Promise<TicketCreateState> {
  const formFields = Object.fromEntries(formData.entries());
  const subject = formFields.subject;
  const messsage = formFields.message;
  const requesterName = formFields.requester_name;
  const requesterEmail = formFields.requester_email;

  const trimmedSubject = typeof subject === "string" ? subject.trim() : "";
  const trimmedMessage = typeof messsage === "string" ? messsage.trim() : "";
  const trimmedRequesterName = typeof requesterName === "string" ? requesterName.trim() : "";
  const trimmedRequesterEmail = typeof requesterEmail === "string" ? requesterEmail.trim() : "";

  try {
    const ticket = await createTicket({
      subject: trimmedSubject,
      message: trimmedMessage,
      requester_name: trimmedRequesterName,
      requester_email: trimmedRequesterEmail,
    });
    return {
      formFields,
      status: "success",
      ticket,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to submit";

    const errorFields =
      error instanceof ApiRequestError ? error.fields : undefined;

    const formErrors =
      error instanceof ApiRequestError ? error.formErrors : undefined;

    return {
      status: "error",
      error: message,
      formFields,
      errorFields,
      formErrors,
    };
  }
};

export type TicketUpdateState = TicketMutationIdle | TicketMutationSuccess | TicketMutationError;

export async function updateTicketFrom(
  ticketId: string,
  _: TicketUpdateState,
  formData: FormData,
): Promise<TicketUpdateState> {
  const formFields = Object.fromEntries(formData.entries());
  const status = formFields.status as TicketUpdateRequest["status"];
  const draftResponse = formFields.draft_response;

  const trimmedDraftResponse = typeof draftResponse === "string" ? draftResponse.trim() : "";

  try {
    const ticket = await updateTicket(ticketId, {
      status: status,
      draft_response: trimmedDraftResponse,
    });
    return {
      formFields,
      status: "success",
      ticket,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to submit";

    const errorFields =
      error instanceof ApiRequestError ? error.fields : undefined;

    const formErrors =
      error instanceof ApiRequestError ? error.formErrors : undefined;

    return {
      status: "error",
      error: message,
      formFields,
      errorFields,
      formErrors,
    };
  }
};