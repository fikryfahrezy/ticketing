import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { listTickets } from "@/app/actions/tickets";
import { Ticket } from "@/lib/ticket.types";

type PageProps = {
  searchParams: Promise<{ ticket?: string }>;
};

export default async function DashboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const selectedTicketId = params.ticket || null;
  let initialTickets: Ticket[] = [];

  try {
    initialTickets = await listTickets();
  } catch (error) {
    console.error("Failed to load tickets", error);
  }

  return (
    <DashboardClient
      initialTickets={initialTickets}
      selectedTicketId={selectedTicketId}
    />
  );
}
