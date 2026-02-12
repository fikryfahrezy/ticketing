import { LayoutDashboard } from "lucide-react";

export default function TicketPage() {
  return (
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
  );
}
