export default function LoginPage() {
  return (
    <section className="mx-auto max-w-2xl rounded-lg bg-surface-container-low p-8">
      <p className="text-[10px] uppercase tracking-[0.2em] text-outline">Invite-only Access</p>
      <h1 className="mt-4 font-headline text-5xl text-primary">Reviewer Login</h1>
      <form className="mt-8 space-y-4">
        <input className="w-full rounded-lg border-outline-variant bg-surface-container-lowest" placeholder="Email" />
        <input className="w-full rounded-lg border-outline-variant bg-surface-container-lowest" type="password" placeholder="Password" />
        <button className="w-full rounded bg-primary px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-on-primary">
          Enter Archive
        </button>
      </form>
    </section>
  );
}
