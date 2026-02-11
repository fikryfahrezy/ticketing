import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  ref?: React.Ref<HTMLInputElement>;
};

export function Input({ ref, className, ...props }: InputProps) {
  return (
    <input
      ref={ref}
      className={cn(
        "focus:ring-primary text-accent-foreground w-full resize-none rounded-sm border border-gray-200 p-4 text-sm transition-all focus:border-transparent focus:ring-2 focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}
