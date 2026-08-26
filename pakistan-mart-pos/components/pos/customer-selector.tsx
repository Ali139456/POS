"use client";

import { useMemo, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { SearchInput } from "@/components/shared/search-input";
import { useAppStore } from "@/lib/store/app-store";
import { usePosStore, WALK_IN } from "@/lib/store/pos-store";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatPKR } from "@/lib/utils";

export function CustomerSelector({ open, onClose }: { open: boolean; onClose: () => void }) {
  const customers = useAppStore((s) => s.customers);
  const setCustomer = usePosStore((s) => s.setCustomer);
  const [q, setQ] = useState("");
  const list = useMemo(
    () =>
      customers.filter((c) => `${c.name} ${c.phone}`.toLowerCase().includes(q.toLowerCase())),
    [customers, q],
  );

  return (
    <Dialog open={open} onClose={onClose} title="Select customer" description="Search by name or phone">
      <SearchInput value={q} onChange={setQ} placeholder="Name or phone number" />
      <div className="mt-3 max-h-80 space-y-1 overflow-y-auto">
        {list.map((c) => (
          <button
            key={c.id}
            onClick={() => {
              setCustomer(c.id);
              onClose();
            }}
            className="flex min-h-11 w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left hover:bg-muted"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{c.name}</p>
              <p className="truncate text-xs text-muted-foreground">{c.phone}</p>
            </div>
            <div className="shrink-0 text-right">
              <StatusBadge status={c.type} />
              {c.id !== WALK_IN && <p className="mt-1 text-xs text-muted-foreground">Khata {formatPKR(c.creditBalance)}</p>}
            </div>
          </button>
        ))}
      </div>
    </Dialog>
  );
}
