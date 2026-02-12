"use client";

import { useActionState, useEffect } from "react";
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
import { toast } from "sonner";
import { TicketUpdateState, updateTicketFrom } from "@/app/actions/tickets";
import { useTicketItem } from "@/hooks/use-ticket-item";
import { TextArea } from "../ui/textarea";
import { ErrorMessage } from "../ui/error-message";

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

const initialState: TicketUpdateState = {
  status: "idle",
};

export function TicketDetailContent({ ticket }: TicketDetailContentProps) {
  const liveTicket = useTicketItem(ticket);

  const [state, formAction] = useActionState(
    updateTicketFrom.bind(null, liveTicket.id),
    initialState,
  );

  const formFields = state.status === "error" ? state.formFields : undefined;
  const errorFields = state.status === "error" ? state.errorFields : undefined;
  const draftResponseErrors = errorFields?.draft_response ?? [];

  useEffect(() => {
    if (state.status === "error") {
      toast.error("Failed to update ticket", {
        description: state.error,
      });
    }
  }, [state]);

  const handleResolve = (formData: FormData) => {
    formData.append("status", "RESOLVED");
    formAction(formData);
  };

  if (liveTicket.status === "PENDING") {
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

  if (liveTicket.status === "FAILED") {
    return (
      <div className="text-muted-foreground flex h-64 flex-col items-center justify-center">
        <p className="text-destructive text-sm font-semibold">
          AI triage failed for this ticket.
        </p>
        {liveTicket.error && (
          <p className="text-muted-foreground mt-2 max-w-md text-center text-xs">
            {liveTicket.error}
          </p>
        )}
      </div>
    );
  }

  return (
    <form>
      <Card className="h-full border-none shadow-none">
        <CardHeader className="border-b pb-4">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">Ticket Analysis</CardTitle>
              <div className="mt-2 flex gap-3">
                <Badge variant="outline" className="flex items-center gap-1">
                  Score:{" "}
                  <span className="font-bold">
                    {liveTicket.score?.sentiment}/10
                  </span>{" "}
                  <Smile className="ml-1 h-3 w-3" />
                </Badge>
                <Badge
                  variant={
                    liveTicket.score?.urgency === "High"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {liveTicket.score?.urgency} Urgency
                </Badge>
                <Badge variant="outline">{liveTicket.category}</Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 py-6">
          <div className="bg-muted/30 rounded-lg border p-4">
            <h4 className="text-muted-foreground mb-1 text-xs font-semibold uppercase">
              User Inquiry
            </h4>
            <p className="text-sm whitespace-pre-wrap">{liveTicket.message}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-muted-foreground flex items-center gap-1 text-xs font-semibold uppercase">
                AI Draft Response
                {liveTicket.status === "RESOLVED" && (
                  <span className="ml-2 text-green-600">(Resolved)</span>
                )}
              </h4>
            </div>
            <TextArea
              name="draft_response"
              defaultValue={String(
                formFields?.draft_response ?? liveTicket.draftResponse,
              )}
              disabled={liveTicket.status === "RESOLVED"}
              rows={10}
            />
            {draftResponseErrors.map((errorMessage, index) => {
              return (
                <ErrorMessage key={`draft-response-error-${index}`}>
                  {errorMessage}
                </ErrorMessage>
              );
            })}
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-2 border-t pt-4">
          {liveTicket.status !== "RESOLVED" && (
            <>
              <Button variant="ghost" formAction={formAction}>
                <Save className="mr-2 h-4 w-4" /> Save Draft
              </Button>
              <Button formAction={handleResolve}>
                <Send className="mr-2 h-4 w-4" /> Resolve & Send
              </Button>
            </>
          )}
          {liveTicket.status === "RESOLVED" && (
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
    </form>
  );
}
