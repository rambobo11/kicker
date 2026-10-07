"use client";

import { useFormStatus } from "react-dom";
import { login } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm({ invalid }: { invalid: boolean }) {
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
        className="h-12 rounded-2xl border-0 bg-white px-4 text-[17px] shadow-none md:text-[17px]"
      />
      {invalid ? (
        <p className="px-1 text-[13px] text-[#c44740]">Mot de passe incorrect.</p>
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
