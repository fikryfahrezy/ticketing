"use client";

import { Ticket } from "@/lib/ticket.types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTicketItem } from "@/hooks/use-ticket-item";
import { CheckCircle2, Clock } from "lucide-react";

type TicketListItemProps = {
  ticket: Ticket;
  isSelected: boolean;
};

export function TicketListItem({ ticket, isSelected }: TicketListItemProps) {
  const liveTicket = useTicketItem(ticket);

  const getBorderColor = () => {
    if (liveTicket.status === "RESOLVED") {
      return "border-l-green-500";
    }
    if (liveTicket.status === "FAILED") {
      return "border-l-red-500";
    }
    if (liveTicket.score?.urgency === "High") {
      return "border-l-red-500";
    }
    return "";
  };

  const renderStatusBadge = (() => {
    if (liveTicket.status === "PENDING") {
      return (
        <Badge
          variant="secondary"
          className="flex h-5 items-center gap-1 text-[10px]"
        >
          <Clock className="h-3 w-3" /> Processing...
        </Badge>
      );
    }

    if (liveTicket.status === "TRIAGED") {
      return (
        <Badge
          variant={
            liveTicket.score?.urgency === "High" ? "destructive" : "success"
          }
          className="h-5 text-[10px]"
        >
          {liveTicket.score?.urgency} Urgency
        </Badge>
      );
    }

    if (liveTicket.status === "FAILED") {
      return (
        <Badge variant="destructive" className="h-5 text-[10px]">
          Triage Failed
        </Badge>
      );
    }

    if (liveTicket.status === "RESOLVED") {
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
          <span className="text-sm font-semibold">
            #{liveTicket.id.slice(-4)}
          </span>
          {renderStatusBadge}
        </div>
        <span className="text-muted-foreground text-xs">
          {new Date(liveTicket.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
      <p className="text-foreground/80 mb-2 line-clamp-2 text-sm">
        {liveTicket.message}
      </p>
      <div className="flex gap-2">
        {liveTicket.category && (
          <Badge variant="secondary" className="text-[10px] opacity-80">
            {liveTicket.category}
          </Badge>
        )}
      </div>
    </div>
  );
}
