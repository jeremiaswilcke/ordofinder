"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  locale: string;
  alternate: string;
};

/**
 * Pfad-erhaltender Sprachumschalter: Ersetzt nur das Locale-Praefix und
 * behaelt den Rest der URL inkl. ?query bei.
 */
export function LocaleSwitch({ locale, alternate }: Props) {
  const pathname = usePathname() ?? `/${locale}`;
  const withoutLocale = pathname.replace(new RegExp(`^/${locale}(?=/|$)`), "");
  const target = `/${alternate}${withoutLocale || ""}`;

  return (
    <Link
      href={target}
      className="inline-flex items-center rounded border border-outline px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
      aria-label={`Switch to ${alternate.toUpperCase()}`}
    >
      {alternate.toUpperCase()}
    </Link>
  );
}
