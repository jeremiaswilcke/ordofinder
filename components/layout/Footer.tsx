import Link from "next/link";

export function Footer({ locale }: { locale: string }) {
  return (
    <footer className="mt-24 border-t border-outline bg-background pb-24 pt-12 md:pb-16">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 md:grid-cols-[2fr_1fr_1fr_1fr] md:px-6">
        <div>
          <p className="font-headline text-2xl text-primary">Ordofinder Archive</p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-on-surface-variant">
            A living index of worthy Catholic celebrations, ordered by city, editorially framed and sustained by careful stewards.
          </p>
          <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.12em] text-outline">
            Imprimatur granted · Volume IV · Spring MMXXVI
          </p>
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-on-surface-variant">Archive</p>
          <div className="mt-4 grid gap-2 text-sm text-on-surface-variant">
            <Link href={`/${locale}/cities`}>All cities</Link>
            <Link href={`/${locale}/map`}>Map</Link>
            <Link href={`/${locale}`}>Index</Link>
            <Link href={`/${locale}/submit`}>Calendar</Link>
          </div>
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-on-surface-variant">Contribute</p>
          <div className="mt-4 grid gap-2 text-sm text-on-surface-variant">
            <Link href={`/${locale}/submit`}>Submit a church</Link>
            <Link href={`/${locale}/login`}>Invite access</Link>
            <Link href={`/${locale}/submit`}>Guidelines</Link>
            <Link href={`/${locale}/cities`}>Architect&apos;s note</Link>
          </div>
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-on-surface-variant">House</p>
          <div className="mt-4 grid gap-2 text-sm text-on-surface-variant">
            <Link href={`/${locale}`}>About the archive</Link>
            <Link href={`/${locale}/reviewer`}>Editorial desk</Link>
            <Link href={`/${locale}/submit`}>Contact</Link>
            <Link href={`/${locale}`}>Imprint</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
