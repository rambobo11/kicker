"use client";

import { useSyncExternalStore } from "react";
import type { Category } from "@/lib/categories";
import { cn } from "cn";

const STORAGE_KEY = "kicker-travel";
const EVENT = "kicker-travel";

function subscribe(onStoreChange: () => void) {
  window.addEventListener(EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function readTravel() {
  return localStorage.getItem(STORAGE_KEY) === "1";
}

function setTravel(on: boolean) {
  localStorage.setItem(STORAGE_KEY, on ? "1" : "0");
  window.dispatchEvent(new Event(EVENT));
}

export function useTravelMode() {
  return useSyncExternalStore(subscribe, readTravel, () => false);
}

export function isApartmentPaused(category: Category, traveling: boolean) {
  return traveling && category === "Base Camp";
}

export function TravelToggle() {
  const on = useTravelMode();

  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => setTravel(!on)}
      className={cn("text-[13px]", on ? "text-foreground" : "text-muted-foreground")}
    >
      Voyage
    </button>
  );
}
