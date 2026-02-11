import { Ticket } from "@/lib/ticket.types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock } from "lucide-react";

type TicketListItemProps = {
  ticket: Ticket;
  isSelected: boolean;
};

export function TicketListItem({ ticket, isSelected }: TicketListItemProps) {
  const getBorderColor = () => {
    if (ticket.status === "RESOLVED") {
      return "border-l-green-500";
    }
    if (ticket.status === "FAILED") {
      return "border-l-red-500";
    }
    if (ticket.score?.urgency === "High") {
      return "border-l-red-500";
    }
    return "border-l-green-500";
  };

  const renderStatusBadge = (() => {
    if (ticket.status === "PENDING") {
      return (
        <Badge
          variant="secondary"
          className="flex h-5 items-center gap-1 text-[10px]"
        >
          <Clock className="h-3 w-3" /> Processing...
        </Badge>
      );
    }

    if (ticket.status === "TRIAGED") {
      return (
        <Badge
          variant={ticket.score?.urgency === "High" ? "destructive" : "success"}
          className="h-5 text-[10px]"
        >
          {ticket.score?.urgency} Urgency
        </Badge>
      );
    }

    if (ticket.status === "FAILED") {
      return (
        <Badge variant="destructive" className="h-5 text-[10px]">
          Triage Failed
        </Badge>
      );
    }

    if (ticket.status === "RESOLVED") {
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
  })();

  return (
    <div
      className={cn(
        "hover:bg-accent/50 cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md",
        isSelected ? "border-primary bg-primary/5" : "bg-card border-border",
        "border-l-4",
        getBorderColor(),
      )}
    >
      <div className="mb-2 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">#{ticket.id.slice(-4)}</span>
          {renderStatusBadge}
        </div>
        <span className="text-muted-foreground text-xs">
          {new Date(ticket.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
      <p className="text-foreground/80 mb-2 line-clamp-2 text-sm">
        {ticket.message}
      </p>
      <div className="flex gap-2">
        {ticket.category && (
          <Badge variant="secondary" className="text-[10px] opacity-80">
            {ticket.category}
          </Badge>
        )}
      </div>
    </div>
  );
}
