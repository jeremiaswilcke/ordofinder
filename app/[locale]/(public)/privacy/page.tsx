import { getTranslations } from "next-intl/server";

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy" });

  const sections = [
    "controller",
    "processing",
    "cookies",
    "supabase",
    "rights",
    "retention",
    "contact",
  ] as const;

  return (
    <article className="mx-auto max-w-2xl space-y-10 py-4">
      <header className="space-y-3">
        <p className="text-[10px] uppercase tracking-[0.2em] text-outline">{t("eyebrow")}</p>
        <h1 className="font-headline text-4xl leading-[1.05] tracking-[-0.01em] text-primary md:text-5xl">
          {t("title")}
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-on-surface-variant">{t("lead")}</p>
      </header>

      {sections.map((key) => (
        <section key={key} className="space-y-2 text-sm leading-relaxed text-on-surface-variant">
          <h2 className="text-[10px] uppercase tracking-[0.14em] text-outline">
            {t(`${key}.heading`)}
          </h2>
          <p className="text-on-surface">{t(`${key}.body`)}</p>
        </section>
      ))}

      <section className="space-y-2 text-sm leading-relaxed text-on-surface">
        <h2 className="text-[10px] uppercase tracking-[0.14em] text-outline">{t("controllerAddressHeading")}</h2>
        <p className="font-medium text-primary">Jeremias C. Wilcke</p>
        <p>Grenzgasse 4, 3001 Mauerbach</p>
        <p>
          <a className="underline" href="mailto:jeremias@wilckeweb.org">
            jeremias@wilckeweb.org
          </a>
        </p>
      </section>
    </article>
  );
}
