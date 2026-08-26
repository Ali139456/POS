"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { cartTotals, usePosStore, WALK_IN } from "@/lib/store/pos-store";
import { useAppStore, useCurrentEmployee } from "@/lib/store/app-store";
import { formatPKR, uid } from "@/lib/utils";
import type { PaymentMethod, PaymentSplit, Sale } from "@/lib/types";
import { ReceiptPreview } from "@/components/pos/receipt-preview";

const QUICK = [500, 1000, 2000, 5000, 10000];
const METHODS: PaymentMethod[] = ["Cash", "Card", "Bank Transfer", "EasyPaisa", "JazzCash", "Customer Credit"];

export function PaymentDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const items = usePosStore((s) => s.items);
  const customerId = usePosStore((s) => s.customerId);
  const orderDiscount = usePosStore((s) => s.orderDiscount);
  const orderDiscountType = usePosStore((s) => s.orderDiscountType);
  const clear = usePosStore((s) => s.clear);
  const customers = useAppStore((s) => s.customers);
  const products = useAppStore((s) => s.products);
  const addSale = useAppStore((s) => s.addSale);
  const nextInvoice = useAppStore((s) => s.nextInvoice);
  const enabled = useAppStore((s) => s.paymentMethods);
  const employee = useCurrentEmployee();
  const customer = customers.find((c) => c.id === customerId);
  const totals = cartTotals(items, orderDiscount, orderDiscountType);
  const [method, setMethod] = useState<PaymentMethod>("Cash");
  const [received, setReceived] = useState(String(totals.grandTotal));
  const [reference, setReference] = useState("");
  const [split, setSplit] = useState(false);
  const [splits, setSplits] = useState<PaymentSplit[]>([
    { method: "Cash", amount: 0 },
    { method: "JazzCash", amount: 0 },
  ]);
  const [done, setDone] = useState<Sale | null>(null);

  const change = Math.max(0, (Number(received) || 0) - totals.grandTotal);
  const splitTotal = splits.reduce((a, s) => a + (Number(s.amount) || 0), 0);

  const methods = useMemo(() => enabled.filter((m) => m.enabled && m.id !== "Split").map((m) => m.id), [enabled]);

  function complete(payments: PaymentSplit[]) {
    if (!items.length) return;
    const invoiceNumber = nextInvoice();
    const sale: Sale = {
      id: uid("sale"),
      invoiceNumber,
      date: new Date().toISOString(),
      customerId,
      customerName: customer?.name ?? "Walk-in Customer",
      cashierId: employee.id,
      cashierName: employee.name,
      items: items.map((i) => {
        const product = products.find((p) => p.id === i.productId);
        const cost = (product?.purchasePrice ?? i.unitPrice * 0.8) * i.quantity;
        return {
          id: uid("si"),
          productId: i.productId,
          variantId: i.variantId,
          name: i.name,
          variantName: i.variantName,
          quantity: i.quantity,
          unit: i.unit,
          unitPrice: i.unitPrice,
          discount: i.discount,
          total: i.unitPrice * i.quantity - i.discount,
          cost,
        };
      }),
      subtotal: totals.subtotal,
      itemDiscount: totals.itemDiscount,
      orderDiscount: totals.orderDiscount,
      tax: totals.tax,
      previousBalance: 0,
      roundOff: totals.roundOff,
      total: totals.grandTotal,
      paymentMethod: payments.length > 1 ? "Split" : payments[0]!.method,
      payments,
      status: "Completed",
    };
    addSale(sale);
    if (payments.some((p) => p.method === "Customer Credit") && customerId !== WALK_IN) {
      useAppStore.getState().addLedgerEntry("customer", {
        id: uid("cl"),
        partyId: customerId,
        date: sale.date,
        invoice: invoiceNumber,
        description: "Credit sale",
        debit: payments.filter((p) => p.method === "Customer Credit").reduce((a, p) => a + p.amount, 0),
        credit: 0,
        balance: (customer?.creditBalance ?? 0) + payments.filter((p) => p.method === "Customer Credit").reduce((a, p) => a + p.amount, 0),
      });
    }
    setDone(sale);
    toast.success("Sale completed successfully");
  }

  function resetAndClose() {
    setDone(null);
    setMethod("Cash");
    setSplit(false);
    setReference("");
    clear();
    onClose();
  }

  if (done) {
    return (
      <Dialog open={open} onClose={resetAndClose} title="Payment Successful ✓" description={done.invoiceNumber} wide sheet>
        <ReceiptPreview sale={done} />
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={() => window.print()}>Print Receipt</Button>
          <Button variant="outline" onClick={() => toast.success("Receipt downloaded")}>
            Download Receipt
          </Button>
          <Button variant="outline" onClick={() => toast.success("Opened WhatsApp")}>
            WhatsApp Receipt
          </Button>
          <Button variant="outline" onClick={() => toast.success("Email queued")}>
            Email Receipt
          </Button>
          <Button variant="secondary" onClick={resetAndClose}>
            New Sale
          </Button>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} title="Take payment" description={`Grand total ${formatPKR(totals.grandTotal)}`} wide sheet>
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <p className="text-3xl font-semibold tracking-tight sm:text-4xl lg:hidden">{formatPKR(totals.grandTotal)}</p>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap lg:mt-0">
            {methods.map((m) => (
              <Button
                key={m}
                variant={!split && method === m ? "default" : "outline"}
                className="min-h-11"
                onClick={() => {
                  setSplit(false);
                  setMethod(m);
                  if (m === "Cash") setReceived(String(totals.grandTotal));
                }}
              >
                {m}
              </Button>
            ))}
            <Button variant={split ? "default" : "outline"} className="min-h-11" onClick={() => setSplit(true)}>
              Split Payment
            </Button>
          </div>

          {!split && method === "Cash" && (
            <div className="mt-4 space-y-3">
              <Label>Amount received</Label>
              <Input value={received} onChange={(e) => setReceived(e.target.value)} className="h-12 text-lg" />
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
                <Button variant="secondary" className="min-h-11" onClick={() => setReceived(String(totals.grandTotal))}>
                  Exact
                </Button>
                {QUICK.map((n) => (
                  <Button key={n} variant="outline" className="min-h-11" onClick={() => setReceived(String(n))}>
                    {formatPKR(n)}
                  </Button>
                ))}
              </div>
              <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm dark:bg-emerald-950/40">
                Change: <span className="text-lg font-semibold">{formatPKR(change)}</span>
              </div>
            </div>
          )}

          {!split && method !== "Cash" && (
            <div className="mt-4">
              <Label>Transaction / reference number (optional)</Label>
              <Input className="mt-1" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g. JC-882341" />
            </div>
          )}

          {split && (
            <div className="mt-4 space-y-3">
              {splits.map((s, idx) => (
                <div key={idx} className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <select
                    className="h-11 w-full rounded-xl border border-input bg-card px-3 text-sm"
                    value={s.method}
                    onChange={(e) =>
                      setSplits(splits.map((x, i) => (i === idx ? { ...x, method: e.target.value as PaymentMethod } : x)))
                    }
                  >
                    {METHODS.map((m) => (
                      <option key={m}>{m}</option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    value={s.amount || ""}
                    onChange={(e) =>
                      setSplits(splits.map((x, i) => (i === idx ? { ...x, amount: Number(e.target.value) || 0 } : x)))
                    }
                  />
                </div>
              ))}
              <p className={`text-sm ${splitTotal === totals.grandTotal ? "text-success" : "text-warning"}`}>
                Split total {formatPKR(splitTotal)} / {formatPKR(totals.grandTotal)}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col rounded-2xl border border-border bg-muted/40 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Payment summary</p>
          <p className="mt-2 hidden text-3xl font-semibold tracking-tight lg:block">{formatPKR(totals.grandTotal)}</p>
          <dl className="mt-3 space-y-1.5 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Items</dt>
              <dd className="tabular-nums">{totals.itemCount}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="tabular-nums">{formatPKR(totals.subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Discount</dt>
              <dd className="tabular-nums">- {formatPKR(totals.itemDiscount + totals.orderDiscount)}</dd>
            </div>
            <div className="flex justify-between gap-3 font-semibold">
              <dt>Grand total</dt>
              <dd className="truncate tabular-nums">{formatPKR(totals.grandTotal)}</dd>
            </div>
          </dl>
          <Button
            size="lg"
            className="mt-6 min-h-12 w-full lg:mt-auto"
            onClick={() => {
              if (split) {
                if (splitTotal !== totals.grandTotal) {
                  toast.error("Split amounts must equal the grand total");
                  return;
                }
                complete(splits.filter((s) => s.amount > 0));
                return;
              }
              if (method === "Cash" && (Number(received) || 0) < totals.grandTotal) {
                toast.error("Amount received is less than total");
                return;
              }
              complete([{ method, amount: totals.grandTotal, reference: reference || undefined }]);
            }}
          >
            Complete Sale
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
