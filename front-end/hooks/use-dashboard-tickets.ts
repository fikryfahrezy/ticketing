import { useEffect, useRef, useState } from "react";

import { Ticket } from "@/lib/ticket.types";
import { getTicket } from "@/app/actions/tickets";

type UseDashboardTicketsResult = {
  renderTickets: Ticket[];
  selectedTicket: Ticket | null;
};

export const useDashboardTickets = (
  initialTickets: Ticket[],
  selectedTicketId: string | null,
): UseDashboardTicketsResult => {
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const pendingIdsRef = useRef<string[]>([]);
  const initialTicketsRef = useRef<Ticket[]>(initialTickets);

  useEffect(() => {
    initialTicketsRef.current = initialTickets;
  }, [initialTickets]);

  const renderTickets = tickets ?? initialTickets;

  const pendingIdsKey = renderTickets
    .filter((ticket) => {
      return ticket.status === "PENDING"
    }).map((ticket) => {
      return ticket.id
    }).join(",");

  useEffect(() => {
    pendingIdsRef.current = renderTickets
      .filter((ticket) => {
        return ticket.status === "PENDING";
      }).map((ticket) => {
        return ticket.id
      });
  }, [pendingIdsKey, renderTickets]);

  useEffect(() => {
    let isActive = true;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const pollPendingTickets = async () => {
      if (!isActive) {
        return;
      }

      const pendingIds = pendingIdsRef.current;
      if (pendingIds.length === 0) {
        return;
      }

      try {
        const updates = await Promise.all(
          pendingIds.map((id) => {
            return getTicket(id);
          }),
        );
        const updatesById = new Map(
          updates
            .filter((ticket): ticket is Ticket => {
              return Boolean(ticket);
            })
            .map((ticket) => {
              return [ticket.id, ticket];
            }),
        );

        setTickets((prev) => {
          const baseTickets = prev ?? initialTicketsRef.current;
          return baseTickets.map((ticket) => {
            const updated = updatesById.get(ticket.id);
            return updated ?? ticket;
          });
        });
      } catch (error) {
        console.error("Failed to refresh pending tickets", error);
      }

      timeoutId = setTimeout(pollPendingTickets, 2500);
    };

    pollPendingTickets();

    return () => {
      isActive = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [pendingIdsKey]);

  const selectedTicket = selectedTicketId
    ? (renderTickets.find((ticket) => ticket.id === selectedTicketId) ?? null)
    : null;

  return {
    renderTickets,
    selectedTicket,
  };
};
