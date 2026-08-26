"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  ScanBarcode,
  Receipt,
  Package,
  Tags,
  Warehouse,
  ClipboardList,
  Truck,
  Users,
  Undo2,
  Wallet,
  Banknote,
  BarChart3,
  UserCog,
  Settings,
  LogOut,
  ChevronLeft,
  Store,
  X,
  MoreVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/lib/store/ui-store";
import { useAppStore, useCurrentEmployee } from "@/lib/store/app-store";
import { AvatarHue } from "@/components/shared/thumbs";

export const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pos", label: "POS", icon: ScanBarcode },
  { href: "/sales", label: "Sales", icon: Receipt },
  { href: "/products", label: "Products", icon: Package },
  { href: "/categories", label: "Categories", icon: Tags },
  { href: "/inventory", label: "Inventory", icon: Warehouse },
  { href: "/purchase-orders", label: "Purchase Orders", icon: ClipboardList },
  { href: "/suppliers", label: "Suppliers", icon: Truck },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/returns", label: "Returns", icon: Undo2 },
  { href: "/expenses", label: "Expenses", icon: Wallet },
  { href: "/cash", label: "Cash Management", icon: Banknote },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/employees", label: "Employees", icon: UserCog },
  { href: "/settings", label: "Settings", icon: Settings },
];

function NavLinks({ onNavigate, showLabels }: { onNavigate?: () => void; showLabels: boolean }) {
  const pathname = usePathname();
  return (
    <nav className="flex-1 overflow-y-auto scrollbar-thin px-2 pb-3">
      {NAV.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            title={item.label}
            onClick={onNavigate}
            className={cn(
              "mb-0.5 flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
              !showLabels && "justify-center px-0",
              active
                ? "bg-primary/15 text-white shadow-[inset_0_0_0_1px_rgba(45,212,191,0.25)]"
                : "text-slate-300 hover:bg-sidebar-accent hover:text-white",
            )}
          >
            <Icon className={cn("size-4 shrink-0", active && "text-primary")} />
            {showLabels && <span className="truncate">{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarChrome({ onNavigate, showLabels }: { onNavigate?: () => void; showLabels: boolean }) {
  const store = useAppStore((s) => s.store);
  const employee = useCurrentEmployee();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  function logout() {
    setMenuOpen(false);
    onNavigate?.();
    router.push("/login");
  }

  return (
    <>
      <div className={cn("flex items-center gap-3 px-3 py-3 lg:px-4 lg:py-4", !showLabels && "justify-center px-2")}>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <Store className="size-5" />
        </div>
        {showLabels && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight">Al-Noor POS</p>
            <p className="truncate text-xs text-slate-400">{store.city}</p>
          </div>
        )}
      </div>
      <NavLinks onNavigate={onNavigate} showLabels={showLabels} />
      <div className="relative border-t border-white/10 p-2 lg:p-3">
        <div className={cn("flex items-center gap-2 rounded-xl bg-sidebar-accent p-2.5", !showLabels && "flex-col justify-center px-1")}>
          <AvatarHue name={employee.name} hue={employee.avatarHue} size="sm" />
          {showLabels && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{employee.name}</p>
              <p className="truncate text-xs text-slate-400">{store.name}</p>
            </div>
          )}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-300 hover:bg-white/10 hover:text-white"
            aria-label="Account menu"
            aria-expanded={menuOpen}
          >
            <MoreVertical className="size-4" />
          </button>
        </div>
        {menuOpen && (
          <>
            <button className="fixed inset-0 z-40" aria-label="Close menu" onClick={() => setMenuOpen(false)} />
            <div className="absolute bottom-full right-2 z-50 mb-1 min-w-40 rounded-xl border border-white/10 bg-[#151d2e] p-1 shadow-xl">
              <button
                onClick={logout}
                className="flex min-h-10 w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-white/10"
              >
                <LogOut className="size-4" />
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export function AppSidebar() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggle = useUiStore((s) => s.toggleSidebar);
  const mobileOpen = useUiStore((s) => s.mobileNavOpen);
  const setMobileOpen = useUiStore((s) => s.setMobileNavOpen);

  return (
    <>
      <aside
        className={cn(
          "no-print relative z-30 hidden h-full shrink-0 flex-col bg-sidebar text-sidebar-foreground transition-[width] duration-200 md:flex",
          collapsed ? "w-[72px]" : "w-[72px] xl:w-[248px]",
        )}
      >
        <SidebarChrome showLabels={!collapsed} />
        <button
          onClick={toggle}
          className="absolute -right-3 top-20 hidden size-7 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm xl:flex"
          aria-label="Collapse sidebar"
        >
          <ChevronLeft className={cn("size-3.5 transition-transform", collapsed && "rotate-180")} />
        </button>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px]" aria-label="Close menu" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex h-full w-[min(86vw,280px)] flex-col bg-sidebar text-sidebar-foreground shadow-2xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-2 top-3 z-10 flex size-11 items-center justify-center rounded-xl text-slate-300 hover:bg-sidebar-accent"
              aria-label="Close navigation"
            >
              <X className="size-4" />
            </button>
            <SidebarChrome showLabels onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
