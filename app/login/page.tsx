import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center px-6">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
      <p className="text-[13px] tracking-[0.18em] text-muted-foreground uppercase">Kicker</p>
      <h1 className="mt-3 text-[2.4rem] leading-none font-semibold tracking-[-0.045em]">
        Reprends le fil.
      </h1>
      <Suspense fallback={<LoginForm error={null} />}>
        <LoginGate searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function LoginGate({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params.error === "2" ? "locked" : params.error === "1" ? "invalid" : null;
  return <LoginForm error={error} />;
}
