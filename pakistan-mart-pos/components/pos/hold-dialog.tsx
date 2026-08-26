"use client";

import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store/app-store";
import { usePosStore } from "@/lib/store/pos-store";
import { formatPKR, formatDateTime } from "@/lib/utils";
import { toast } from "sonner";

export function HoldDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const held = useAppStore((s) => s.heldSales);
  const deleteHeld = useAppStore((s) => s.deleteHeld);
  const loadItems = usePosStore((s) => s.loadItems);

  return (
    <Dialog open={open} onClose={onClose} title="Held / suspended sales" description="Resume a parked cart">
      {held.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No held sales</p>}
      <div className="space-y-2">
        {held.map((h) => {
          const total = h.items.reduce((a, i) => a + i.unitPrice * i.quantity - i.discount, 0) - h.orderDiscount;
          return (
            <div key={h.id} className="rounded-xl border border-border p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate font-semibold">{h.holdNumber}</p>
                <p className="shrink-0 text-sm tabular-nums">{formatPKR(Math.round(total))}</p>
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {h.customerName} · {h.items.length} items · {formatDateTime(h.createdAt)}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    loadItems(h.items, h.customerId, h.orderDiscount);
                    deleteHeld(h.id);
                    toast.success("Sale resumed");
                    onClose();
                  }}
                >
                  Resume
                </Button>
                <Button size="sm" variant="outline" onClick={onClose}>
                  View
                </Button>
                <Button size="sm" variant="destructive" onClick={() => deleteHeld(h.id)}>
                  Delete
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </Dialog>
  );
}
