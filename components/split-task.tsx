"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { splitTask } from "@/app/actions/tasks";
import { Input } from "@/components/ui/input";
import { cn } from "cn";

const PLACEHOLDERS = ["Le premier petit pas", "Ensuite", "Un troisième, si tu veux"];

export function SplitTask({ taskId, openSignal = 0 }: { taskId: string; openSignal?: number }) {
  const [open, setOpen] = useState(false);
  const [steps, setSteps] = useState(["", "", ""]);
  const [pending, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);
  const firstRef = useRef<HTMLInputElement>(null);
  const ready = steps.filter((step) => step.trim().length > 0).length >= 2;

  useEffect(() => {
    if (!openSignal) return;
    if (!rootRef.current || rootRef.current.getClientRects().length === 0) return;
    setOpen(true);
  }, [openSignal]);

  useEffect(() => {
    if (!open) return;
    firstRef.current?.focus();
  }, [open, openSignal]);

  function submit() {
    if (!ready) return;
    const titles = steps.map((step) => step.trim()).filter((step) => step.length > 0);
    startTransition(async () => {
      await splitTask({ parentId: taskId, titles });
      setSteps(["", "", ""]);
      setOpen(false);
    });
  }

  if (!open) {
    return (
      <div ref={rootRef}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-[13px] text-muted-foreground"
        >
          Découper
        </button>
      </div>
    );
  }

  return (
    <div ref={rootRef}>
    <form
      className="flex flex-col gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      {steps.map((step, index) => (
        <Input
          key={PLACEHOLDERS[index]}
          value={step}
          onChange={(event) =>
            setSteps((current) =>
              current.map((value, itemIndex) => (itemIndex === index ? event.target.value : value)),
            )
          }
          ref={index === 0 ? firstRef : undefined}
          placeholder={PLACEHOLDERS[index]}
          aria-label={PLACEHOLDERS[index]}
          maxLength={180}
          className="h-11 rounded-2xl border-border bg-card px-3.5 text-[15px] shadow-none"
        />
      ))}
      <div className="mt-1 flex items-center gap-3">
        <button
          type="submit"
          disabled={pending || !ready}
          className={cn(
            "h-10 rounded-full px-4 text-[14px] text-background",
            ready && !pending ? "bg-foreground" : "bg-muted",
          )}
        >
          Créer les petits pas
        </button>
        <button
          type="button"
          onClick={() => {
            setSteps(["", "", ""]);
            setOpen(false);
          }}
          className="text-[13px] text-muted-foreground"
        >
          Annuler
        </button>
      </div>
    </form>
    </div>
  );
}
