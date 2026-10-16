"use client";

import { useSyncExternalStore } from "react";
import { cn } from "cn";

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
  const onBar = variant === "bar";

  return (
    <div className="flex items-center gap-3" role="radiogroup" aria-label="Apparence">
      <button
        type="button"
        role="radio"
        aria-checked={!dark}
        onClick={() => applyTheme(false)}
        className={cn(
          "text-[13px]",
          !dark
            ? onBar
              ? "text-sidebar-foreground"
              : "text-foreground"
            : onBar
              ? "text-sidebar-foreground/45"
              : "text-muted-foreground",
        )}
      >
        Clair
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={dark}
        onClick={() => applyTheme(true)}
        className={cn(
          "text-[13px]",
          dark
            ? onBar
              ? "text-sidebar-foreground"
              : "text-foreground"
            : onBar
              ? "text-sidebar-foreground/45"
              : "text-muted-foreground",
        )}
      >
        Sombre
      </button>
    </div>
  );
}
