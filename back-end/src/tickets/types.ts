export const TICKET_PENDING_STATUS = "PENDING";
export const TICKET_TRIAGED_STATUS = "TRIAGED";
export const TICKET_RESOLVED_STATUS = "RESOLVED";
export const TICKET_FAILED_STATUS = "FAILED";
export const TICKET_STATUSES = [TICKET_PENDING_STATUS, TICKET_TRIAGED_STATUS, TICKET_RESOLVED_STATUS, TICKET_FAILED_STATUS] as const;

export const TICKET_CATEGORY_BILLING = "BILLING";
export const TICKET_CATEGORY_TECHNICAL = "TECHNICAL";
export const TICKET_CATEGORY_FEATURE_REQUEST = "FEATURE_REQUEST";
export const TICKET_CATEGORIES = [TICKET_CATEGORY_BILLING, TICKET_CATEGORY_TECHNICAL, TICKET_CATEGORY_FEATURE_REQUEST] as const;

export const TICKET_URGENCY_HIGH = "HIGH";
export const TICKET_URGENCY_MEDIUM = "MEDIUM";
export const TICKET_URGENCY_LOW = "LOW";
export const TICKET_URGENCIES = [TICKET_URGENCY_HIGH, TICKET_URGENCY_MEDIUM, TICKET_URGENCY_LOW] as const;

export type TicketStatus = (typeof TICKET_STATUSES)[number];
export type TicketCategory = (typeof TICKET_CATEGORIES)[number];
export type TicketUrgency = (typeof TICKET_URGENCIES)[number];

export type TriageResult = {
  category: TicketCategory;
  sentimentScore: number;
  urgency: TicketUrgency;
  draftResponse: string;
};

export type Ticket = {
  id: string;
  subject: string;
  message: string;
  requesterName: string | null;
  requesterEmail: string | null;
  status: TicketStatus;
  category: TicketCategory | null;
  sentimentScore: number | null;
  urgency: TicketUrgency | null;
  draftResponse: string | null;
  error: string | null;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt: Date | null;
};

export type NewTicketInput = {
  subject: string;
  message: string;
  requesterName?: string | null;
  requesterEmail?: string | null;
};

export type TicketUpdateInput = {
  draftResponse?: string;
  status?: "RESOLVED";
};

export type TicketResponse = {
  id: string;
  subject: string;
  message: string;
  requester_name: string | null;
  requester_email: string | null;
  status: TicketStatus;
  category: TicketCategory | null;
  sentiment_score: number | null;
  urgency: TicketUrgency | null;
  draft_response: string | null;
  error: string | null;
  created_at: Date;
  updated_at: Date;
  resolved_at: Date | null;
};
