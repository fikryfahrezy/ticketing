"use client";

import Link from "next/link";
import { LayoutDashboard, ArrowLeft } from "lucide-react";

import { Ticket } from "@/lib/ticket.types";
import { TicketList } from "@/components/ticket/ticket-list";
import { TicketDetail } from "@/components/ticket/ticket-detail";
import { NewTicketDialog } from "@/components/ticket/new-ticket-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDashboardTickets } from "@/hooks/use-dashboard-tickets";

type DashboardClientProps = {
  initialTickets: Ticket[];
  selectedTicketId: string | null;
};

export function DashboardClient({
  initialTickets,
  selectedTicketId,
}: DashboardClientProps) {
  const { renderTickets, selectedTicket } = useDashboardTickets(
    initialTickets,
    selectedTicketId,
  );

  return (
    <div className="bg-background flex h-screen flex-col overflow-hidden font-sans">
      <header className="bg-secondary text-secondary-foreground z-10 flex shrink-0 flex-col justify-between gap-4 border-b border-white/10 px-6 py-4 shadow-md md:flex-row">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary rounded-md p-2">
              <LayoutDashboard className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg leading-none font-bold">
                Agent Dashboard
              </h1>
              <p className="text-xs font-light text-gray-300">AI Triage Hub</p>
            </div>
          </div>
        </div>

        <NewTicketDialog />
      </header>

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
                {renderTickets.length} total
              </span>
            </div>
          </div>
          <div className="bg-muted/10 flex-1 overflow-y-auto p-2">
            <TicketList tickets={renderTickets} selectedId={selectedTicketId} />
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

          {selectedTicketId ? (
            <div className="mx-auto h-full max-w-4xl">
              <TicketDetail ticket={selectedTicket} />
            </div>
          ) : (
            <div className="text-muted-foreground border-border bg-card/50 m-4 flex h-full flex-col items-center justify-center rounded-xl border-2 border-dashed">
              <div className="bg-muted mb-4 rounded-full p-6">
                <LayoutDashboard className="text-muted-foreground h-12 w-12" />
              </div>
              <p className="text-foreground text-lg font-medium">
                Select a ticket from the list to begin triage
              </p>
              <p className="text-muted-foreground mt-2 text-sm">
                AI analysis will appear here automatically
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
