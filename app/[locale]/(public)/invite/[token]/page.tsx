import { getInvitePreview } from "@/lib/invites";

export default async function InvitePage({
  params
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const invite = await getInvitePreview(token);

  return (
    <section className="mx-auto max-w-2xl rounded-lg bg-surface-container-low p-8">
      <p className="text-[10px] uppercase tracking-[0.2em] text-outline">Invite Redemption</p>
      <h1 className="mt-4 font-headline text-5xl text-primary">Reviewer Access</h1>
      <p className="mt-4 text-lg leading-relaxed text-on-surface-variant">
        Invite tokens are region-scoped and reviewer-led. This preview shows the role and geography attached before the full redemption flow is activated.
      </p>
      <div className="mt-8 grid gap-4 rounded bg-surface-container-lowest p-6 text-sm text-on-surface-variant shadow-archival md:grid-cols-2">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-outline">Email</p>
          <p className="mt-2 font-medium text-on-surface">{invite.email || "Unknown invite"}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-outline">Role</p>
          <p className="mt-2 font-medium capitalize text-on-surface">{invite.role.replaceAll("_", " ")}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-outline">Region</p>
          <p className="mt-2 font-medium text-on-surface">{invite.regionLabel}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-outline">Status</p>
          <p className="mt-2 font-medium capitalize text-on-surface">{invite.status.replaceAll("_", " ")}</p>
        </div>
      </div>
      <div className="mt-6 rounded border border-outline-variant/30 bg-surface-container-lowest p-4 text-sm text-on-surface-variant">
        <p className="text-[10px] uppercase tracking-[0.2em] text-outline">Raw token</p>
        <p className="mt-2 break-all">{token}</p>
      </div>
    </section>
  );
}
