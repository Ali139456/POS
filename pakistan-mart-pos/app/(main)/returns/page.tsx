"use client";

import { useMemo, useState } from "react";
import { TopHeader } from "@/components/layout/top-header";
import { PageHeader } from "@/components/shared/page-header";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store/app-store";
import { formatPKR, uid } from "@/lib/utils";
import type { RefundMethod, ReturnReason } from "@/lib/types";
import { toast } from "sonner";

export default function ReturnsPage() {
  const sales = useAppStore((s) => s.sales);
  const returns = useAppStore((s) => s.returns);
  const addReturn = useAppStore((s) => s.addReturn);
  const nextReturn = useAppStore((s) => s.nextReturn);
  const [q, setQ] = useState("");
  const sale = sales.find((s) => s.invoiceNumber.toLowerCase() === q.trim().toLowerCase() || s.id === q);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [reason, setReason] = useState<ReturnReason>("Damaged");
  const [method, setMethod] = useState<RefundMethod>("Cash");

  const selected = useMemo(() => sale?.items.filter((i) => (qty[i.id] ?? 0) > 0) ?? [], [sale, qty]);
  const total = selected.reduce((a, i) => a + i.unitPrice * (qty[i.id] ?? 0), 0);

  return (
    <>
      <TopHeader title="Returns" />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-6">
        <PageHeader title="Returns / refunds" description="Search an invoice, barcode or customer ticket" />
        <Card className="mt-4 p-4">
          <Label>Invoice number</Label>
          <Input className="mt-1 max-w-sm" value={q} onChange={(e) => setQ(e.target.value)} placeholder="INV-2026-00105" />
        </Card>
        {sale && (
          <Card className="mt-4 p-4">
            <p className="font-semibold">
              {sale.invoiceNumber} · {sale.customerName}
            </p>
            <div className="mt-3 space-y-2">
              {sale.items.map((i) => (
                <div key={i.id} className="flex flex-col gap-2 rounded-xl border border-border px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{i.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Sold {i.quantity} · {formatPKR(i.unitPrice)}
                    </p>
                  </div>
                  <Input
                    className="w-full sm:w-24"
                    type="number"
                    min={0}
                    max={i.quantity}
                    value={qty[i.id] ?? 0}
                    onChange={(e) => setQty({ ...qty, [i.id]: Number(e.target.value) || 0 })}
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Reason</Label>
                <Select className="mt-1" value={reason} onChange={(e) => setReason(e.target.value as ReturnReason)}>
                  {["Damaged", "Wrong Product", "Expired", "Customer Changed Mind", "Other"].map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Refund method</Label>
                <Select className="mt-1" value={method} onChange={(e) => setMethod(e.target.value as RefundMethod)}>
                  {["Cash", "Store Credit", "Original Payment Method"].map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-lg font-semibold">Refund {formatPKR(total)}</p>
              <Button
                disabled={!selected.length}
                onClick={() => {
                  addReturn({
                    id: uid("ret"),
                    returnNumber: nextReturn(),
                    saleId: sale.id,
                    invoiceNumber: sale.invoiceNumber,
                    date: new Date().toISOString(),
                    customerId: sale.customerId,
                    customerName: sale.customerName,
                    cashierName: sale.cashierName,
                    items: selected.map((i) => ({
                      id: uid("ri"),
                      productId: i.productId,
                      name: i.name,
                      quantity: qty[i.id] ?? 0,
                      unitPrice: i.unitPrice,
                      total: i.unitPrice * (qty[i.id] ?? 0),
                    })),
                    reason,
                    refundMethod: method,
                    total,
                  });
                  toast.success("Return recorded");
                  setQty({});
                }}
              >
                Process return
              </Button>
            </div>
          </Card>
        )}
        <Card className="mt-4 p-4">
          <h2 className="font-semibold">Return history</h2>
          <table className="mt-3 w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr>
                <th className="pb-2">Return</th>
                <th>Invoice</th>
                <th>Customer</th>
                <th>Reason</th>
                <th>Method</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {returns.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="py-2">{r.returnNumber}</td>
                  <td>{r.invoiceNumber}</td>
                  <td>{r.customerName}</td>
                  <td>{r.reason}</td>
                  <td>{r.refundMethod}</td>
                  <td>{formatPKR(r.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </>
  );
}
