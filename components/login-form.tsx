"use client";

import { useFormStatus } from "react-dom";
import { login } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm({ error }: { error: "invalid" | "locked" | null }) {
  return (
    <form action={login} className="mt-10 flex flex-col gap-3">
      <Input
        name="password"
        type="password"
        autoComplete="current-password"
        autoFocus
        required
        placeholder="Mot de passe"
        aria-label="Mot de passe"
        className="h-12 rounded-2xl border-0 bg-card px-4 text-[17px] shadow-none md:text-[17px]"
      />
      {error === "invalid" ? (
        <p className="px-1 text-[13px] text-[#c44740] dark:text-[#f0a8a4]">Mot de passe incorrect.</p>
      ) : null}
      {error === "locked" ? (
        <p className="px-1 text-[13px] text-[#c44740] dark:text-[#f0a8a4]">Trop d&apos;essais. Réessaie dans quelques minutes.</p>
      ) : null}
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="h-12 rounded-full text-[15px]"
    >
      {pending ? "…" : "Entrer"}
    </Button>
  );
}
