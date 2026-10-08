import { revalidatePath } from "next/cache";

export function revalidateTasks() {
  revalidatePath("/");
  revalidatePath("/brain");
  revalidatePath("/quick-wins");
}

export function revalidateRoutines() {
  revalidatePath("/");
  revalidatePath("/routines");
}
