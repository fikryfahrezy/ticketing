import { Clock, CheckCircle2 } from "lucide-react";
import { Badge } from "../ui/badge";
import type { TicketStatus, Urgency } from "@/lib/ticket.types";

export type TicketStatusProps = {
  status: TicketStatus;
  urgency?: Urgency;
};

export function TicketStatus({ status, urgency }: TicketStatusProps) {
  if (status === "PENDING") {
    return (
      <Badge
        variant="secondary"
        className="flex h-5 items-center gap-1 text-[10px]"
      >
        <Clock className="h-3 w-3" /> Processing...
      </Badge>
    );
  }

  if (status === "TRIAGED") {
    return (
      <Badge
        variant={urgency === "High" ? "destructive" : "success"}
        className="h-5 text-[10px]"
      >
        {urgency} Urgency
      </Badge>
    );
  }

  if (status === "FAILED") {
    return (
      <Badge variant="destructive" className="h-5 text-[10px]">
        Triage Failed
      </Badge>
    );
  }

  if (status === "RESOLVED") {
    return (
      <Badge
        variant="success"
        className="flex h-5 items-center gap-1 text-[10px]"
      >
        <CheckCircle2 className="h-3 w-3" /> Resolved
      </Badge>
    );
  }

  return null;
}
