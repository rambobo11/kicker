import { BottomNav, SideNav } from "@/components/bottom-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[220px_minmax(0,1fr)]">
      <SideNav />
      <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col lg:max-w-3xl">
        <main className="flex-1 px-6 pt-10 pb-32 lg:px-12 lg:pt-14 lg:pb-16">{children}</main>
        <BottomNav />
      </div>
    </div>
  );
}
