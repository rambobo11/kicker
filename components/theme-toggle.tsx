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
      variant="ghost"
      size="icon"
      aria-label={dark ? "Mode clair" : "Mode sombre"}
      onClick={() => applyTheme(!dark)}
      className="text-muted-foreground"
    >
      {dark ? <Sun /> : <Moon />}
    </Button>
  );
}
