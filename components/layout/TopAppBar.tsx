import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Chip } from "../ui/Chip";
import { Icon } from "../ui/Icon";

export async function TopAppBar({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "nav" });

  return (
    <header className="border-b border-outline-variant/50 bg-surface-container-lowest">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
        <div className="flex items-center gap-4">
          <Link href={`/${locale}`} className="flex items-center gap-3">
            <Icon name="church" className="text-2xl text-primary" filled />
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-outline">Current city</p>
              <p className="font-headline text-2xl text-primary">Vienna</p>
            </div>
          </Link>
          <button className="hidden items-center gap-1 text-sm text-on-surface-variant md:inline-flex">
            <span>Switch city</span>
            <Icon name="expand_more" />
          </button>
        </div>
        <nav className="hidden items-center gap-2 md:flex">
          <Link href={`/${locale}/cities`}><Chip>{t("cities")}</Chip></Link>
          <Link href={`/${locale}/map`}><Chip>{t("map")}</Chip></Link>
          <Link href={`/${locale}/submit`}><Chip active>{t("submit")}</Chip></Link>
          <Link href={`/${locale}/login`}><Chip>{t("login")}</Chip></Link>
        </nav>
        <button className="md:hidden">
          <Icon name="menu" className="text-primary" />
        </button>
      </div>
    </header>
  );
}
