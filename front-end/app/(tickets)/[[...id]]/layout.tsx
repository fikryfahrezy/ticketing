import { ArrowLeft } from "lucide-react";
import { TicketList } from "@/components/ticket/ticket-list";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Ticket } from "@/lib/ticket.types";
import { listTickets } from "../../actions/tickets";
import Link from "next/link";

export default async function TicketsLayout(
  props: Readonly<{
    blank: React.ReactNode;
    detail: React.ReactNode;
    params: Promise<{ id?: string[] }>;
  }>,
) {
  const p = await props.params;
  const selectedTicketId = p.id ? p.id[0] : null;
  let initialTickets: Ticket[] = [];

  try {
    initialTickets = await listTickets();
  } catch (error) {
    console.error("Failed to load tickets", error);
  }

  return (
    <main className="flex flex-1 overflow-hidden">
      <div
        className={cn(
          "border-border bg-card z-0 flex flex-col border-r shadow-lg transition-all",
          "h-full w-full md:w-1/3 md:max-w-md md:min-w-[320px]",
          selectedTicketId ? "hidden md:flex" : "flex",
        )}
      >
        <div className="bg-muted/30 flex items-center justify-between border-b p-4">
          <h2 className="text-foreground font-semibold">Incoming Tickets</h2>
          <div className="flex gap-2 text-xs">
            <span className="bg-muted text-muted-foreground rounded-full border px-2 py-0.5">
              {initialTickets.length} total
            </span>
          </div>
        </div>
        <div className="bg-muted/10 flex-1 overflow-y-auto p-2">
          <TicketList tickets={initialTickets} selectedId={selectedTicketId} />
        </div>
      </div>

      <div
        className={cn(
          "bg-muted/20 flex-1 overflow-y-auto p-4 md:p-6",
          !selectedTicketId ? "hidden md:block" : "block",
        )}
      >
        {selectedTicketId && (
          <Link href="/">
            <Button
              variant="ghost"
              className="mb-4 gap-2 pl-0 hover:bg-transparent md:hidden"
            >
              <ArrowLeft className="h-4 w-4" /> Back to List
            </Button>
          </Link>
        )}
        {selectedTicketId ? props.detail : props.blank}
      </div>
    </main>
  );
}
