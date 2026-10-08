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

export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, isDark, () => false);

  return (
    <Button
      type="button"
      variant="outline"
      aria-label={dark ? "Passer en mode clair" : "Passer en mode sombre"}
      onClick={() => applyTheme(!dark)}
      className="h-9 rounded-full border-border bg-card px-3 text-[13px] text-foreground"
    >
      {dark ? <Sun /> : <Moon />}
      {dark ? "Clair" : "Sombre"}
    </Button>
  );
}
