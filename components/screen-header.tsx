import { Lock } from "lucide-react";
import { logout } from "@/app/actions";
import { Button } from "@/components/ui/button";

export function ScreenHeader({ title, hint }: { title: string; hint: string }) {
  return (
    <header className="mb-8 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-[2rem] leading-none font-semibold tracking-[-0.04em]">{title}</h1>
        <p className="mt-2.5 text-[15px] text-muted-foreground">{hint}</p>
      </div>
      <form action={logout}>
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          aria-label="Verrouiller"
          className="mt-0.5 text-muted-foreground"
        >
          <Lock />
        </Button>
      </form>
    </header>
  );
}
