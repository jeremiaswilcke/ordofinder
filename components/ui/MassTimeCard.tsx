type MassTimeCardProps = {
  weekday: string;
  time: string;
  label?: string;
};

export function MassTimeCard({ weekday, time, label }: MassTimeCardProps) {
  return (
    <div className="border-b-2 border-primary/20 bg-surface-container-lowest p-3">
      <span className="mb-1 block text-xs text-outline">{weekday}</span>
      <span className="block font-headline text-lg text-primary">{time}</span>
      {label ? <span className="mt-1 block text-[10px] uppercase tracking-widest text-on-surface-variant">{label}</span> : null}
    </div>
  );
}
