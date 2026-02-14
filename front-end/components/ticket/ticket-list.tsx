import { Ticket } from "@/lib/ticket.types";
import { TicketListItem } from "./ticket-list-item";
import Link from "next/link";

type TicketListProps = {
  tickets: Ticket[];
  selectedId: string | null;
};

export function TicketList({ tickets, selectedId }: TicketListProps) {
  return (
    <div className="h-[calc(100vh-200px)] space-y-3 overflow-y-auto pr-2">
      {tickets.length === 0 && (
        <div className="text-muted-foreground py-10 text-center">
          No tickets yet.
        </div>
      )}
      {tickets.map((ticket) => (
        <Link key={ticket.id} href={`/${ticket.id}`} className="block">
          <TicketListItem
            ticket={ticket}
            isSelected={selectedId === ticket.id}
          />
        </Link>
      ))}
    </div>
  );
}
