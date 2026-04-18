import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getCurrentProfile, isReviewerOrHigher } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/env";
import { getChurchScheduleBySlug } from "@/lib/schedules";
import { ScheduleEditor } from "@/components/church/ScheduleEditor";

export default async function ChurchSchedulePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "schedule" });

  if (!hasSupabaseEnv()) {
    return (
      <section className="mx-auto max-w-2xl rounded-lg bg-surface-container-low p-8">
        <h1 className="font-headline text-3xl text-primary">
          Supabase not configured
        </h1>
      </section>
    );
  }

  const profile = await getCurrentProfile();
  if (!profile) redirect(`/${locale}/login`);
  if (!profile.role) redirect(`/${locale}/apply`);
  if (!isReviewerOrHigher(profile.role)) {
    redirect(`/${locale}`);
  }

  const schedule = await getChurchScheduleBySlug(slug);
  if (!schedule) notFound();

  const canDeleteAny =
    profile.role === "senior_reviewer" ||
    profile.role === "regional_admin" ||
    profile.role === "global_admin";

  return (
    <div className="space-y-8">
      <section className="rounded-lg bg-surface-container-low p-8">
        <p className="text-[10px] uppercase tracking-[0.2em] text-outline">
          {t("eyebrow")}
        </p>
        <h1 className="mt-4 font-headline text-5xl text-primary">
          {schedule.churchName}
        </h1>
        <p className="mt-2 text-on-surface-variant">{schedule.city}</p>
        <p className="mt-4 max-w-2xl text-on-surface-variant">
          {t("leadAbove")}
        </p>
        <div className="mt-4 flex gap-3 text-sm">
          <Link
            href={`/${locale}/church/${slug}`}
            className="text-primary hover:underline"
          >
            {t("backToPublic")}
          </Link>
        </div>
      </section>

      <section className="rounded-lg bg-surface-container-lowest p-6 md:p-8">
        <ScheduleEditor
          churchId={schedule.churchId}
          initialMasses={schedule.masses}
          initialConfessions={schedule.confessions}
          currentUserId={profile.userId}
          canDeleteAny={canDeleteAny}
        />
      </section>
    </div>
  );
}
