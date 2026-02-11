import { ApiTicket, Ticket, Urgency } from "./ticket.types";

export function mapCategory(value: ApiTicket["category"]): Ticket["category"] {
  switch (value) {
    case "BILLING":
      return "Billing";
    case "TECHNICAL":
      return "Technical";
    case "FEATURE_REQUEST":
      return "Feature Request";
    default:
      return undefined;
  }
};

export function mapUrgency(value: ApiTicket["urgency"]): Urgency | undefined {
  switch (value) {
    case "HIGH":
      return "High";
    case "MEDIUM":
      return "Medium";
    case "LOW":
      return "Low";
    default:
      return undefined;
  }
};
