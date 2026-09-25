import type { LucideIcon } from "lucide-react";
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
  Building2,
  ArrowLeftRight,
  PackageSearch,
  Layers,
} from "lucide-react";
import type { AccessLevel, EmployeeRole } from "@/lib/types";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  section?: string;
  parentOnly?: boolean;
  storeOnly?: boolean;
  hideForRoles?: EmployeeRole[];
}

export const SHARED_NAV: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pos", label: "POS", icon: ScanBarcode, storeOnly: true },
  { href: "/sales", label: "Sales", icon: Receipt },
  { href: "/products", label: "Products", icon: Package },
  { href: "/categories", label: "Categories", icon: Tags, storeOnly: true },
  { href: "/inventory", label: "Inventory", icon: Warehouse, storeOnly: true },
  { href: "/purchase-orders", label: "Purchase Orders", icon: ClipboardList },
  { href: "/suppliers", label: "Suppliers", icon: Truck, parentOnly: true },
  { href: "/customers", label: "Customers", icon: Users, storeOnly: true },
  { href: "/returns", label: "Returns", icon: Undo2, storeOnly: true },
  { href: "/expenses", label: "Expenses", icon: Wallet },
  { href: "/cash", label: "Cash Management", icon: Banknote, storeOnly: true },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/employees", label: "Employees", icon: UserCog, parentOnly: true },
  { href: "/settings", label: "Settings", icon: Settings },
];

export const PARENT_BUSINESS_NAV: NavItem[] = [
  { href: "/stores", label: "Stores", icon: Building2, section: "Business", parentOnly: true },
  { href: "/central-inventory", label: "Central Inventory", icon: PackageSearch, section: "Business", parentOnly: true },
  { href: "/all-inventory", label: "All Inventory", icon: Layers, section: "Business", parentOnly: true },
];

export const STOCK_NAV: NavItem[] = [
  { href: "/stock-requests", label: "Stock Requests", icon: ClipboardList, section: "Stock" },
  { href: "/transfers", label: "Transfers", icon: ArrowLeftRight, section: "Stock" },
];

export function getNavForUser(accessLevel: AccessLevel, role: EmployeeRole, context: string): NavItem[] {
  const isParent = accessLevel === "parent";
  const viewingAll = isParent && context === "all";

  const items: NavItem[] = [];

  if (isParent && viewingAll) {
    items.push({ href: "/", label: "Dashboard", icon: LayoutDashboard });
    items.push(...PARENT_BUSINESS_NAV);
    items.push(...STOCK_NAV.map((i) => ({ ...i, parentOnly: true })));
    items.push(
      { href: "/products", label: "Products", icon: Package },
      { href: "/sales", label: "Sales", icon: Receipt },
      { href: "/purchase-orders", label: "Purchase Orders", icon: ClipboardList },
      { href: "/reports", label: "Reports", icon: BarChart3 },
      { href: "/expenses", label: "Expenses", icon: Wallet },
      { href: "/employees", label: "Employees", icon: UserCog },
      { href: "/settings", label: "Settings", icon: Settings },
    );
    return items;
  }

  if (isParent && context === "warehouse") {
    items.push(
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
      { href: "/central-inventory", label: "Central Inventory", icon: PackageSearch },
      ...STOCK_NAV,
      { href: "/products", label: "Products", icon: Package },
      { href: "/reports", label: "Reports", icon: BarChart3 },
      { href: "/settings", label: "Settings", icon: Settings },
    );
    return items;
  }

  for (const item of SHARED_NAV) {
    if (item.parentOnly && !isParent) continue;
    if (item.storeOnly && isParent && context !== "all" && context !== "warehouse") {
      // parent viewing a specific child store — show store nav
    } else if (item.storeOnly && isParent && (context === "all" || context === "warehouse")) continue;
    if (item.hideForRoles?.includes(role)) continue;
    items.push(item);
  }

  if (!isParent || (isParent && context !== "all" && context !== "warehouse")) {
    items.splice(Math.min(2, items.length), 0, ...STOCK_NAV);
  }

  if (isParent && context !== "all" && context !== "warehouse") {
    items.unshift({ href: "/stores", label: "Stores", icon: Building2 });
  }

  return dedupeNav(items);
}

function dedupeNav(items: NavItem[]): NavItem[] {
  const seen = new Set<string>();
  return items.filter((i) => {
    if (seen.has(i.href)) return false;
    seen.add(i.href);
    return true;
  });
}
