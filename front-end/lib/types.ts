export type Urgency = "High" | "Medium" | "Low";
export type Category = "Billing" | "Technical" | "Feature Request";
export type TicketStatus = "pending" | "processed" | "resolved";

export type TicketScore = {
  sentiment: number;
  urgency: Urgency;
}

export type Ticket = {
  id: string;
  content: string;
  status: TicketStatus;
  category?: Category;
  score?: TicketScore;
  draftResponse?: string;
  createdAt: string;
}
