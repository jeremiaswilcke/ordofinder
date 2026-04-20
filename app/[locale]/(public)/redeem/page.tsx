import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AccessCodeRedeemForm } from "@/components/forms/AccessCodeRedeemForm";
import { getCurrentProfile } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/env";

export default async function RedeemPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ code?: string; error?: string }>;
}) {
  const { locale } = await params;
  const { code, error } = await searchParams;
  const t = await getTranslations({ locale, namespace: "accessCode" });

  if (hasSupabaseEnv()) {
    const profile = await getCurrentProfile();
    if (!profile) redirect(`/${locale}/login`);
  }

  return (
    <section className="mx-auto max-w-2xl space-y-6 rounded-lg bg-surface-container-low p-8">
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-outline">{t("redeemEyebrow")}</p>
        <h1 className="mt-4 font-headline text-5xl text-primary">{t("redeemHeading")}</h1>
        <p className="mt-4 text-on-surface-variant">{t("redeemLead")}</p>
      </div>
      <AccessCodeRedeemForm locale={locale} prefillCode={code ?? ""} initialError={error ?? ""} />
    </section>
  );
}
