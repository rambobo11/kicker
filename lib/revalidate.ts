import { refresh, revalidatePath, updateTag } from "next/cache";

export function revalidateTasks() {
  updateTag("tasks");
  revalidatePath("/");
  revalidatePath("/brain");
  revalidatePath("/quick-wins");
  refresh();
}

export function revalidateRoutines() {
  updateTag("routines");
  revalidatePath("/");
  revalidatePath("/routines");
  refresh();
}
