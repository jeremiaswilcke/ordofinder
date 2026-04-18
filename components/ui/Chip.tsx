import { cn } from "@/lib/utils";

type ChipProps = {
  children: React.ReactNode;
  active?: boolean;
  overlay?: boolean;
};

export function Chip({ children, active = false, overlay = false }: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-5 py-2 text-[10px] font-semibold uppercase tracking-wider",
        overlay
          ? "border border-white/20 bg-white/10 text-white backdrop-blur-md"
          : active
            ? "bg-primary text-on-primary"
            : "bg-surface-container text-on-surface-variant",
      )}
    >
      {children}
    </span>
  );
}
