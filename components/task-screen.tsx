"use client";

import { Plus, Zap } from "lucide-react";
import { useState, useTransition } from "react";
import { useOptimistic } from "react";
import { addTask, completeTask, reopenTask, updateTask } from "@/app/actions/tasks";
import { ParentDoneNotice } from "@/components/parent-done-notice";
import { ScreenHeader } from "@/components/screen-header";
import { SplitPane } from "@/components/split-pane";
import { SplitTask } from "@/components/split-task";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { CATEGORIES, categoryClass, type Category } from "@/lib/categories";
import type { TaskView } from "@/lib/data/tasks";
import { cn } from "cn";

export function TaskScreen({
  tasks,
  done = [],
  microMode,
  emptyTitle,
  emptyBody,
  placeholder,
  heading,
  hint,
  allowSplit = false,
}: {
  tasks: TaskView[];
  done?: TaskView[];
  microMode: "choice" | "locked";
  emptyTitle: string;
  emptyBody: string;
  placeholder: string;
  heading: string;
  hint: string;
  allowSplit?: boolean;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("Base Camp");
  const [isMicro, setIsMicro] = useState(microMode === "locked");
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [closedParent, setClosedParent] = useState<{ id: string; title: string } | null>(null);
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
  const [optimisticDone, updateDone] = useOptimistic(
    done,
    (
      current,
      action:
        | { type: "edit"; id: string; title: string; category: Category }
        | { type: "reopen"; id: string },
    ) => {
      if (action.type === "reopen") return current.filter((task) => task.id !== action.id);
      return current.map((task) =>
        task.id === action.id ? { ...task, title: action.title, category: action.category } : task,
      );
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
      parentId: null,
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
      const closed = await completeTask(id);
      if (closed) {
        updateTasks({ type: "complete", id: closed.id });
        setClosedParent(closed);
      }
    });
  }

  function undoClosedParent() {
    if (!closedParent) return;
    const id = closedParent.id;
    setClosedParent(null);
    startTransition(async () => {
      await reopenTask(id);
    });
  }

  function saveDone(task: TaskView, nextTitle: string, nextCategory: Category) {
    const title = nextTitle.trim();
    if (!title) return;
    startTransition(async () => {
      updateDone({ type: "edit", id: task.id, title, category: nextCategory });
      await updateTask({ id: task.id, title, category: nextCategory });
    });
  }

  function restoreDone(task: TaskView) {
    setEditId(null);
    startTransition(async () => {
      updateDone({ type: "reopen", id: task.id });
      updateTasks({ type: "add", task: { ...task, parentId: task.parentId } });
      await reopenTask(task.id);
    });
  }

  const selected = editId ? null : (optimisticTasks.find((task) => task.id === pickedId) ?? optimisticTasks[0] ?? null);
  const editing = optimisticDone.find((task) => task.id === editId) ?? null;

  return (
    <>
    <SplitPane
      list={
    <div>
      <ScreenHeader title={heading} hint={hint} />
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
            className="h-12 border-0 bg-transparent px-0 text-[17px] shadow-none focus-visible:ring-0 md:text-[17px] placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            disabled={pending || title.trim().length === 0}
            aria-label="Ajouter la tâche"
            className="grid size-11 shrink-0 place-items-center rounded-full bg-foreground text-background transition-colors disabled:bg-muted"
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
                  selected ? "bg-foreground text-background" : "bg-card text-muted-foreground",
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
                isMicro ? "bg-foreground text-background" : "bg-card text-muted-foreground",
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
            <li key={task.id}>
              <div
                className={cn(
                  "flex items-start gap-3.5 border-b border-border py-4 lg:rounded-xl lg:border-0 lg:px-3 lg:py-3",
                  selected?.id === task.id && "lg:bg-card",
                )}
              >
                <Checkbox
                  checked={false}
                  disabled={pending}
                  onCheckedChange={() => complete(task.id)}
                  aria-label={`Terminer ${task.title}`}
                  className="mt-0.5 size-[22px] rounded-full border-border bg-transparent"
                />
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => complete(task.id)}
                  className="min-w-0 flex-1 text-left disabled:opacity-100 lg:hidden"
                >
                  <span
                    className={cn(
                      "block text-[17px] leading-snug tracking-[-0.01em]",
                      categoryClass[task.category],
                    )}
                  >
                    {task.title}
                  </span>
                  <span className={cn("mt-0.5 block text-[13px]", categoryClass[task.category])}>
                    {task.category}
                    {task.isMicro ? " · 5 min" : ""}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setPickedId(task.id)}
                  className="hidden min-w-0 flex-1 text-left lg:block"
                >
                  <span className={cn("block text-[15px] leading-snug", categoryClass[task.category])}>
                    {task.title}
                  </span>
                  <span className={cn("mt-0.5 block text-[13px]", categoryClass[task.category])}>
                    {task.category}
                    {task.isMicro ? " · 5 min" : ""}
                  </span>
                </button>
              </div>
              {allowSplit && !task.isMicro ? (
                <div className="mt-2 pb-3 pl-[36px] lg:hidden">
                  <SplitTask taskId={task.id} />
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
      {optimisticDone.length > 0 ? (
        <div className="mt-12">
          <p className="px-1 text-[13px] text-muted-foreground">Faites</p>
          <ul className="mt-2">
            {optimisticDone.map((task) => (
              <li key={task.id}>
                <button
                  type="button"
                  onClick={() => {
                    setPickedId(null);
                    setEditId(task.id);
                  }}
                  className={cn(
                    "w-full rounded-xl px-1 py-3 text-left lg:px-3",
                    editing?.id === task.id && "lg:bg-card",
                  )}
                >
                  <span className="block text-[15px] leading-snug text-muted-foreground">{task.title}</span>
                  <span className={cn("mt-0.5 block text-[13px]", categoryClass[task.category])}>
                    {task.category}
                  </span>
                </button>
                {editing?.id === task.id ? (
                  <div className="pb-3 lg:hidden">
                    <DoneEditor
                      key={task.id}
                      task={task}
                      pending={pending}
                      onSave={(nextTitle, nextCategory) => saveDone(task, nextTitle, nextCategory)}
                      onReopen={() => restoreDone(task)}
                    />
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
      }
      detail={
        editing ? (
          <DoneEditor
            key={editing.id}
            task={editing}
            pending={pending}
            onSave={(nextTitle, nextCategory) => saveDone(editing, nextTitle, nextCategory)}
            onReopen={() => restoreDone(editing)}
          />
        ) : selected ? (
          <div>
            <p className={cn("text-[13px]", categoryClass[selected.category])}>{selected.category}</p>
            <h2
              className={cn(
                "mt-4 max-w-xl text-[2.2rem] leading-[1.15] font-medium tracking-[-0.04em]",
                categoryClass[selected.category],
              )}
            >
              {selected.title}
            </h2>
            {selected.isMicro ? <p className="mt-3 text-[14px] text-muted-foreground">5 min</p> : null}
            <Button
              type="button"
              disabled={pending}
              onClick={() => complete(selected.id)}
              className="mt-8 h-11 rounded-full px-6"
            >
              C&apos;est fait
            </Button>
            {allowSplit && !selected.isMicro ? (
              <div className="mt-8 max-w-md border-t border-border pt-6">
                <SplitTask key={selected.id} taskId={selected.id} />
              </div>
            ) : null}
          </div>
        ) : (
          <p className="pt-16 text-[15px] text-muted-foreground">Sélectionne une tâche.</p>
        )
      }
    />
    <ParentDoneNotice
      parent={closedParent}
      onUndo={undoClosedParent}
      onDismiss={() => setClosedParent(null)}
    />
    </>
  );
}

function DoneEditor({
  task,
  pending,
  onSave,
  onReopen,
}: {
  task: TaskView;
  pending: boolean;
  onSave: (title: string, category: Category) => void;
  onReopen: () => void;
}) {
  const [title, setTitle] = useState(task.title);
  const [category, setCategory] = useState<Category>(task.category);

  return (
    <form
      className="max-w-xl"
      onSubmit={(event) => {
        event.preventDefault();
        onSave(title, category);
      }}
    >
      <Input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        aria-label="Titre"
        maxLength={180}
        className="h-12 border-0 bg-transparent px-0 text-[1.65rem] shadow-none focus-visible:ring-0 md:text-[1.65rem]"
      />
      <div className="mt-4 flex flex-wrap gap-2" role="radiogroup" aria-label="Catégorie">
        {CATEGORIES.map((item) => (
          <button
            key={item}
            type="button"
            role="radio"
            aria-checked={item === category}
            onClick={() => setCategory(item)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-[13px] transition-colors",
              item === category ? "bg-foreground text-background" : "bg-card text-muted-foreground",
            )}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="mt-6 flex items-center gap-5">
        <Button type="submit" disabled={pending || title.trim().length === 0} className="h-11 rounded-full px-6">
          Enregistrer
        </Button>
        <button type="button" onClick={onReopen} disabled={pending} className="text-[14px] text-muted-foreground">
          Remettre
        </button>
      </div>
    </form>
  );
}
