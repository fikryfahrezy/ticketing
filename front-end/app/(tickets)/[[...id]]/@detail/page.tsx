import { getTicket } from "@/app/actions/tickets";
import { TicketDetail } from "@/components/ticket/ticket-detail";
import { Button } from "@/components/ui/button";
import { Ticket } from "@/lib/ticket.types";
import { LayoutDashboard, ArrowLeft } from "lucide-react";
import Link from "next/link";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function TicketDetailPage({ params }: PageProps) {
  const selectedTicketId = (await params).id;
  let selectedTicket: Ticket | null = null;

  try {
    selectedTicket = await getTicket(selectedTicketId);
  } catch (error) {
    console.error("Failed to load tickets", error);
  }

  if (!selectedTicket) {
    return (
      <div className="text-muted-foreground border-border bg-card/50 flex h-full flex-col items-center justify-center rounded-xl border-2 border-dashed p-6">
        <LayoutDashboard className="mb-4 h-8 w-8" />
        <h3 className="mb-2 text-lg font-medium">Ticket Not Found</h3>
        <p className="text-center">
          The ticket you are looking for does not exist.
        </p>
        <Link href="/">
          <Button variant="ghost" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto h-full max-w-4xl">
      <TicketDetail ticket={selectedTicket} />
    </div>
  );
}
