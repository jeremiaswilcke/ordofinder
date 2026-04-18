export default async function InvitePage({
  params
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <section className="mx-auto max-w-2xl rounded-lg bg-surface-container-low p-8">
      <p className="text-[10px] uppercase tracking-[0.2em] text-outline">Invite Redemption</p>
      <h1 className="mt-4 font-headline text-5xl text-primary">Reviewer Access</h1>
      <p className="mt-4 text-lg leading-relaxed text-on-surface-variant">
        Token detected. The invite workflow will attach regional scope, reviewer role and chain metadata in the next phase.
      </p>
      <div className="mt-8 rounded bg-surface-container-lowest p-4 text-sm text-on-surface-variant shadow-archival">
        {token}
      </div>
    </section>
  );
}
