"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      richColors={false}
      toastOptions={{
        classNames: {
          toast:
            "bg-card text-card-foreground border-border shadow-lg rounded-xl border",
          title: "text-card-foreground",
          description: "text-muted-foreground",
          error: "bg-destructive/10 text-destructive border-destructive/30",
          success: "bg-primary/10 text-primary border-primary/30",
          actionButton:
            "bg-primary text-primary-foreground hover:bg-primary/90",
          cancelButton: "bg-muted text-muted-foreground hover:bg-muted/80",
        },
      }}
    />
  );
}
