import { AppNavigation } from "@/components/AppNavigation";
import { AppStateGuard } from "@/components/AppStateGuard";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AppStateGuard>
      <div className="min-h-full flex flex-1 flex-col">
        <div className="flex flex-1 flex-col">{children}</div>
        <AppNavigation />
      </div>
    </AppStateGuard>
  );
}
