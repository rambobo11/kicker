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

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-lg border-t border-border bg-background/90 backdrop-blur-xl">
      <div className="grid grid-cols-4 px-2 pt-1.5 pb-[max(0.7rem,env(safe-area-inset-bottom))]">
        {items.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
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
