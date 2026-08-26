"use client";

import { useState } from "react";
import { Pause, Percent, Trash2, UserRound, Wallet, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { CartItemRow } from "@/components/pos/cart-item";
import { cartTotals, usePosStore } from "@/lib/store/pos-store";
import { useAppStore } from "@/lib/store/app-store";
import { cn, formatPKR } from "@/lib/utils";
import { toast } from "sonner";

export function PosCart({
  onPay,
  onCustomer,
  onHold,
  onClose,
  className,
}: {
  onPay: () => void;
  onCustomer: () => void;
  onHold: () => void;
  onClose?: () => void;
  className?: string;
}) {
  const items = usePosStore((s) => s.items);
  const customerId = usePosStore((s) => s.customerId);
  const orderDiscount = usePosStore((s) => s.orderDiscount);
  const orderDiscountType = usePosStore((s) => s.orderDiscountType);
  const setOrderDiscount = usePosStore((s) => s.setOrderDiscount);
  const clear = usePosStore((s) => s.clear);
  const customers = useAppStore((s) => s.customers);
  const customer = customers.find((c) => c.id === customerId);
  const totals = cartTotals(items, orderDiscount, orderDiscountType, 0);
  const [discOpen, setDiscOpen] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const [discVal, setDiscVal] = useState(String(orderDiscount || ""));
  const [discType, setDiscType] = useState<"amount" | "percent">(orderDiscountType);

  return (
    <aside className={cn("flex h-full min-h-0 w-full min-w-0 flex-col border-border bg-card lg:border-l", className)}>
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-3 py-2 min-[800px]:px-4 min-[800px]:py-3 [@media(max-height:760px)]:py-2">
        <div className="min-w-0">
          <h2 className="font-semibold">Current Sale</h2>
          <p className="truncate text-xs text-muted-foreground">
            {items.length} line · {totals.itemCount} items
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={onCustomer}
            className="flex min-h-11 max-w-[42vw] items-center gap-2 rounded-xl bg-muted px-3 py-2 text-sm hover:bg-muted/80 sm:max-w-[180px]"
          >
            <UserRound className="size-4 shrink-0" />
            <span className="truncate">{customer?.name ?? "Walk-in"}</span>
          </button>
          {onClose && (
            <button onClick={onClose} className="flex size-11 items-center justify-center rounded-xl hover:bg-muted lg:hidden" aria-label="Close cart">
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto scrollbar-thin p-2.5 min-[800px]:p-3">
        {items.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Cart is empty</p>
            <p className="mt-1 max-w-[220px]">Scan a barcode or tap a product to start a sale.</p>
            <p className="mt-3 hidden font-mono text-[11px] sm:block">F1 search · F2 customer · F8 pay</p>
          </div>
        )}
        {items.map((item) => (
          <CartItemRow key={item.id} item={item} />
        ))}
      </div>

      <div className="shrink-0 border-t border-border p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] min-[800px]:p-4 [@media(max-height:760px)]:p-2.5">
        <dl className="hidden space-y-1 text-sm [@media(min-height:900px)]:block">
          <Row label="Subtotal" value={formatPKR(totals.subtotal)} />
          <Row label="Item Discount" value={`- ${formatPKR(totals.itemDiscount)}`} />
          <Row label="Order Discount" value={`- ${formatPKR(totals.orderDiscount)}`} />
          <Row label="Tax" value={formatPKR(totals.tax)} />
          <Row label="Round Off" value={formatPKR(totals.roundOff)} />
        </dl>
        <div className="mt-2 flex items-end justify-between gap-3 rounded-2xl bg-primary px-3 py-2.5 text-primary-foreground min-[800px]:px-4 min-[800px]:py-3 [@media(min-height:900px)]:mt-3">
          <span className="text-sm font-medium opacity-90">TOTAL</span>
          <span className="truncate text-xl font-semibold tracking-tight tabular-nums min-[800px]:text-2xl [@media(min-height:900px)]:text-3xl">{formatPKR(totals.grandTotal)}</span>
        </div>
        <div className="mt-2 grid grid-cols-4 gap-1.5 min-[800px]:mt-3 min-[800px]:gap-2">
          <Button variant="secondary" className="h-12 min-h-12 flex-col px-1 text-[11px] min-[800px]:h-14" onClick={onHold} disabled={!items.length}>
            <Pause className="size-4" />
            Hold
          </Button>
          <Button variant="secondary" className="h-12 min-h-12 flex-col px-1 text-[11px] min-[800px]:h-14" onClick={() => setDiscOpen(true)} disabled={!items.length}>
            <Percent className="size-4" />
            Discount
          </Button>
          <Button variant="secondary" className="h-12 min-h-12 flex-col px-1 text-[11px] min-[800px]:h-14" onClick={onCustomer}>
            <UserRound className="size-4" />
            Customer
          </Button>
          <Button variant="outline" className="h-12 min-h-12 flex-col px-1 text-[11px] min-[800px]:h-14" onClick={() => setClearOpen(true)} disabled={!items.length}>
            <Trash2 className="size-4" />
            Clear
          </Button>
        </div>
        <Button size="xl" className="mt-2 h-12 min-h-12 w-full text-base min-[800px]:h-14" disabled={!items.length} onClick={onPay}>
          <Wallet className="size-5" />
          Pay Now
        </Button>
      </div>

      <Dialog open={discOpen} onClose={() => setDiscOpen(false)} title="Order discount">
        <div className="flex gap-2">
          <Button variant={discType === "amount" ? "default" : "outline"} onClick={() => setDiscType("amount")}>
            Rs.
          </Button>
          <Button variant={discType === "percent" ? "default" : "outline"} onClick={() => setDiscType("percent")}>
            %
          </Button>
        </div>
        <Input className="mt-3" value={discVal} onChange={(e) => setDiscVal(e.target.value)} placeholder="0" />
        <Button
          className="mt-4 w-full"
          onClick={() => {
            setOrderDiscount(Number(discVal) || 0, discType);
            toast.success("Discount applied");
            setDiscOpen(false);
          }}
        >
          Apply
        </Button>
      </Dialog>

      <ConfirmDialog
        open={clearOpen}
        onClose={() => setClearOpen(false)}
        title="Clear cart?"
        description="This will remove all items from the current sale."
        confirmLabel="Clear cart"
        destructive
        onConfirm={() => {
          clear();
          toast("Cart cleared");
        }}
      />
    </aside>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 text-muted-foreground">
      <dt>{label}</dt>
      <dd className="truncate tabular-nums text-foreground">{value}</dd>
    </div>
  );
}
