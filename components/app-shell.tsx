import { BottomNav, SideNav } from "@/components/bottom-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh lg:grid lg:h-dvh lg:grid-cols-[252px_minmax(0,1fr)] lg:overflow-hidden">
      <SideNav />
      <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col lg:mx-0 lg:h-dvh lg:max-w-none lg:min-h-0">
        <main className="flex min-h-0 flex-1 flex-col px-6 pt-10 pb-32 lg:px-0 lg:pt-0 lg:pb-0">{children}</main>
        <BottomNav />
      </div>
    </div>
  );
}
