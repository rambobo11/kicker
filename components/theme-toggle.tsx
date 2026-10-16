"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "kicker-theme";

function subscribe(onStoreChange: () => void) {
  window.addEventListener("kicker-theme", onStoreChange);
  return () => window.removeEventListener("kicker-theme", onStoreChange);
}

function isDark() {
  return document.documentElement.classList.contains("dark");
}

function applyTheme(dark: boolean) {
  document.documentElement.classList.toggle("dark", dark);
  localStorage.setItem(STORAGE_KEY, dark ? "dark" : "light");
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", dark ? "#2a241f" : "#f6f4f0");
  window.dispatchEvent(new Event("kicker-theme"));
}

export function ThemeToggle({ variant = "pill" }: { variant?: "pill" | "bar" }) {
  const dark = useSyncExternalStore(subscribe, isDark, () => false);
  const label = dark ? "Passer en mode clair" : "Passer en mode sombre";

  if (variant === "bar") {
    return (
      <button
        type="button"
        aria-label={label}
        onClick={() => applyTheme(!dark)}
        className="flex h-8 items-center gap-2 rounded-lg px-2 text-[13px] text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      >
        {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        {dark ? "Clair" : "Sombre"}
      </button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      aria-label={label}
      onClick={() => applyTheme(!dark)}
      className="h-9 rounded-full border-border bg-card px-3 text-[13px] text-foreground"
    >
      {dark ? <Sun /> : <Moon />}
      {dark ? "Clair" : "Sombre"}
    </Button>
  );
}
