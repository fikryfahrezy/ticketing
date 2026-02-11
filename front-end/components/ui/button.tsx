import * as React from "react";
import { cn } from "@/lib/utils";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  ref?: React.Ref<HTMLButtonElement>;
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary";
};

export function Button({
  ref,
  className,
  variant = "default",
  ...props
}: ButtonProps) {
  return (
    <button
      ref={ref}
      className={cn(
        "focus-visible:ring-ring inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
        {
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow":
            variant === "default",
          "border-input bg-background hover:bg-accent hover:text-accent-foreground border shadow-sm":
            variant === "outline",
          "hover:bg-accent hover:text-accent-foreground": variant === "ghost",
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm":
            variant === "destructive",
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm":
            variant === "secondary",
        },
        className,
      )}
      {...props}
    />
  );
}
