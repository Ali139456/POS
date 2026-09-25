"use client";

import { ChevronDown, Warehouse } from "lucide-react";
import { useOrgStore, useIsParentUser } from "@/lib/store/org-store";
import type { StoreContextId } from "@/lib/types";
import { cn } from "@/lib/utils";

const OPTIONS: { id: StoreContextId; label: string }[] = [
  { id: "all", label: "All Stores" },
  { id: "warehouse", label: "Central Warehouse" },
];

export function StoreSelector({ className }: { className?: string }) {
  const isParent = useIsParentUser();
  const context = useOrgStore((s) => s.storeContext);
  const stores = useOrgStore((s) => s.childStores);
  const setContext = useOrgStore((s) => s.setStoreContext);

  if (!isParent) return null;

  const allOptions = [...OPTIONS, ...stores.map((s) => ({ id: s.organizationId as StoreContextId, label: s.name }))];
  const current = allOptions.find((o) => o.id === context)?.label ?? "All Stores";

  return (
    <div className={cn("relative", className)}>
      <label className="sr-only">Store context</label>
      <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
        <Warehouse className="size-4" />
      </div>
      <select
        value={context}
        onChange={(e) => setContext(e.target.value as StoreContextId)}
        className="h-10 min-w-[160px] max-w-[220px] appearance-none rounded-xl border border-border bg-card pl-9 pr-8 text-sm font-medium shadow-sm outline-none focus:ring-2 focus:ring-primary/30 sm:min-w-[200px]"
      >
        {allOptions.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <span className="sr-only">Current: {current}</span>
    </div>
  );
}
