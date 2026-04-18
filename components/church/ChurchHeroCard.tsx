import Image from "next/image";
import type { Church } from "@/lib/types";
import { Chip } from "../ui/Chip";

export function ChurchHeroCard({ church }: { church: Church }) {
  return (
    <section className="grid gap-4 md:grid-cols-12">
      <div className="relative overflow-hidden rounded-xl md:col-span-5">
        {church.heroImageUrl ? (
          <Image
            src={church.heroImageUrl}
            alt={church.name}
            width={900}
            height={1100}
            className="h-full w-full object-cover grayscale-[0.35]"
          />
        ) : null}
        <div className="absolute bottom-4 left-4 max-w-xs rounded-lg bg-white/85 p-4 backdrop-blur">
          <p className="mb-1 text-[10px] uppercase tracking-widest text-outline">Architect&apos;s Note</p>
          <p className="font-headline text-xl text-primary">{church.architecturalStyle?.replaceAll("_", " ")}</p>
          <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
            Consecrated {church.consecrationYear}, capacity {church.capacity?.toLocaleString()}.
          </p>
        </div>
      </div>
      <div className="flex flex-col justify-between rounded-lg bg-surface-container-low p-8 md:col-span-7">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-outline">{church.diocese}</p>
          <h1 className="mt-3 font-headline text-5xl font-bold text-primary md:text-7xl">{church.name}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-on-surface-variant">{church.description}</p>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {church.tags.map((tag) => (
            <Chip key={tag}>{tag.replaceAll("_", " ")}</Chip>
          ))}
        </div>
      </div>
    </section>
  );
}
