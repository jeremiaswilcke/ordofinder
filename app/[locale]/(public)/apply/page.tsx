import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ApplicationForm } from "@/components/forms/ApplicationForm";
import { getCurrentProfile } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/env";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

type PendingApp = {
  id: string;
  display_name: string;
  created_at: string;
};

async function getPendingApplication(
  userId: string
): Promise<PendingApp | null> {
  if (!hasSupabaseEnv()) return null;
  const supabase = createAdminSupabaseClient();
  const { data } = await supabase
    .from("reviewer_applications")
    .select("id, display_name, created_at")
    .eq("user_id", userId)
    .eq("status", "pending")
    .limit(1)
    .maybeSingle();
  return (data as PendingApp | null) ?? null;
}

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "apply" });

  if (!hasSupabaseEnv()) {
    return (
      <section className="mx-auto max-w-2xl rounded-lg bg-surface-container-low p-8">
        <h1 className="font-headline text-4xl text-primary">
          Supabase not configured
        </h1>
      </section>
    );
  }

  const profile = await getCurrentProfile();
  if (!profile) {
    redirect(`/${locale}/login?mode=signup`);
  }

  if (profile.role) {
    const target =
      profile.role === "global_admin" || profile.role === "regional_admin"
        ? `/${locale}/admin`
        : `/${locale}/reviewer`;
    redirect(target);
  }

  const pending = await getPendingApplication(profile.userId);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="rounded-lg bg-surface-container-low p-8">
        <p className="text-[10px] uppercase tracking-[0.2em] text-outline">
          {t("eyebrow")}
        </p>
        <h1 className="mt-4 font-headline text-5xl text-primary">
          {t("heading")}
        </h1>
        <p className="mt-4 max-w-2xl text-on-surface-variant">{t("lead")}</p>
      </header>

      {pending ? (
        <section className="rounded-lg border border-outline-variant/40 bg-surface-container-lowest p-8">
          <p className="text-[10px] uppercase tracking-[0.2em] text-outline">
            {t("pendingStatus")}
          </p>
          <h2 className="mt-4 font-headline text-3xl text-primary">
            {t("pendingHeading")}
          </h2>
          <p className="mt-4 text-on-surface-variant">
            {t("pendingBody", {
              date: new Intl.DateTimeFormat(
                locale === "de" ? "de-AT" : "en-GB",
                { dateStyle: "long" }
              ).format(new Date(pending.created_at)),
            })}
          </p>
        </section>
      ) : (
        <section className="rounded-lg border border-outline-variant/40 bg-surface-container-lowest p-8">
          <ApplicationForm
            defaultDisplayName={profile.displayName ?? ""}
            locale={locale}
            onSuccessHref={`/${locale}/apply`}
          />
        </section>
      )}
    </div>
  );
}
