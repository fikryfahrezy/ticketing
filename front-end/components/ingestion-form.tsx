"use client";

import React, { useState } from "react";
import { useTickets } from "@/components/ticket-provider";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export function IngestionForm() {
  const { addTicket } = useTickets();
  const [content, setContent] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState("");

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      return;
    }

    addTicket(content);

    setSubmitted(true);
    setReferenceId(Math.floor(Math.random() * 10000).toString());
    setContent("");

    setTimeout(() => {
      setSubmitted(false);
    }, 3000);
  };

  return (
    <>
      {submitted ? (
        <div className="animate-in fade-in zoom-in flex flex-1 flex-col items-center justify-center space-y-4 py-10 text-center duration-300">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <p className="text-secondary text-lg font-bold">Request Received</p>
            <p className="text-muted-foreground text-sm">
              Reference ID: #{referenceId}
            </p>
          </div>
          <div className="mx-auto max-w-xs rounded-md bg-blue-50 px-3 py-2 text-xs text-blue-800">
            AI Triage initiated. Generating draft response...
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col space-y-6"
        >
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Description of Issue <span className="text-primary">*</span>
            </label>
            <textarea
              className="focus:ring-primary h-40 w-full resize-none rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm transition-all focus:border-transparent focus:ring-2 focus:outline-none"
              placeholder="e.g. I am having trouble processing a payment for my subscription..."
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
              }}
              required
            />
          </div>
          <Button
            type="submit"
            className="bg-primary w-full rounded-lg py-6 text-lg font-bold text-white shadow-lg transition-all hover:bg-orange-600 hover:shadow-xl"
          >
            Submit Request
          </Button>
          <p className="text-center text-xs text-gray-400">
            Your details are protected by our privacy policy.
          </p>
        </form>
      )}
    </>
  );
}
