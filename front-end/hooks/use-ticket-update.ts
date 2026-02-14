import { useEffect } from "react";

import { Ticket } from "@/lib/ticket.types";
import { getTicket, invalidateTicketTags, InvalidateTicketTagScope, InvalidateTicketTagsOptions } from "@/app/actions/tickets";

const POLLING_INTERVAL = 2500;
const inFlightInvalidation: Record<string, Promise<void>> = {};

const invalidateTicketListTagDeduped = async (options: InvalidateTicketTagsOptions) => {
  const key = `${options.scope}-${options.ticketId ?? "all"}`;
  const existing = inFlightInvalidation[key];
  if (existing) {
    await existing;
    return;
  }

  const inFlight = invalidateTicketTags(options).finally(() => {
    delete inFlightInvalidation[key];
  });

  inFlightInvalidation[key] = inFlight;
  await inFlight;
};

export const useTicketUpdate = (ticket: Ticket, scope: InvalidateTicketTagScope = 'list') => {
  useEffect(() => {
    if (ticket.status !== "PENDING") {
      return;
    }

    let isActive = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const refreshTicket = async () => {
      try {
        const updated = await getTicket(ticket.id);
        if (!isActive || !updated) {
          return;
        }

        await invalidateTicketListTagDeduped({ scope, ticketId: ticket.id });
      } catch (error) {
        console.error("Failed to refresh ticket", error);
      }
    };

    void refreshTicket();
    intervalId = setInterval(() => {
      void refreshTicket();
    }, POLLING_INTERVAL);

    return () => {
      isActive = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [ticket.id, ticket.status, scope]);
};
