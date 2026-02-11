"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Ticket } from "@/lib/types";

type TicketContextType = {
  tickets: Ticket[];
  addTicket: (content: string) => void;
  updateTicket: (id: string, updates: Partial<Ticket>) => void;
};

const TicketContext = createContext<TicketContextType | undefined>(undefined);

export const useTickets = () => {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error("useTickets must be used within a TicketProvider");
  }
  return context;
};

export const TicketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("tickets");
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTickets(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("tickets", JSON.stringify(tickets));
  }, [tickets]);

  const addTicket = (content: string) => {
    const newTicket: Ticket = {
      id: new Date().getTime().toString(),
      content,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    setTickets((prev) => [newTicket, ...prev]);
    simulateBackgroundProcessing(newTicket.id, content);
  };

  const updateTicket = (id: string, updates: Partial<Ticket>) => {
    setTickets((prev) => {
      return prev.map((t) => (t.id === id ? { ...t, ...updates } : t));
    });
  };

  const simulateBackgroundProcessing = async (
    ticketId: string,
    content: string,
  ) => {
    // 3-5 seconds delay
    const delay = Math.floor(Math.random() * 2000) + 3000;

    setTimeout(() => {
      // Mock AI Analysis
      const keywords = content.toLowerCase();
      let category: Ticket["category"] = "Feature Request";
      if (keywords.includes("bill") || keywords.includes("pay"))
        category = "Billing";
      else if (
        keywords.includes("bug") ||
        keywords.includes("error") ||
        keywords.includes("crash")
      )
        category = "Technical";

      const sentiment = Math.floor(Math.random() * 10) + 1;
      const urgencyScore = Math.random();
      const urgency =
        urgencyScore > 0.7 ? "High" : urgencyScore > 0.4 ? "Medium" : "Low";

      const draftResponse = `Dear Customer,\n\nThank you for reaching out regarding your ${category} issue. We've received: "${content}".\n\nWe are looking into it immediately.\n\nBest,\nAI Support Agent`;

      updateTicket(ticketId, {
        status: "processed",
        category,
        score: { sentiment, urgency },
        draftResponse,
      });
    }, delay);
  };

  return (
    <TicketContext.Provider value={{ tickets, addTicket, updateTicket }}>
      {children}
    </TicketContext.Provider>
  );
};
