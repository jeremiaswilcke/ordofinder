"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LocaleSwitch } from "./LocaleSwitch";

type NavItem = { href: string; label: string };

type Props = {
  locale: string;
  alternateLocale: string;
  navItems: NavItem[];
  workspaceHref: string;
  workspaceLabel: string;
  edition: string;
};

export function MobileMenu({
  locale,
  alternateLocale,
  navItems,
  workspaceHref,
  workspaceLabel,
  edition,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  // Bei Routenwechsel Menu automatisch schließen
  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Escape schließt
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    // Scroll lock
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Menu"
        aria-expanded={open}
        className="md:hidden inline-flex items-center justify-center rounded border border-outline px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-on-surface hover:border-primary hover:text-primary"
      >
        Menu
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] md:hidden"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="absolute inset-0 h-full w-full bg-black/50"
          />

          {/* Panel */}
          <div className="absolute inset-x-0 top-0 flex max-h-screen flex-col gap-6 border-b border-outline bg-background p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="font-headline text-xl text-on-surface">
                Ordofinder
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="rounded border border-outline px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-on-surface hover:border-primary hover:text-primary"
              >
                ✕
              </button>
            </div>

            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded px-3 py-3 text-base text-on-surface-variant hover:bg-surface-container-lowest hover:text-on-surface"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/40 pt-4">
              <LocaleSwitch locale={locale} alternate={alternateLocale} />
              <Link
                href={workspaceHref}
                onClick={() => setOpen(false)}
                className="rounded border border-primary bg-primary px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-on-primary hover:bg-primary-dim"
              >
                {workspaceLabel}
              </Link>
            </div>

            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-outline">
              {edition}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
