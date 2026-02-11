"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import {
  createTicketFrom,
  type TicketCreateState,
} from "@/app/actions/tickets";
import { TextArea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

const initialState: TicketCreateState = {
  status: "idle",
};

export function IngestionForm() {
  const [state, formAction] = useActionState(createTicketFrom, initialState);

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
              placeholder="e.g. Jane Doe"
              name="requester_name"
              required
              className="bg-background"
            />
            <Label>
              Requester Email <span className="text-primary">*</span>
            </Label>
            <Input
              placeholder="e.g. jane.doe@example.com"
              name="requester_email"
              type="email"
              required
              className="bg-background"
            />
            <Label>
              Subject <span className="text-primary">*</span>
            </Label>
            <Input
              placeholder="e.g. Issue with payment processing"
              name="subject"
              required
              className="bg-background"
            />
            <Label>
              Description of Issue <span className="text-primary">*</span>
            </Label>
            <TextArea
              rows={5}
              placeholder="e.g. I am having trouble processing a payment for my subscription..."
              name="message"
              required
              className="bg-background"
            />
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
