"use client";

import { Bell, MoreHorizontal, Moon, PanelLeft, Search, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { format } from "date-fns";
import { useUiStore } from "@/lib/store/ui-store";
import { useAppStore } from "@/lib/store/app-store";
import { Badge } from "@/components/ui/badge";
import { StoreSelector } from "@/components/org/store-selector";

export function TopHeader({ title, extra }: { title?: string; extra?: React.ReactNode }) {
  const setMobileNavOpen = useUiStore((s) => s.setMobileNavOpen);
  const setCommandOpen = useUiStore((s) => s.setCommandOpen);
  const setNotificationsOpen = useUiStore((s) => s.setNotificationsOpen);
  const moreOpen = useUiStore((s) => s.moreOpen);
  const setMoreOpen = useUiStore((s) => s.setMoreOpen);
  const unread = useAppStore((s) => s.notifications.filter((n) => !n.read).length);
  const register = useAppStore((s) => s.register);
  const { theme, setTheme } = useTheme();

  return (
    <header className="no-print sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/90 px-2 backdrop-blur-md sm:px-3 lg:px-4 min-[900px]:h-16 [@media(max-height:800px)]:h-14">
      <button
        onClick={() => setMobileNavOpen(true)}
        className="flex size-11 shrink-0 items-center justify-center rounded-xl hover:bg-muted md:hidden"
        aria-label="Open menu"
      >
        <PanelLeft className="size-4" />
      </button>
      {title && <h1 className="min-w-0 truncate text-sm font-semibold sm:text-base">{title}</h1>}
      <div className="min-w-0 flex-1" />
      <StoreSelector className="hidden sm:block" />
      <Badge className="hidden shrink-0 md:inline-flex xl:hidden" tone={register.status === "Open" ? "success" : "neutral"}>
        {register.status === "Open" ? "Shift open" : "Closed"}
      </Badge>
      <div className="hidden min-w-0 items-center gap-2 text-xs text-muted-foreground xl:flex">
        <span className="truncate">{format(new Date(), "EEE, d MMM yyyy")}</span>
        <Badge tone={register.status === "Open" ? "success" : "neutral"}>{register.status === "Open" ? "Shift open" : "Closed"}</Badge>
      </div>
      {extra && <div className="hidden sm:flex">{extra}</div>}
      <button
        onClick={() => setCommandOpen(true)}
        className="hidden h-11 max-w-xs items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm text-muted-foreground shadow-sm hover:bg-muted xl:flex"
      >
        <Search className="size-4" />
        <span>Search</span>
        <kbd className="ml-4 rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10px]">Ctrl K</kbd>
      </button>
      <button
        onClick={() => setCommandOpen(true)}
        className="flex size-11 items-center justify-center rounded-xl hover:bg-muted xl:hidden"
        aria-label="Search"
      >
        <Search className="size-4" />
      </button>
      <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="hidden size-11 items-center justify-center rounded-xl hover:bg-muted sm:flex" aria-label="Toggle theme">
        <Sun className="size-4 dark:hidden" />
        <Moon className="hidden size-4 dark:block" />
      </button>
      <button onClick={() => setNotificationsOpen(true)} className="relative flex size-11 items-center justify-center rounded-xl hover:bg-muted" aria-label="Notifications">
        <Bell className="size-4" />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-white">
            {unread}
          </span>
        )}
      </button>
      <div className="relative sm:hidden">
        <button
          onClick={() => setMoreOpen(!moreOpen)}
          className="flex size-11 items-center justify-center rounded-xl hover:bg-muted"
          aria-label="More"
        >
          <MoreHorizontal className="size-4" />
        </button>
        {moreOpen && (
          <>
            <button className="fixed inset-0 z-40" aria-label="Close menu" onClick={() => setMoreOpen(false)} />
            <div className="absolute right-0 z-50 mt-1 w-52 rounded-xl border border-border bg-card p-2 shadow-xl">
              <p className="px-2 py-1.5 text-xs text-muted-foreground">{format(new Date(), "EEE, d MMM yyyy")}</p>
              <p className="px-2 pb-2 text-xs">{register.status === "Open" ? "Shift open" : "Shift closed"}</p>
              {extra && <div className="border-t border-border py-2">{extra}</div>}
              <button
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2.5 text-sm hover:bg-muted"
                onClick={() => {
                  setTheme(theme === "dark" ? "light" : "dark");
                  setMoreOpen(false);
                }}
              >
                Toggle theme
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
