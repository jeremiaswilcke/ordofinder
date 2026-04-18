import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = {
  href?: string;
  children: ReactNode;
  className?: string;
  variant?: "primary" | "secondary";
};

const styles = {
  primary: "bg-primary text-on-primary hover:bg-primary-dim",
  secondary: "bg-surface-container text-on-surface-variant hover:bg-surface-container-high",
};

export function Button({ href, children, className, variant = "primary" }: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center rounded px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] transition-colors",
    styles[variant],
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return <button className={classes}>{children}</button>;
}
