import sql from "../lib/db.ts";
import { TICKET_STATUS, type NewTicketInput, type Ticket, type TicketStatus, type TriageResult } from "./types.ts";

const baseSelect = `
  SELECT
    id,
    subject,
    message,
    requester_name AS "requesterName",
    requester_email AS "requesterEmail",
    status,
    category,
    sentiment_score AS "sentimentScore",
    urgency,
    draft_response AS "draftResponse",
    error,
    created_at AS "createdAt",
    updated_at AS "updatedAt",
    resolved_at AS "resolvedAt"
  FROM tickets
`;

export const createTicket = async (input: NewTicketInput): Promise<Ticket> => {
  const rows = await sql<Ticket[]>`
    INSERT INTO TICKETS (subject, message, requester_name, requester_email)
    VALUES (
      ${input.subject},
      ${input.message},
      ${input.requesterName ?? null},
      ${input.requesterEmail ?? null}
    )
    RETURNING
      id,
      subject,
      message,
      requester_name AS "requesterName",
      requester_email AS "requesterEmail",
      status,
      category,
      sentiment_score AS "sentimentScore",
      urgency,
      draft_response AS "draftResponse",
      error,
      created_at AS "createdAt",
      updated_at AS "updatedAt",
      resolved_at AS "resolvedAt"
  `;

  return rows[0];
};

export const listTickets = async (status?: TicketStatus): Promise<Ticket[]> => {
  if (status) {
    return sql<Ticket[]>`
      ${sql.unsafe(baseSelect)}
      WHERE status = ${status}
      ORDER BY created_at DESC
    `;
  }

  return sql<Ticket[]>`
    ${sql.unsafe(baseSelect)}
    ORDER BY created_at DESC
  `;
};

export const getTicket = async (id: string): Promise<Ticket | null> => {
  const rows = await sql<Ticket[]>`
    ${sql.unsafe(baseSelect)}
    WHERE id = ${id}
  `;

  return rows[0] ?? null;
};

export const setTriageResult = async (
  id: string,
  result: TriageResult
): Promise<Ticket | null> => {
  const rows = await sql<Ticket[]>`
    UPDATE tickets
    SET
      category = ${result.category},
      sentiment_score = ${result.sentimentScore},
      urgency = ${result.urgency},
      draft_response = ${result.draftResponse},
      status = ${TICKET_STATUS.TRIAGED},
      error = null,
      updated_at = now()
    WHERE id = ${id}
    RETURNING
      id,
      subject,
      message,
      requester_name AS "requesterName",
      requester_email AS "requesterEmail",
      status,
      category,
      sentiment_score AS "sentimentScore",
      urgency,
      draft_response AS "draftResponse",
      error,
      created_at AS "createdAt",
      updated_at AS "updatedAt",
      resolved_at AS "resolvedAt"
  `;

  return rows[0] ?? null;
};

export const setTriageError = async (id: string, message: string): Promise<void> => {
  await sql`
    UPDATE tickets
    SET
      status = ${TICKET_STATUS.FAILED},
      error = ${message},
      updated_at = now()
    WHERE id = ${id}
  `;
};

export const setTicketPending = async (id: string): Promise<Ticket | null> => {
  const rows = await sql<Ticket[]>`
    UPDATE tickets
    SET
      status = ${TICKET_STATUS.PENDING},
      error = null,
      updated_at = now()
    WHERE id = ${id}
    RETURNING
      id,
      subject,
      message,
      requester_name AS "requesterName",
      requester_email AS "requesterEmail",
      status,
      category,
      sentiment_score AS "sentimentScore",
      urgency,
      draft_response AS "draftResponse",
      error,
      created_at AS "createdAt",
      updated_at AS "updatedAt",
      resolved_at AS "resolvedAt"
  `;

  return rows[0] ?? null;
};

export const updateDraftResponse = async (
  id: string,
  draftResponse: string
): Promise<Ticket | null> => {
  const rows = await sql<Ticket[]>`
    UPDATE tickets
    SET
      draft_response = ${draftResponse},
      updated_at = now()
    where id = ${id}
    returning
      id,
      subject,
      message,
      requester_name AS "requesterName",
      requester_email AS "requesterEmail",
      status,
      category,
      sentiment_score AS "sentimentScore",
      urgency,
      draft_response AS "draftResponse",
      error,
      created_at AS "createdAt",
      updated_at AS "updatedAt",
      resolved_at AS "resolvedAt"
  `;

  return rows[0] ?? null;
};

export const resolveTicket = async (
  id: string,
  draftResponse?: string
): Promise<Ticket | null> => {
  const rows = await sql<Ticket[]>`
    UPDATE tickets
    SET
      status = ${TICKET_STATUS.RESOLVED},
      draft_response = coalesce(${draftResponse ?? null}, draft_response),
      resolved_at = now(),
      updated_at = now()
    WHERE id = ${id}
    RETURNING
      id,
      subject,
      message,
      requester_name AS "requesterName",
      requester_email AS "requesterEmail",
      status,
      category,
      sentiment_score AS "sentimentScore",
      urgency,
      draft_response AS "draftResponse",
      error,
      created_at AS "createdAt",
      updated_at AS "updatedAt",
      resolved_at AS "resolvedAt"
  `;

  return rows[0] ?? null;
};
