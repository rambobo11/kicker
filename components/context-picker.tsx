"use client";

import { useSyncExternalStore } from "react";
import type { Category } from "@/lib/categories";
import { cn } from "cn";

const STORAGE_KEY = "kicker-context";
const EVENT = "kicker-context";

export type StartContext = "all" | "pro" | "perso";

const OPTIONS: { id: StartContext; label: string }[] = [
  { id: "all", label: "Tout" },
  { id: "pro", label: "Pro" },
  { id: "perso", label: "Perso" },
];

const PRO = new Set<Category>(["Engie", "ESGI"]);
const PERSO = new Set<Category>(["BBX", "Basket", "Base Camp"]);

export function inContext(category: Category, context: StartContext) {
  if (context === "pro") return PRO.has(category);
  if (context === "perso") return PERSO.has(category);
  return true;
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener(EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function readContext(): StartContext {
  const value = localStorage.getItem(STORAGE_KEY);
  if (value === "pro" || value === "perso") return value;
  return "all";
}

function selectContext(next: StartContext) {
  localStorage.setItem(STORAGE_KEY, next);
  window.dispatchEvent(new Event(EVENT));
}

export function useStartContext() {
  return useSyncExternalStore(subscribe, readContext, () => "all" as const);
}

export function ContextPicker() {
  const context = useStartContext();

  return (
    <div className="mb-6 flex items-center gap-4" role="radiogroup" aria-label="Contexte">
      {OPTIONS.map((option) => {
        const selected = context === option.id;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => selectContext(option.id)}
            className={cn("text-[13px]", selected ? "text-foreground" : "text-muted-foreground")}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
