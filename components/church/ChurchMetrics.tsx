import type { Church } from "@/lib/types";
import { MetricCard } from "../ui/MetricCard";

export function ChurchMetrics({ church }: { church: Church }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard icon="auto_awesome" title="Liturgy" description="Reverence, coherence and fidelity in celebration." value={church.ratings.liturgy} />
      <MetricCard icon="library_music" title="Music" description="Choir discipline, chant, organ quality and sacred fit." value={church.ratings.music} />
      <MetricCard icon="local_library" title="Homily" description="Clarity, structure and doctrinal steadiness in preaching." value={church.ratings.homily} />
      <MetricCard icon="pulse_alert" title="Vibrancy" description="Lebendigkeit des Glaubens, youth energy and communal life." value={church.ratings.vibrancy} />
    </div>
  );
}
