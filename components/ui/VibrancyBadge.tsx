import { Icon } from "./Icon";

type Props = {
  value: number;
  label: string;
  vibrancyTitle: string;
};

export function VibrancyBadge({ value, label, vibrancyTitle }: Props) {
  const filled = value >= 7.5;
  return (
    <div className="inline-flex items-center gap-2 rounded bg-surface-container-low px-3 py-2 text-[10px] uppercase tracking-widest text-on-surface-variant">
      <Icon name="pulse_alert" className="text-primary" filled={filled} />
      <span>
        {vibrancyTitle}: {label}
      </span>
    </div>
  );
}
