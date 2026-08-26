"use client";

import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { TopHeader } from "@/components/layout/top-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input, Label } from "@/components/ui/input";
import { useAppStore } from "@/lib/store/app-store";
import { formatDate, formatPKR } from "@/lib/utils";
import { toast } from "sonner";

export default function SupplierProfilePage() {
  const { id } = useParams<{ id: string }>();
  const supplier = useAppStore((s) => s.suppliers.find((x) => x.id === id));
  const purchaseOrders = useAppStore((s) => s.purchaseOrders);
  const supplierLedger = useAppStore((s) => s.supplierLedger);
  const allProducts = useAppStore((s) => s.products);
  const pos = useMemo(() => purchaseOrders.filter((p) => p.supplierId === id), [purchaseOrders, id]);
  const ledger = useMemo(() => supplierLedger.filter((l) => l.partyId === id), [supplierLedger, id]);
  const products = useMemo(() => allProducts.filter((p) => p.supplierId === id), [allProducts, id]);
  const pay = useAppStore((s) => s.recordSupplierPayment);
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  if (!supplier) return <p className="p-6">Supplier not found.</p>;

  return (
    <>
      <TopHeader title={supplier.company} />
      <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-4 p-3 sm:p-4 lg:p-6">
        <Card className="p-5">
          <h1 className="text-2xl font-semibold">{supplier.company}</h1>
          <p className="text-sm text-muted-foreground">
            {supplier.name} · {supplier.phone} · {supplier.whatsapp}
          </p>
          <p className="text-sm">{supplier.email}</p>
          <p className="text-sm text-muted-foreground">{supplier.address} · NTN {supplier.ntn}</p>
          <div className="mt-4 flex gap-2">
            <Button onClick={() => setOpen(true)}>Record payment</Button>
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="font-semibold">Purchase history</h2>
          {pos.map((p) => (
            <div key={p.id} className="flex justify-between border-t border-border py-2 text-sm">
              <span>{p.poNumber}</span>
              <span>{formatPKR(p.total)}</span>
              <span>{p.status}</span>
            </div>
          ))}
        </Card>
        <Card className="p-5">
          <h2 className="font-semibold">Payments / ledger</h2>
          {ledger.map((l) => (
            <div key={l.id} className="flex flex-wrap justify-between gap-2 border-t border-border py-2 text-sm">
              <span>{formatDate(l.date)}</span>
              <span className="min-w-0 truncate text-muted-foreground">{l.description}</span>
              <span className="tabular-nums">{formatPKR(l.balance)}</span>
            </div>
          ))}
        </Card>
        <Card className="p-5">
          <h2 className="font-semibold">Products supplied</h2>
          <p className="mt-2 text-sm text-muted-foreground">{products.map((p) => p.name).join(", ")}</p>
        </Card>
      </div>
      <Dialog open={open} onClose={() => setOpen(false)} title="Record supplier payment">
        <Label>Amount</Label>
        <Input className="mt-1" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <Button
          className="mt-4 w-full"
          onClick={() => {
            pay(supplier.id, Number(amount) || 0);
            toast.success("Payment recorded");
            setOpen(false);
          }}
        >
          Save
        </Button>
      </Dialog>
    </>
  );
}
