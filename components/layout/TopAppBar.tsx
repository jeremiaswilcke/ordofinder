import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Chip } from "../ui/Chip";
import { LocaleSwitch } from "./LocaleSwitch";
import { MobileMenu } from "./MobileMenu";
import { getCurrentProfile, isReviewerOrHigher } from "@/lib/auth";

const NAV_LINK =
  "border-b border-transparent px-0.5 py-1 text-[12.5px] uppercase tracking-[0.08em] text-on-surface-variant transition-colors hover:text-on-surface";

export async function TopAppBar({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "nav" });
  const landing = await getTranslations({ locale, namespace: "landing" });
  const alternateLocale = locale === "en" ? "de" : "en";

  const profile = await getCurrentProfile();
  const loggedIn = Boolean(profile);
  const canContribute = isReviewerOrHigher(profile?.role ?? null);
  const hasAdminScope =
    profile?.role === "regional_admin" || profile?.role === "global_admin";

  const workspaceHref = hasAdminScope
    ? `/${locale}/admin`
    : canContribute
      ? `/${locale}/reviewer`
      : loggedIn
        ? `/${locale}/apply`
        : `/${locale}/login`;
  const workspaceLabel = hasAdminScope
    ? t("admin")
    : canContribute
      ? t("reviewer")
      : loggedIn
        ? t("apply")
        : t("login");

  const navItems = [
    { href: `/${locale}`, label: t("archive") },
    { href: `/${locale}/cities`, label: t("cities") },
    { href: `/${locale}/map`, label: t("map") },
    ...(canContribute
      ? [{ href: `/${locale}/submit`, label: t("submit") }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-outline bg-background/95 backdrop-blur-sm">
      <div className="mx-auto grid max-w-7xl items-center gap-4 px-4 py-4 md:grid-cols-[1fr_auto_1fr] md:px-6">
        <div className="flex items-center gap-3">
          <Link href={`/${locale}`} className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Ordofinder"
              width={36}
              height={36}
              priority
              className="rounded-md"
            />
            <span className="font-headline text-xl text-on-surface">Ordofinder</span>
            <span className="hidden font-mono text-[11px] uppercase tracking-[0.12em] text-outline md:inline-flex">
              Archive
            </span>
          </Link>
        </div>
        <nav className="hidden items-center justify-center gap-7 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={NAV_LINK}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center justify-end gap-4 md:flex">
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-outline">
            {landing("edition")}
          </span>
          <LocaleSwitch locale={locale} alternate={alternateLocale} />
          <Link href={workspaceHref}>
            <Chip>{workspaceLabel}</Chip>
          </Link>
        </div>

        <div className="flex justify-end md:hidden">
          <MobileMenu
            locale={locale}
            alternateLocale={alternateLocale}
            navItems={navItems}
            workspaceHref={workspaceHref}
            workspaceLabel={workspaceLabel}
            edition={landing("edition")}
          />
        </div>
      </div>
    </header>
  );
}
