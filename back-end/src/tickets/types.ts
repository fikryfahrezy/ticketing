export const TICKET_STATUS = {
  PENDING: "PENDING",
  TRIAGED: "TRIAGED",
  RESOLVED: "RESOLVED",
  FAILED: "FAILED"
} as const;
export const TICKET_STATUSES = Object.values(TICKET_STATUS);

export const TICKET_CATEGORY = {
  BILLING: "BILLING",
  TECHNICAL: "TECHNICAL",
  FEATURE_REQUEST: "FEATURE_REQUEST"
} as const;
export const TICKET_CATEGORIES = Object.values(TICKET_CATEGORY);

export const TICKET_URGENCY = {
  HIGH: "HIGH",
  MEDIUM: "MEDIUM",
  LOW: "LOW"
} as const;
export const TICKET_URGENCIES = Object.values(TICKET_URGENCY);

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
