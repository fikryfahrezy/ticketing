"use client";
import { useState } from "react";
import { Ticket } from "@/lib/ticket.types";
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
import { updateTicket } from "@/app/actions/tickets";
import { TextArea } from "../ui/textarea";

type TicketDetailProps = {
  ticket: Ticket | null;
};

export function TicketDetail({ ticket }: TicketDetailProps) {
  if (!ticket) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-foreground text-lg font-semibold">
            Ticket not found
          </p>
          <p className="text-muted-foreground mt-2 text-sm">
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
  const [_draft, setDraft] = useState("");
  const draft = _draft || ticket.draftResponse;

  const handleResolve = async () => {
    await updateTicket(ticket.id, {
      status: "RESOLVED",
      draft_response: draft,
    });
  };

  const handleSaveDraft = async () => {
    await updateTicket(ticket.id, {
      draft_response: draft,
    });
  };

  if (ticket.status === "PENDING") {
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

  if (ticket.status === "FAILED") {
    return (
      <div className="text-muted-foreground flex h-64 flex-col items-center justify-center">
        <p className="text-destructive text-sm font-semibold">
          AI triage failed for this ticket.
        </p>
        {ticket.error && (
          <p className="text-muted-foreground mt-2 max-w-md text-center text-xs">
            {ticket.error}
          </p>
        )}
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
          <p className="text-sm whitespace-pre-wrap">{ticket.message}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-muted-foreground flex items-center gap-1 text-xs font-semibold uppercase">
              AI Draft Response
              {ticket.status === "RESOLVED" && (
                <span className="ml-2 text-green-600">(Resolved)</span>
              )}
            </h4>
          </div>
          <TextArea
            defaultValue={draft}
            rows={10}
            onChange={(e) => {
              return setDraft(e.target.value);
            }}
            disabled={ticket.status === "RESOLVED"}
          />
        </div>
      </CardContent>

      <CardFooter className="flex justify-end gap-2 border-t pt-4">
        {ticket.status !== "RESOLVED" && (
          <>
            <Button variant="ghost" onClick={handleSaveDraft}>
              <Save className="mr-2 h-4 w-4" /> Save Draft
            </Button>
            <Button onClick={handleResolve}>
              <Send className="mr-2 h-4 w-4" /> Resolve & Send
            </Button>
          </>
        )}
        {ticket.status === "RESOLVED" && (
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
