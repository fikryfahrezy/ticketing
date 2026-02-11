import { Ticket } from "@/lib/ticket.types";
import { TicketListItem } from "./ticket-list-item";
import Link from "next/link";

type TicketListProps = {
  tickets: Ticket[];
  selectedId: string | null;
};

export function TicketList({ tickets, selectedId }: TicketListProps) {
  const getUrgencyValue = (urgency?: string) => {
    switch (urgency) {
      case "High":
        return 3;
      case "Medium":
        return 2;
      case "Low":
        return 1;
      default:
        return 0;
    }
  };

  const sortedTickets = [...tickets].sort((a, b) => {
    const diff =
      getUrgencyValue(b.score?.urgency) - getUrgencyValue(a.score?.urgency);
    if (diff !== 0) {
      return diff;
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="h-[calc(100vh-200px)] space-y-3 overflow-y-auto pr-2">
      {sortedTickets.length === 0 && (
        <div className="text-muted-foreground py-10 text-center">
          No tickets yet.
        </div>
      )}
      {sortedTickets.map((ticket) => (
        <Link key={ticket.id} href={`/?ticket=${ticket.id}`} className="block">
          <TicketListItem
            ticket={ticket}
            isSelected={selectedId === ticket.id}
          />
        </Link>
      ))}
    </div>
  );
}
