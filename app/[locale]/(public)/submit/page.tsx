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
    <div className="space-y-6">
      <div className="max-w-3xl">
        <h1 className="font-headline text-5xl font-bold text-primary md:text-7xl">{t("title")}</h1>
        <p className="mt-4 text-lg leading-relaxed text-on-surface-variant">{t("subtitle")}</p>
      </div>
      <SubmissionForm />
    </div>
  );
}
