import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "success"
    | "warning";
};

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        "focus:ring-ring inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none",
        {
          "bg-primary text-primary-foreground hover:bg-primary/80 border-transparent shadow":
            variant === "default",
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 border-transparent":
            variant === "secondary",
          "border-transparent bg-red-500 text-white hover:bg-red-600":
            variant === "destructive",
          "text-foreground": variant === "outline",
          "border-transparent bg-green-500 text-white hover:bg-green-600":
            variant === "success",
          "border-transparent bg-yellow-500 text-white hover:bg-yellow-600":
            variant === "warning",
        },
        className,
      )}
      {...props}
    />
  );
}
