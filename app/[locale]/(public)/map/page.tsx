import { ArchiveMap } from "@/components/map/ArchiveMap";

export default function MapPage() {
  return (
    <div className="space-y-6">
      <div className="max-w-3xl">
        <p className="text-[10px] uppercase tracking-[0.2em] text-outline">Global Archive</p>
        <h1 className="mt-4 font-headline text-5xl font-bold text-primary md:text-7xl">Clustered Catholic Geography</h1>
        <p className="mt-4 text-lg leading-relaxed text-on-surface-variant">
          Explore the archive through city-centered clusters and church markers with editorial density, not tourism clutter.
        </p>
      </div>
      <ArchiveMap />
    </div>
  );
}
