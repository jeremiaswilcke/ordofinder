import Link from "next/link";
import { getTranslations } from "next-intl/server";

export async function Footer({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "footer" });

  return (
    <footer className="mt-24 border-t border-outline bg-background pb-24 pt-12 md:pb-16">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 md:grid-cols-[2fr_1fr_1fr_1fr] md:px-6">
        <div>
          <p className="font-headline text-2xl text-primary">{t("brandTitle")}</p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-on-surface-variant">
            {t("brandLead")}
          </p>
          <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.12em] text-outline">
            {t("imprint")}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-on-surface-variant">
            {t("sectionArchive")}
          </p>
          <div className="mt-4 grid gap-2 text-sm text-on-surface-variant">
            <Link href={`/${locale}/cities`}>{t("navAllCities")}</Link>
            <Link href={`/${locale}/map`}>{t("navMap")}</Link>
            <Link href={`/${locale}`}>{t("navIndex")}</Link>
            <Link href={`/${locale}/nearby`}>{t("navCalendar")}</Link>
          </div>
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-on-surface-variant">
            {t("sectionContribute")}
          </p>
          <div className="mt-4 grid gap-2 text-sm text-on-surface-variant">
            <Link href={`/${locale}/submit`}>{t("navSubmit")}</Link>
            <Link href={`/${locale}/login`}>{t("navInvite")}</Link>
            <Link href={`/${locale}/apply`}>{t("navGuidelines")}</Link>
            <Link href={`/${locale}`}>{t("navArchitectsNote")}</Link>
          </div>
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-on-surface-variant">
            {t("sectionHouse")}
          </p>
          <div className="mt-4 grid gap-2 text-sm text-on-surface-variant">
            <Link href={`/${locale}`}>{t("navAbout")}</Link>
            <Link href={`/${locale}/reviewer`}>{t("navEditorial")}</Link>
            <Link href={`/${locale}/admin`}>{t("navContact")}</Link>
            <Link href={`/${locale}`}>{t("navImprint")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
