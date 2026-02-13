"use client";

import { useActionState, useEffect, useState } from "react";
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
import { Loader2, RefreshCcw, Save, Send, Smile } from "lucide-react";
import { toast } from "sonner";
import {
  retryTicketTriage,
  TicketUpdateState,
  updateTicketFrom,
} from "@/app/actions/tickets";
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
  const [isRetrying, setIsRetrying] = useState(false);

  const isResolved = liveTicket.status === "RESOLVED";
  const isPending = liveTicket.status === "PENDING";
  const isFailed = liveTicket.status === "FAILED";
  const hasAnalysis = Boolean(liveTicket.score && liveTicket.category);

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

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await retryTicketTriage(liveTicket.id);
      toast.success("Retry queued", {
        description: "Ticket triage has been queued in the background.",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to retry triage";
      toast.error("Retry failed", {
        description: message,
      });
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <form>
      <Card className="h-full border-none shadow-none">
        <CardHeader className="border-b pb-4">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">Ticket Analysis</CardTitle>
              {hasAnalysis && (
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
              )}
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

            {isPending && (
              <div className="text-muted-foreground bg-muted/30 flex items-center justify-center gap-2 rounded-lg border px-3 py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <p className="text-sm font-medium">AI triage in progress...</p>
              </div>
            )}

            {isFailed && (
              <div className="bg-muted/30 flex flex-wrap items-center justify-between gap-3 rounded-lg border px-3 py-2">
                <div className="space-y-0.5">
                  <p className="text-destructive text-sm font-semibold">
                    AI triage failed for this ticket.
                  </p>
                  {liveTicket.error && (
                    <p className="text-muted-foreground text-xs">
                      {liveTicket.error}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  onClick={handleRetry}
                  disabled={isRetrying}
                >
                  {isRetrying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Retrying...
                    </>
                  ) : (
                    <>
                      <RefreshCcw className="mr-2 h-4 w-4" /> Retry Triage
                    </>
                  )}
                </Button>
              </div>
            )}

            {!isPending && (
              <>
                <TextArea
                  rows={10}
                  name="draft_response"
                  disabled={isResolved}
                  placeholder="e.g. Hello Jane, Thank you for reaching out..."
                  defaultValue={String(
                    formFields?.draft_response ??
                      (liveTicket.draftResponse || ""),
                  )}
                />
                {draftResponseErrors.map((errorMessage, index) => {
                  return (
                    <ErrorMessage key={`draft-response-error-${index}`}>
                      {errorMessage}
                    </ErrorMessage>
                  );
                })}
              </>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-2 border-t pt-4">
          {liveTicket.status !== "RESOLVED" && !isPending && (
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
