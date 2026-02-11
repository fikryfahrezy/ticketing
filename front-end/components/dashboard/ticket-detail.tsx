"use client";

import { useTickets } from "@/components/ticket-provider";
import { useState, useEffect } from "react";
import { Ticket } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, Send, Smile } from "lucide-react";

type TicketDetailProps = {
  ticketId: string;
};

export function TicketDetail({ ticketId }: TicketDetailProps) {
  const { tickets } = useTickets();
  const ticket = tickets.find((t) => {
    return t.id === ticketId;
  });

  if (!ticket) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-700">
            Ticket not found
          </p>
          <p className="mt-2 text-sm text-gray-500">
            This ticket may have been deleted or doesn&apos;t exist.
          </p>
        </div>
      </div>
    );
  }

  return <TicketDetailContent ticket={ticket} />;
}

type TicketDetailContentProps = {
  ticket: Ticket;
};

export function TicketDetailContent({ ticket }: TicketDetailContentProps) {
  const { updateTicket } = useTickets();
  const [draft, setDraft] = useState(ticket.draftResponse || "");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(ticket.draftResponse || "");
  }, [ticket.draftResponse, ticket.id]);

  const handleResolve = () => {
    updateTicket(ticket.id, {
      status: "resolved",
      draftResponse: draft,
    });
  };

  const handleSaveDraft = () => {
    updateTicket(ticket.id, {
      draftResponse: draft,
    });
  };

  if (ticket.status === "pending") {
    return (
      <div className="text-muted-foreground flex h-64 animate-pulse flex-col items-center justify-center">
        <Loader2 className="mb-4 h-10 w-10 animate-spin" />
        <p>AI Triage in progress...</p>
        <p className="mt-2 text-xs">
          Analyzing sentiment, urgency, and drafting response.
        </p>
      </div>
    );
  }

  return (
    <Card className="h-full border-none shadow-none">
      <CardHeader className="border-b pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">Ticket Analysis</CardTitle>
            <div className="mt-2 flex gap-3">
              <Badge variant="outline" className="flex items-center gap-1">
                Score:{" "}
                <span className="font-bold">{ticket.score?.sentiment}/10</span>{" "}
                <Smile className="ml-1 h-3 w-3" />
              </Badge>
              <Badge
                variant={
                  ticket.score?.urgency === "High" ? "destructive" : "secondary"
                }
              >
                {ticket.score?.urgency} Urgency
              </Badge>
              <Badge variant="outline">{ticket.category}</Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 py-6">
        <div className="bg-muted/30 rounded-lg border p-4">
          <h4 className="text-muted-foreground mb-1 text-xs font-semibold uppercase">
            User Inquiry
          </h4>
          <p className="text-sm whitespace-pre-wrap">{ticket.content}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-muted-foreground flex items-center gap-1 text-xs font-semibold uppercase">
              AI Draft Response
              {ticket.status === "resolved" && (
                <span className="ml-2 text-green-600">(Resolved)</span>
              )}
            </h4>
          </div>
          <textarea
            className="focus:ring-primary bg-background h-48 w-full resize-none rounded-md border p-4 text-sm focus:ring-2 focus:outline-none"
            value={draft}
            onChange={(e) => {
              return setDraft(e.target.value);
            }}
            disabled={ticket.status === "resolved"}
          />
        </div>
      </CardContent>

      <CardFooter className="flex justify-end gap-2 border-t pt-4">
        {ticket.status !== "resolved" && (
          <>
            <Button variant="ghost" onClick={handleSaveDraft}>
              <Save className="mr-2 h-4 w-4" /> Save Draft
            </Button>
            <Button
              onClick={handleResolve}
              variant={
                ticket.score?.urgency === "High" ? "destructive" : "default"
              }
            >
              <Send className="mr-2 h-4 w-4" /> Resolve & Send
            </Button>
          </>
        )}
        {ticket.status === "resolved" && (
          <Button
            variant="outline"
            disabled
            className="border-green-200 bg-green-50 text-green-600"
          >
            Ticket Resolved
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
