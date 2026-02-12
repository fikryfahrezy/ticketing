import { useEffect, useState } from "react";

import { Ticket } from "@/lib/ticket.types";
import { getTicket } from "@/app/actions/tickets";

const POLLING_INTERVAL = 2500;

export const useTicketItem = (ticket: Ticket): Ticket => {
  const [_liveTicket, setLiveTicket] = useState<Ticket | null>(null);
  const liveTicket = _liveTicket ?? ticket;

  useEffect(() => {
    setLiveTicket(ticket);
  }, [ticket]);

  useEffect(() => {
    if (liveTicket.status !== "PENDING") {
      return;
    }

    let isActive = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const refreshTicket = async () => {
      try {
        const updated = await getTicket(liveTicket.id);
        if (!isActive || !updated) {
          return;
        }

        setLiveTicket(updated);
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
  }, [liveTicket.id, liveTicket.status]);

  return liveTicket;
};
