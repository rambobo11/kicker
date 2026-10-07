"use client";

import { Plus, Zap } from "lucide-react";
import { useState, useTransition } from "react";
import { useOptimistic } from "react";
import { addTask, completeTask } from "@/app/actions";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { CATEGORIES, categoryClass, type Category } from "@/lib/categories";
import type { TaskView } from "@/lib/queries";
import { cn } from "cn";

export function TaskScreen({
  tasks,
  microMode,
  emptyTitle,
  emptyBody,
  placeholder,
}: {
  tasks: TaskView[];
  microMode: "choice" | "locked";
  emptyTitle: string;
  emptyBody: string;
  placeholder: string;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("Base Camp");
  const [isMicro, setIsMicro] = useState(microMode === "locked");
  const [pending, startTransition] = useTransition();
  const [optimisticTasks, updateTasks] = useOptimistic(
    tasks,
    (current, action: { type: "add"; task: TaskView } | { type: "complete"; id: string }) => {
      if (action.type === "complete") {
        return current.filter((task) => task.id !== action.id);
      }
      return [action.task, ...current];
    },
  );

  function submit() {
    const nextTitle = title.trim();
    if (!nextTitle) return;
    const task: TaskView = {
      id: crypto.randomUUID(),
      title: nextTitle,
      category,
      isMicro,
    };
    setTitle("");
    startTransition(async () => {
      updateTasks({ type: "add", task });
      await addTask({ title: nextTitle, category, isMicro });
    });
  }

  function complete(id: string) {
    startTransition(async () => {
      updateTasks({ type: "complete", id });
      await completeTask(id);
    });
  }

  return (
    <div>
      <form
        className="mb-8"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <div className="flex items-center gap-2">
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={placeholder}
            aria-label="Nouvelle tâche"
            maxLength={180}
            className="h-12 border-0 bg-transparent px-0 text-[17px] shadow-none focus-visible:ring-0 md:text-[17px] placeholder:text-[#b7b2aa]"
          />
          <button
            type="submit"
            disabled={pending || title.trim().length === 0}
            aria-label="Ajouter la tâche"
            className="grid size-11 shrink-0 place-items-center rounded-full bg-foreground text-background transition-colors disabled:bg-[#d9d4cc]"
          >
            <Plus className="size-5" />
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2" role="radiogroup" aria-label="Catégorie">
          {CATEGORIES.map((item) => {
            const selected = item === category;
            return (
              <button
                key={item}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setCategory(item)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-[13px] transition-colors",
                  selected ? "bg-foreground text-background" : "bg-white text-muted-foreground",
                )}
              >
                {item}
              </button>
            );
          })}
          {microMode === "choice" ? (
            <button
              type="button"
              aria-pressed={isMicro}
              onClick={() => setIsMicro((value) => !value)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] transition-colors",
                isMicro ? "bg-foreground text-background" : "bg-white text-muted-foreground",
              )}
            >
              <Zap className="size-3.5" />
              Moins de 5 min
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-1.5 text-[13px] text-background">
              <Zap className="size-3.5" />
              Moins de 5 min
            </span>
          )}
        </div>
      </form>

      {optimisticTasks.length === 0 ? (
        <div className="px-1 pt-16">
          <p className="text-[1.35rem] font-medium tracking-[-0.03em]">{emptyTitle}</p>
          <p className="mt-2 max-w-xs text-[15px] leading-relaxed text-muted-foreground">{emptyBody}</p>
        </div>
      ) : (
        <ul className="flex flex-col">
          {optimisticTasks.map((task) => (
            <li key={task.id} className="flex items-start gap-3.5 border-b border-black/5 py-4 last:border-b-0">
              <Checkbox
                checked={false}
                disabled={pending}
                onCheckedChange={() => complete(task.id)}
                aria-label={`Terminer ${task.title}`}
                className="mt-0.5 size-[22px] rounded-full border-[#d7d2cb] bg-transparent"
              />
              <button
                type="button"
                disabled={pending}
                onClick={() => complete(task.id)}
                className="min-w-0 flex-1 text-left disabled:opacity-100"
              >
                <span className="block text-[17px] leading-snug tracking-[-0.01em]">{task.title}</span>
              </button>
              <div className="flex shrink-0 flex-col items-end gap-1 pt-0.5">
                <span className={cn("text-[12px]", categoryClass[task.category])}>{task.category}</span>
                {task.isMicro ? (
                  <span className="text-[11px] text-muted-foreground">5 min</span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
