export type ErrorMessageProps = {
  children: React.ReactNode;
};

export function ErrorMessage({ children }: ErrorMessageProps) {
  return <p className="text-destructive text-xs">{children}</p>;
}
