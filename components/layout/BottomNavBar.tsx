import Link from "next/link";
import { Icon } from "../ui/Icon";

const items = [
  { href: "", icon: "church", label: "Archive" },
  { href: "/cities", icon: "search", label: "Cities" },
  { href: "/map", icon: "map", label: "Map" },
  { href: "/submit", icon: "add_circle", label: "Submit" },
];

export function BottomNavBar({ locale }: { locale: string }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-outline-variant/50 bg-surface-container-lowest md:hidden">
      <div className="grid grid-cols-4">
        {items.map((item) => (
          <Link
            key={item.href}
            href={`/${locale}${item.href}`}
            className="flex flex-col items-center gap-1 py-3 text-[10px] uppercase tracking-widest text-on-surface-variant"
          >
            <Icon name={item.icon} filled={item.icon === "church"} />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
