import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Chip } from "../ui/Chip";
import { Icon } from "../ui/Icon";

export async function TopAppBar({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "nav" });
  const landing = await getTranslations({ locale, namespace: "landing" });
  const alternateLocale = locale === "en" ? "de" : "en";

  return (
    <header className="sticky top-0 z-50 border-b border-outline bg-background/95 backdrop-blur-sm">
      <div className="mx-auto grid max-w-7xl items-center gap-4 px-4 py-4 md:grid-cols-[1fr_auto_1fr] md:px-6">
        <div className="flex items-center gap-3">
          <Link href={`/${locale}`} className="flex items-center gap-3">
            <div className="grid h-6 w-6 place-items-center border border-on-surface text-[13px] font-headline text-on-surface">O</div>
            <span className="font-headline text-xl text-on-surface">Ordofinder</span>
            <span className="hidden font-mono text-[11px] uppercase tracking-[0.12em] text-outline md:inline-flex">
              Archive
            </span>
          </Link>
        </div>
        <nav className="hidden items-center justify-center gap-7 md:flex">
          <Link href={`/${locale}`} className="border-b border-transparent px-0.5 py-1 text-[12.5px] uppercase tracking-[0.08em] text-on-surface-variant transition-colors hover:text-on-surface">
            {t("archive")}
          </Link>
          <Link href={`/${locale}/cities`} className="border-b border-transparent px-0.5 py-1 text-[12.5px] uppercase tracking-[0.08em] text-on-surface-variant transition-colors hover:text-on-surface">
            {t("cities")}
          </Link>
          <Link href={`/${locale}/map`} className="border-b border-transparent px-0.5 py-1 text-[12.5px] uppercase tracking-[0.08em] text-on-surface-variant transition-colors hover:text-on-surface">
            {t("map")}
          </Link>
          <Link href={`/${locale}/submit`} className="border-b border-transparent px-0.5 py-1 text-[12.5px] uppercase tracking-[0.08em] text-on-surface-variant transition-colors hover:text-on-surface">
            {t("submit")}
          </Link>
        </nav>
        <div className="hidden items-center justify-end gap-4 md:flex">
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-outline">{landing("edition")}</span>
          <Link
            href={`/${alternateLocale}`}
            className="inline-flex items-center rounded border border-outline px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-on-surface-variant"
          >
            {alternateLocale}
          </Link>
          <Link href={`/${locale}/submit`}><Chip>{landing("citySwitch")}</Chip></Link>
        </div>
        <button className="md:hidden">
          <Icon name="menu" className="text-primary" />
        </button>
      </div>
    </header>
  );
}
