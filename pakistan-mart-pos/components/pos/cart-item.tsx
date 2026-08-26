"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import type { CartItem } from "@/lib/types";
import { formatPKR, formatQty } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { usePosStore } from "@/lib/store/pos-store";

export function CartItemRow({ item }: { item: CartItem }) {
  const bump = usePosStore((s) => s.bumpQty);
  const setQty = usePosStore((s) => s.setQty);
  const setDiscount = usePosStore((s) => s.setItemDiscount);
  const remove = usePosStore((s) => s.removeItem);
  const line = item.unitPrice * item.quantity - item.discount;

  return (
    <div className="rounded-xl border border-border bg-background/60 p-2.5 min-[800px]:p-3">
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{item.name}</p>
          {item.variantName && <p className="truncate text-xs text-muted-foreground">{item.variantName}</p>}
          <p className="text-xs text-muted-foreground">
            {formatPKR(item.unitPrice)} × {formatQty(item.quantity, item.unit)}
          </p>
        </div>
        <p className="shrink-0 text-sm font-semibold tabular-nums">{formatPKR(line)}</p>
      </div>
      <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2">
        <button
          onClick={() => bump(item.id, -1)}
          className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border hover:bg-muted"
          aria-label="Decrease"
        >
          <Minus className="size-3.5" />
        </button>
        <Input
          value={item.quantity}
          onChange={(e) => setQty(item.id, Number(e.target.value) || 0)}
          className="h-11 min-h-11 w-16 text-center"
        />
        <button
          onClick={() => bump(item.id, 1)}
          className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border hover:bg-muted"
          aria-label="Increase"
        >
          <Plus className="size-3.5" />
        </button>
        <Input
          placeholder="Disc"
          value={item.discount || ""}
          onChange={(e) => setDiscount(item.id, Number(e.target.value) || 0)}
          className="h-11 min-h-11 min-w-0 flex-1 basis-20"
        />
        <button
          onClick={() => remove(item.id)}
          className="flex size-11 shrink-0 items-center justify-center rounded-xl text-destructive hover:bg-red-50 dark:hover:bg-red-950/40"
          aria-label="Remove"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
