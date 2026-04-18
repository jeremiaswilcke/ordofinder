import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="h-px w-8 bg-outline-variant" />
      <div>
        <h3 className="font-headline text-2xl text-primary">{title}</h3>
        <p className="text-sm text-on-surface-variant">{subtitle}</p>
      </div>
    </div>
  );
}

export function SubmissionForm() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <form className="space-y-8 rounded-lg bg-surface-container-low p-8">
        <section>
          <SectionTitle title="Identity & Location" subtitle="Canonical name, city entry-point and precise coordinates." />
          <div className="grid gap-4 md:grid-cols-2">
            <input className="rounded-lg border-outline-variant bg-surface-container-lowest" placeholder="Church name" />
            <input className="rounded-lg border-outline-variant bg-surface-container-lowest" placeholder="City" />
            <input className="rounded-lg border-outline-variant bg-surface-container-lowest" placeholder="Country code" />
            <input className="rounded-lg border-outline-variant bg-surface-container-lowest" placeholder="Timezone" />
          </div>
        </section>
        <section>
          <SectionTitle title="Lebendigkeit des Glaubens" subtitle="Observed rhythm, catechesis, youth presence and communal strength." />
          <div className="grid gap-4 md:grid-cols-2">
            <input className="rounded-lg border-outline-variant bg-surface-container-lowest" placeholder="Liturgy quality (1-10)" />
            <input className="rounded-lg border-outline-variant bg-surface-container-lowest" placeholder="Music (1-10)" />
            <input className="rounded-lg border-outline-variant bg-surface-container-lowest" placeholder="Homily clarity (1-10)" />
            <input className="rounded-lg border-outline-variant bg-surface-container-lowest" placeholder="Vibrancy (1-10)" />
          </div>
        </section>
        <section>
          <SectionTitle title="Architectural Metadata" subtitle="Diocese, capacity, style and a short archival note." />
          <div className="grid gap-4 md:grid-cols-2">
            <input className="rounded-lg border-outline-variant bg-surface-container-lowest" placeholder="Diocese" />
            <input className="rounded-lg border-outline-variant bg-surface-container-lowest" placeholder="Consecration year" />
            <input className="rounded-lg border-outline-variant bg-surface-container-lowest" placeholder="Architectural style" />
            <input className="rounded-lg border-outline-variant bg-surface-container-lowest" placeholder="Capacity" />
          </div>
          <textarea className="mt-4 min-h-32 w-full rounded-lg border-outline-variant bg-surface-container-lowest" placeholder="Short note or editorial description" />
        </section>
        <Button className="w-full">Submit for Review</Button>
      </form>
      <aside className="h-fit rounded-lg bg-surface-container-lowest p-6 shadow-archival lg:sticky lg:top-24">
        <p className="text-[10px] uppercase tracking-[0.2em] text-outline">Submission Guidelines</p>
        <div className="mt-5 space-y-5">
          <div className="flex gap-3">
            <Icon name="verified_user" className="text-primary" />
            <p className="text-sm text-on-surface-variant">Prefer verifiable schedules, diocesan naming and canonical parish titles.</p>
          </div>
          <div className="flex gap-3">
            <Icon name="photo_library" className="text-primary" />
            <p className="text-sm text-on-surface-variant">Hero images should come from trusted archives or moderated uploads.</p>
          </div>
          <div className="flex gap-3">
            <Icon name="local_library" className="text-primary" />
            <p className="text-sm text-on-surface-variant">Write editorially, not polemically; describe what is reliably observed.</p>
          </div>
        </div>
      </aside>
    </div>
  );
}
