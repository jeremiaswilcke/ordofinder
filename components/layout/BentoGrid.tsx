import { cn } from "@/lib/utils";

export function BentoGrid({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("grid grid-cols-1 gap-4 md:grid-cols-12", className)}>{children}</div>;
}
