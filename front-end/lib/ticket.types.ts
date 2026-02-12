export type ApiTicket = {
  id: string;
  subject: string;
  message: string;
  requester_ame: string | null;
  requester_email: string | null;
  status: "PENDING" | "TRIAGED" | "RESOLVED" | "FAILED";
  category: "BILLING" | "TECHNICAL" | "FEATURE_REQUEST" | null;
  sentiment_score: number | null;
  urgency: "HIGH" | "MEDIUM" | "LOW" | null;
  draft_response: string | null;
  error: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
};

export type NewTicketRequest = {
  subject: string;
  message: string;
  requester_name: string;
  requester_email: string;
};

export type TicketUpdateRequest = {
  draft_response: string;
  status?: "RESOLVED";
};

export type Urgency = "High" | "Medium" | "Low";
export type Category = "Billing" | "Technical" | "Feature Request";
export type TicketStatus = ApiTicket["status"];

export type TicketScore = {
  sentiment: number;
  urgency: Urgency;
};

export type Ticket = {
  id: string;
  message: string;
  status: TicketStatus;
  category?: Category;
  score?: TicketScore;
  draftResponse?: string;
  createdAt: string;
  error?: string;
};
