import { cn } from "@/lib/utils";

export type TextAreaProps =
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    ref?: React.Ref<HTMLTextAreaElement>;
  };

export function TextArea({ ref, className, ...props }: TextAreaProps) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "focus:ring-primary text-accent-foreground w-full resize-none rounded-sm border border-gray-200 p-4 text-sm transition-all focus:border-transparent focus:ring-2 focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}
