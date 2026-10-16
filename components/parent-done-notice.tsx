"use client";

import { useEffect, useRef } from "react";

export function ParentDoneNotice({
  parent,
  onUndo,
  onDismiss,
}: {
  parent: { id: string; title: string } | null;
  onUndo: () => void;
  onDismiss: () => void;
}) {
  const dismissRef = useRef(onDismiss);
  dismissRef.current = onDismiss;

  useEffect(() => {
    if (!parent) return;
    const timer = window.setTimeout(() => dismissRef.current(), 7000);
    return () => window.clearTimeout(timer);
  }, [parent]);

  if (!parent) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-4 z-30 mx-auto flex max-w-md items-center justify-between gap-4 rounded-2xl bg-card px-4 py-3 ring-1 ring-border bottom-[max(5.75rem,env(safe-area-inset-bottom))] lg:bottom-6"
    >
      <p className="text-[14px] leading-snug">
        <span className="text-muted-foreground">Les petits pas sont faits. </span>
        {parent.title} est terminé.
      </p>
      <button type="button" onClick={onUndo} className="shrink-0 text-[13px] text-muted-foreground">
        Annuler
      </button>
    </div>
  );
}
