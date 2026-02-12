"use client";

import { useEffect } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { toast } from "sonner";
import {
  createTicketFrom,
  type TicketCreateState,
} from "@/app/actions/tickets";
import { TextArea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { ErrorMessage } from "../ui/error-message";

const initialState: TicketCreateState = {
  status: "idle",
};

export function IngestionForm() {
  const [state, formAction] = useActionState(createTicketFrom, initialState);

  const formFields = state.status === "error" ? state.formFields : undefined;
  const errorFields = state.status === "error" ? state.errorFields : undefined;
  const requesterNameErrors = errorFields?.requester_name ?? [];
  const requesterEmailErrors = errorFields?.requester_email ?? [];
  const subjectErrors = errorFields?.subject ?? [];
  const messageErrors = errorFields?.message ?? [];

  useEffect(() => {
    if (state.status === "error") {
      toast.error("Failed to submit ticket", {
        description: state.error,
      });
    }
  }, [state]);

  return (
    <>
      {state.status === "success" ? (
        <div className="animate-in fade-in zoom-in flex flex-1 flex-col items-center justify-center space-y-4 py-10 text-center duration-300">
          <div className="bg-success/10 flex h-16 w-16 items-center justify-center rounded-full">
            <Check className="text-success h-8 w-8" />
          </div>
          <div>
            <p className="text-card-foreground text-lg font-bold">
              Request Received
            </p>
            <p className="text-muted-foreground text-sm">
              Reference ID: #{state.ticket.id}
            </p>
          </div>
          <div className="mx-auto max-w-xs rounded-md bg-blue-500/10 px-3 py-2 text-xs text-blue-600 dark:text-blue-400">
            AI Triage initiated. Generating draft response...
          </div>
        </div>
      ) : (
        <form action={formAction} className="flex flex-1 flex-col space-y-6">
          <div className="space-y-2">
            <Label>
              Requester Name <span className="text-primary">*</span>
            </Label>
            <Input
              name="requester_name"
              defaultValue={String(formFields?.requester_name ?? "")}
              placeholder="e.g. Jane Doe"
              aria-invalid={requesterNameErrors.length > 0}
              required
            />
            {requesterNameErrors.map((errorMessage, index) => {
              return (
                <ErrorMessage key={`requester-name-error-${index}`}>
                  {errorMessage}
                </ErrorMessage>
              );
            })}
            <Label>
              Requester Email <span className="text-primary">*</span>
            </Label>
            <Input
              name="requester_email"
              defaultValue={String(formFields?.requester_email ?? "")}
              placeholder="e.g. jane.doe@example.com"
              type="email"
              aria-invalid={requesterEmailErrors.length > 0}
              required
            />
            {requesterEmailErrors.map((errorMessage, index) => {
              return (
                <ErrorMessage key={`requester-email-error-${index}`}>
                  {errorMessage}
                </ErrorMessage>
              );
            })}
            <Label>
              Subject <span className="text-primary">*</span>
            </Label>
            <Input
              name="subject"
              defaultValue={String(formFields?.subject ?? "")}
              placeholder="e.g. Issue with payment processing"
              aria-invalid={subjectErrors.length > 0}
              required
            />
            {subjectErrors.map((errorMessage, index) => {
              return (
                <ErrorMessage key={`subject-error-${index}`}>
                  {errorMessage}
                </ErrorMessage>
              );
            })}
            <Label>
              Description of Issue <span className="text-primary">*</span>
            </Label>
            <TextArea
              name="message"
              defaultValue={String(formFields?.message ?? "")}
              rows={5}
              placeholder="e.g. I am having trouble processing a payment for my subscription..."
              aria-invalid={messageErrors.length > 0}
              required
            />
            {messageErrors.map((errorMessage, index) => {
              return (
                <ErrorMessage key={`message-error-${index}`}>
                  {errorMessage}
                </ErrorMessage>
              );
            })}
          </div>
          <SubmitButton />
          <p className="text-muted-foreground text-center text-xs">
            Your details are protected by our privacy policy.
          </p>
        </form>
      )}
    </>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="bg-primary w-full rounded-lg py-6 text-lg font-bold text-white shadow-lg transition-all hover:bg-orange-600 hover:shadow-xl"
    >
      {pending ? "Submitting..." : "Submit Request"}
    </Button>
  );
}
