import { formatRatingLabel } from "@/lib/utils";
import { Icon } from "./Icon";

type MetricCardProps = {
  icon: string;
  title: string;
  description: string;
  value: number;
};

export function MetricCard({ icon, title, description, value }: MetricCardProps) {
  return (
    <div className="flex h-64 flex-col justify-between rounded-lg border-l-4 border-primary bg-surface-container-low p-8">
      <div>
        <Icon name={icon} className="mb-4 text-3xl text-primary" />
        <h3 className="mb-2 font-headline text-2xl font-bold text-primary">{title}</h3>
        <p className="text-sm leading-relaxed text-on-surface-variant">{description}</p>
      </div>
      <div className="flex items-end justify-between">
        <span className="font-headline text-4xl text-primary">{value.toFixed(1)}</span>
        <span className="text-[10px] uppercase tracking-widest text-outline">{formatRatingLabel(value)}</span>
      </div>
    </div>
  );
}
