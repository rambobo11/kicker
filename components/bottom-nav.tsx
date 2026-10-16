"use client";

import { Inbox, Lock, RefreshCcw, Star, Zap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "cn";

const items = [
  { href: "/", short: "Start", label: "Start", icon: Star, iconClass: "text-[#c4922a]" },
  { href: "/brain", short: "Brain", label: "Brain dump", icon: Inbox, iconClass: "text-[#3b7fc4]" },
  { href: "/quick-wins", short: "Wins", label: "Quick wins", icon: Zap, iconClass: "text-[#3d8f62]" },
  { href: "/routines", short: "Routines", label: "Routines", icon: RefreshCcw, iconClass: "text-[#6d8a45]" },
];

function useActiveHref() {
  const pathname = usePathname();
  return (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
}

export function SideNav() {
  const isActive = useActiveHref();

  return (
    <aside className="hidden h-dvh flex-col bg-sidebar text-sidebar-foreground lg:flex">
      <nav className="flex flex-1 flex-col gap-0.5 px-3 pt-4" aria-label="Sections">
        {items.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-8 items-center gap-2.5 rounded-lg px-2 text-[14px] transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/70",
              )}
            >
              <Icon className={cn("size-4 shrink-0", item.iconClass)} strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="flex items-center justify-between border-t border-sidebar-border px-2 py-2">
        <ThemeToggle variant="bar" />
        <form action={logout}>
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            aria-label="Verrouiller"
            className="size-8 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <Lock className="size-4" />
          </Button>
        </form>
      </div>
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
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] tracking-tight transition-colors",
                active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <Icon className={cn("size-5", active ? "stroke-[2.25]" : "stroke-[1.75]")} />
              {item.short}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
