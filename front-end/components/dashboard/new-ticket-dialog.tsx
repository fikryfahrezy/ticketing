"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { IngestionForm } from "@/components/ingestion-form";

export function NewTicketDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          className="bg-primary gap-2 border-0 text-white hover:bg-orange-600"
        >
          <Plus className="h-4 w-4" />
          <span>New Ticket</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="overflow-hidden border-0 bg-transparent p-0 shadow-none sm:max-w-lg">
        <Card className="flex h-full w-full flex-col overflow-hidden border-0 shadow-2xl">
          <div className="flex flex-1 flex-col bg-white p-8">
            <div className="mb-6">
              <DialogTitle className="text-secondary mb-2 text-2xl font-bold">
                How can we help you?
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                Tell us about your problem, and we&apos;ll route it to the right
                expert.
              </DialogDescription>
            </div>
            <IngestionForm />
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
