import { getTranslations } from "next-intl/server";
import { SubmissionForm } from "@/components/forms/SubmissionForm";

export default async function SubmitPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "submit" });

  return (
    <div className="space-y-10">
      <section className="border-b border-on-surface pb-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-outline">Registry Entry</p>
        <div className="mt-5 grid gap-8 md:grid-cols-[1.5fr_0.9fr] md:items-end">
          <div>
            <h1 className="max-w-3xl font-headline text-5xl font-bold leading-[0.96] text-primary md:text-7xl">
              {t("title")}
            </h1>
          </div>
          <p className="max-w-xl border-l-2 border-primary/10 pl-6 text-lg leading-relaxed text-on-surface-variant">
            {t("subtitle")}
          </p>
        </div>
      </section>
      <div>
        <p className="font-headline text-xl italic text-on-surface-variant">
          The archive is not kept by editors alone. Every sincere submission deserves careful review.
        </p>
      </div>
      <SubmissionForm />
    </div>
  );
}
