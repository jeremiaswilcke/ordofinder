import { redirect } from "next/navigation";
import { InviteCreateForm } from "@/components/forms/InviteCreateForm";
import { getCurrentProfile } from "@/lib/auth";
import { getReviewerDashboardData } from "@/lib/dashboard";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function ReviewerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const profile = await getCurrentProfile();
  if (!profile?.role || !["reviewer", "regional_admin", "global_admin"].includes(profile.role)) {
    redirect(`/${locale}/login`);
  }

  const data = await getReviewerDashboardData();

  return (
    <div className="space-y-6">
      <section className="rounded-lg bg-surface-container-low p-8">
        <p className="text-[10px] uppercase tracking-[0.2em] text-outline">Reviewer Dashboard</p>
        <h1 className="mt-4 font-headline text-5xl text-primary">Regional Queue</h1>
        <p className="mt-4 text-lg leading-relaxed text-on-surface-variant">
          Review churches in your assigned territories, watch your invite tree, and keep the archive trustworthy.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-surface-container-lowest p-6 shadow-archival">
          <p className="text-[10px] uppercase tracking-[0.2em] text-outline">Queue</p>
          <p className="mt-3 font-headline text-4xl text-primary">{data.queue.length}</p>
        </div>
        <div className="rounded-lg bg-surface-container-lowest p-6 shadow-archival">
          <p className="text-[10px] uppercase tracking-[0.2em] text-outline">My Ratings</p>
          <p className="mt-3 font-headline text-4xl text-primary">{data.myRatings}</p>
        </div>
        <div className="rounded-lg bg-surface-container-lowest p-6 shadow-archival">
          <p className="text-[10px] uppercase tracking-[0.2em] text-outline">Invites Remaining</p>
          <p className="mt-3 font-headline text-4xl text-primary">{data.myInvitesRemaining}</p>
        </div>
        <div className="rounded-lg bg-surface-container-lowest p-6 shadow-archival">
          <p className="text-[10px] uppercase tracking-[0.2em] text-outline">Invite Tree</p>
          <p className="mt-3 font-headline text-4xl text-primary">{data.inviteTreeCount}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="rounded-lg bg-surface-container-low p-6">
          <p className="text-[10px] uppercase tracking-[0.2em] text-outline">My Regions</p>
          <div className="mt-4 space-y-2">
            {data.myRegions.map((region) => (
              <div key={region} className="rounded bg-surface-container-lowest px-4 py-3 text-sm text-on-surface shadow-archival">
                {region}
              </div>
            ))}
          </div>
        </aside>
        <section className="rounded-lg bg-surface-container-low p-6">
          <p className="text-[10px] uppercase tracking-[0.2em] text-outline">Pending Archive Items</p>
          <div className="mt-4 space-y-3">
            {data.queue.map((item) => (
              <article key={item.id} className="rounded-lg bg-surface-container-lowest p-5 shadow-archival">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-headline text-2xl text-primary">{item.name}</h2>
                    <p className="mt-1 text-sm text-on-surface-variant">
                      {item.city} · {item.countryCode} · {item.region}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-outline">{item.status.replaceAll("_", " ")}</p>
                    <p className="mt-2 text-sm text-on-surface-variant">{formatDate(item.submittedAt)}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="rounded-lg bg-surface-container-low p-6">
          <p className="text-[10px] uppercase tracking-[0.2em] text-outline">Recent Invites</p>
          <div className="mt-4 space-y-3">
            {data.recentInvites.length ? data.recentInvites.map((invite) => (
              <article key={invite.id} className="rounded-lg bg-surface-container-lowest p-5 shadow-archival">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-medium text-on-surface">{invite.email}</h2>
                    <p className="mt-1 text-sm text-on-surface-variant">
                      {invite.regionLabel} · {invite.role.replaceAll("_", " ")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-outline">
                      {invite.redeemedAt ? "Redeemed" : "Pending"}
                    </p>
                    <p className="mt-2 text-sm text-on-surface-variant">{formatDate(invite.createdAt)}</p>
                  </div>
                </div>
              </article>
            )) : (
              <div className="rounded-lg bg-surface-container-lowest p-5 text-sm text-on-surface-variant shadow-archival">
                No recent invites yet.
              </div>
            )}
          </div>
        </section>
        <InviteCreateForm />
      </div>
    </div>
  );
}
