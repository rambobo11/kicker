"use client";

import { Inbox, Play, RefreshCcw, Zap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";

const items = [
  { href: "/", label: "Start", icon: Play },
  { href: "/brain", label: "Brain", icon: Inbox },
  { href: "/quick-wins", label: "Wins", icon: Zap },
  { href: "/routines", label: "Routines", icon: RefreshCcw },
];

function useActiveHref() {
  const pathname = usePathname();
  return (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
}

export function SideNav() {
  const isActive = useActiveHref();

  return (
    <aside className="sticky top-0 hidden h-dvh flex-col border-r border-border px-4 py-8 lg:flex">
      <p className="px-3 text-[13px] tracking-[0.18em] text-muted-foreground uppercase">Kicker</p>
      <nav className="mt-8 flex flex-col gap-1" aria-label="Sections">
        {items.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[15px] transition-colors",
                active ? "bg-card text-foreground" : "text-muted-foreground",
              )}
            >
              <Icon className={cn("size-5", active ? "stroke-[2.25]" : "stroke-[1.75]")} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function BottomNav() {
  const isActive = useActiveHref();

  return (
    <nav
      aria-label="Sections"
      className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-lg border-t border-border bg-background/90 backdrop-blur-xl lg:hidden"
    >
      <div className="grid grid-cols-4 px-2 pt-1.5 pb-[max(0.7rem,env(safe-area-inset-bottom))]">
        {items.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] tracking-tight transition-colors",
                active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <Icon className={cn("size-5", active ? "stroke-[2.25]" : "stroke-[1.75]")} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
