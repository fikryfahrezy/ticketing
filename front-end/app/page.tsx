import { TicketList } from "@/components/dashboard/ticket-list";
import { TicketDetail } from "@/components/dashboard/ticket-detail";
import { LayoutDashboard, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NewTicketDialog } from "@/components/dashboard/new-ticket-dialog";
import Link from "next/link";

type PageProps = {
  searchParams: Promise<{ ticket?: string }>;
};

export default async function DashboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const selectedTicketId = params.ticket || null;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-100 font-sans">
      <header className="bg-secondary z-10 flex shrink-0 flex-col justify-between gap-4 border-b border-white/10 px-6 py-4 text-white shadow-md md:flex-row">
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
            "z-0 flex flex-col border-r border-gray-200 bg-white shadow-lg transition-all",
            "h-full w-full md:w-1/3 md:max-w-md md:min-w-[320px]",
            selectedTicketId ? "hidden md:flex" : "flex",
          )}
        >
          <div className="flex items-center justify-between border-b bg-neutral-50 p-4">
            <h2 className="text-secondary font-semibold">Incoming Tickets</h2>
            <div className="flex gap-2 text-xs">
              <span className="rounded-full border bg-gray-100 px-2 py-0.5 text-gray-600">
                Loading...
              </span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto bg-gray-50/50 p-2">
            <TicketList selectedId={selectedTicketId} />
          </div>
        </div>

        <div
          className={cn(
            "flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6",
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
              <TicketDetail ticketId={selectedTicketId} />
            </div>
          ) : (
            <div className="text-muted-foreground m-4 flex h-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white/50">
              <div className="mb-4 rounded-full bg-gray-100 p-6">
                <LayoutDashboard className="h-12 w-12 text-gray-300" />
              </div>
              <p className="text-lg font-medium text-gray-500">
                Select a ticket from the list to begin triage
              </p>
              <p className="mt-2 text-sm text-gray-400">
                AI analysis will appear here automatically
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
