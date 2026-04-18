import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import {
  getModerationQueueForCurrentUser,
  listAllProfiles,
} from "@/lib/moderation";
import { ModerationQueue } from "@/components/moderation/ModerationQueue";
import { RoleManager } from "@/components/moderation/RoleManager";
import { signOut } from "@/app/[locale]/(auth)/login/actions";

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const profile = await getCurrentProfile();
  if (!profile) redirect(`/${locale}/login`);
  if (!profile.role || !["regional_admin", "global_admin"].includes(profile.role)) {
    redirect(`/${locale}`);
  }

  const [items, profiles] = await Promise.all([
    getModerationQueueForCurrentUser(200),
    listAllProfiles(),
  ]);

  return (
    <div className="space-y-6">
      <section className="rounded-lg bg-surface-container-low p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-outline">
              Admin Dashboard
            </p>
            <h1 className="mt-4 font-headline text-5xl text-primary">
              Stewardship
            </h1>
            <p className="mt-4 max-w-2xl text-on-surface-variant">
              Moderations-Queue über das gesamte Archiv, Bewerbungen und
              Rollenverwaltung.
            </p>
          </div>
          <form action={signOut}>
            <input type="hidden" name="locale" value={locale} />
            <button className="rounded border border-outline/60 bg-surface px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-on-surface hover:border-primary hover:text-primary">
              Abmelden
            </button>
          </form>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Queue" value={items.length} />
        <Stat
          label="Profile gesamt"
          value={profiles.length}
        />
        <Stat
          label="Reviewer"
          value={profiles.filter((p) => p.role === "reviewer").length}
        />
        <Stat
          label="Senior / Admin"
          value={
            profiles.filter(
              (p) =>
                p.role === "senior_reviewer" ||
                p.role === "regional_admin" ||
                p.role === "global_admin"
            ).length
          }
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="rounded-lg bg-surface-container-low p-6">
          <p className="text-[10px] uppercase tracking-[0.2em] text-outline">
            Moderations-Queue
          </p>
          <div className="mt-4">
            <ModerationQueue
              initialItems={items}
              currentUserId={profile.userId}
              canDecideApplications
            />
          </div>
        </section>
        <aside className="rounded-lg bg-surface-container-low p-6">
          <p className="text-[10px] uppercase tracking-[0.2em] text-outline">
            Rollen verwalten
          </p>
          <div className="mt-4">
            <RoleManager
              initialProfiles={profiles}
              actorRole={profile.role}
              actorUserId={profile.userId}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-lg bg-surface-container-lowest p-6 shadow-archival">
      <p className="text-[10px] uppercase tracking-[0.2em] text-outline">
        {label}
      </p>
      <p className="mt-3 font-headline text-3xl text-primary">{value}</p>
    </div>
  );
}
