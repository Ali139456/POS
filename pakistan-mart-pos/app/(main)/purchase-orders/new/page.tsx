"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TopHeader } from "@/components/layout/top-header";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/badge";
import { Input, Label, Select } from "@/components/ui/input";
import { useAppStore } from "@/lib/store/app-store";
import { formatPKR, uid } from "@/lib/utils";
import { toast } from "sonner";
import type { PurchaseOrderItem } from "@/lib/types";

export default function NewPOPage() {
  const suppliers = useAppStore((s) => s.suppliers);
  const products = useAppStore((s) => s.products);
  const upsert = useAppStore((s) => s.upsertPO);
  const nextPO = useAppStore((s) => s.nextPO);
  const router = useRouter();
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id ?? "");
  const [date, setDate] = useState("2026-08-26");
  const [expected, setExpected] = useState("2026-08-30");
  const [items, setItems] = useState<PurchaseOrderItem[]>([]);
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [qty, setQty] = useState(10);
  const [discount, setDiscount] = useState(0);
  const subtotal = items.reduce((a, i) => a + i.quantity * i.cost, 0);
  const tax = 0;
  const total = Math.max(0, subtotal - discount + tax);

  return (
    <>
      <TopHeader title="New purchase order" />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-6">
        <PageHeader title="Create purchase order" />
        <Card className="mt-4 grid gap-3 p-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          <div>
            <Label>Supplier</Label>
            <Select className="mt-1" value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.company}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Date</Label>
            <Input className="mt-1" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <Label>Expected delivery</Label>
            <Input className="mt-1" type="date" value={expected} onChange={(e) => setExpected(e.target.value)} />
          </div>
        </Card>
        <Card className="mt-4 p-4">
          <div className="flex min-w-0 flex-wrap gap-2">
            <Select value={productId} onChange={(e) => setProductId(e.target.value)} className="w-full min-w-0 sm:max-w-xs">
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
            <Input className="w-full sm:w-24" type="number" value={qty} onChange={(e) => setQty(Number(e.target.value) || 0)} />
            <Button
              variant="outline"
              onClick={() => {
                const p = products.find((x) => x.id === productId);
                if (!p) return;
                setItems([...items, { id: uid("poi"), productId: p.id, name: p.name, quantity: qty, receivedQty: 0, cost: p.purchasePrice }]);
              }}
            >
              Add line
            </Button>
          </div>
          <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr>
                <th className="pb-2">Product</th>
                <th>Qty</th>
                <th>Cost</th>
                <th>Line</th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.id} className="border-t border-border">
                  <td className="py-2">{i.name}</td>
                  <td>{i.quantity}</td>
                  <td>{formatPKR(i.cost)}</td>
                  <td>{formatPKR(i.quantity * i.cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          <div className="mt-4 ml-auto max-w-xs space-y-2 text-sm">
            <p className="flex justify-between"><span>Subtotal</span><span>{formatPKR(subtotal)}</span></p>
            <div className="flex items-center justify-between gap-2">
              <span>Discount</span>
              <Input className="w-28" type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value) || 0)} />
            </div>
            <p className="flex justify-between"><span>Tax</span><span>{formatPKR(tax)}</span></p>
            <p className="flex justify-between font-semibold"><span>Total</span><span>{formatPKR(total)}</span></p>
          </div>
          <Button
            className="mt-4"
            onClick={() => {
              const supplier = suppliers.find((s) => s.id === supplierId);
              upsert({
                id: uid("po"),
                poNumber: nextPO(),
                supplierId,
                supplierName: supplier?.company ?? "",
                date: `${date}T00:00:00`,
                expectedDelivery: `${expected}T00:00:00`,
                items,
                subtotal,
                discount,
                tax,
                total,
                status: "Ordered",
              });
              toast.success("Purchase order created");
              router.push("/purchase-orders");
            }}
          >
            Save PO
          </Button>
        </Card>
      </div>
    </>
  );
}
