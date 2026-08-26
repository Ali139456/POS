"use client";

import { useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { CommandPalette } from "@/components/layout/command-palette";
import { NotificationPanel } from "@/components/layout/notification-panel";
import { useUiStore } from "@/lib/store/ui-store";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
      {children}
      <Toaster position="top-right" richColors closeButton />
    </ThemeProvider>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const setSidebarCollapsed = useUiStore((s) => s.setSidebarCollapsed);
  const setMobileNavOpen = useUiStore((s) => s.setMobileNavOpen);

  useEffect(() => {
    let prev = window.innerWidth;
    let first = true;
    const apply = () => {
      const w = window.innerWidth;
      if (w < 1280) setSidebarCollapsed(true);
      else if (first || prev < 1280) setSidebarCollapsed(false);
      if (w < 768) setMobileNavOpen(false);
      first = false;
      prev = w;
    };
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, [setSidebarCollapsed, setMobileNavOpen]);

  return (
    <div className="flex h-dvh max-w-[100vw] overflow-hidden bg-background">
      <AppSidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">{children}</div>
      <CommandPalette />
      <NotificationPanel />
    </div>
  );
}
