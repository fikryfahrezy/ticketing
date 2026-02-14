"use client";

import { Ticket } from "@/lib/ticket.types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTicketUpdate } from "@/hooks/use-ticket-update";
import { CheckCircle2, Clock } from "lucide-react";
import { TicketStatus } from "./ticket-status";

type TicketListItemProps = {
  ticket: Ticket;
  isSelected: boolean;
};

export function TicketListItem({ ticket, isSelected }: TicketListItemProps) {
  useTicketUpdate(ticket);

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
    return "";
  };

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
          <TicketStatus
            status={ticket.status}
            urgency={ticket.score?.urgency}
          />
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
