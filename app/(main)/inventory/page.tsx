"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TopHeader } from "@/components/layout/top-header";
import { PageHeader, StatCard } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/badge";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { StockBadge } from "@/components/shared/status-badge";
import { useAppStore } from "@/lib/store/app-store";
import { daysUntil, formatPKR, stockStatus } from "@/lib/utils";
import type { AdjustmentType } from "@/lib/types";
import { toast } from "sonner";

const TYPES: AdjustmentType[] = ["Stock In", "Stock Out", "Damage", "Expired", "Lost", "Correction", "Personal Use", "Other"];

export default function InventoryPage() {
  const products = useAppStore((s) => s.products);
  const categories = useAppStore((s) => s.categories);
  const movements = useAppStore((s) => s.movements);
  const adjustStock = useAppStore((s) => s.adjustStock);
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [type, setType] = useState<AdjustmentType>("Stock In");
  const [qty, setQty] = useState(1);
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  const value = products.reduce((a, p) => a + p.stock * p.purchasePrice, 0);
  const low = products.filter((p) => stockStatus(p.stock, p.minStock) === "Low Stock").length;
  const out = products.filter((p) => p.stock <= 0).length;
  const expiring = products.filter((p) => {
    const d = daysUntil(p.expiryDate);
    return d !== null && d <= 30;
  }).length;

  const rows = useMemo(
    () => products.filter((p) => `${p.name} ${p.sku}`.toLowerCase().includes(q.toLowerCase())),
    [products, q],
  );
  const current = products.find((p) => p.id === productId);

  return (
    <>
      <TopHeader title="Inventory" />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-6">
        <PageHeader
          title="Inventory"
          description="Stock value, movements and adjustments"
          actions={
            <>
              <Button variant="outline" onClick={() => router.push("/inventory/expiry")}>
                Expiry
              </Button>
              <Button onClick={() => setOpen(true)}>Adjust stock</Button>
            </>
          }
        />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard label="Inventory Value" value={formatPKR(value)} />
          <StatCard label="Total Products" value={String(products.length)} />
          <StatCard label="Low Stock" value={String(low)} />
          <StatCard label="Out of Stock" value={String(out)} />
          <StatCard label="Expiring Soon" value={String(expiring)} />
        </div>
        <Card className="mt-4 p-4">
          <SearchInput value={q} onChange={setQ} placeholder="Search inventory" className="w-full max-w-sm" />
          <div className="mt-3 space-y-2 md:hidden">
            {rows.map((p) => (
              <div key={p.id} className="rounded-xl border border-border p-3">
                <p className="truncate font-medium">{p.name}</p>
                <p className="truncate text-xs text-muted-foreground">{p.sku} · {categories.find((c) => c.id === p.categoryId)?.name}</p>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm">Stock {p.stock}</span>
                  <StockBadge stock={p.stock} min={p.minStock} max={p.maxStock} />
                </div>
                <p className="mt-1 text-sm font-semibold tabular-nums">{formatPKR(p.stock * p.purchasePrice)}</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2 min-h-10 w-full"
                  onClick={() => {
                    setProductId(p.id);
                    setOpen(true);
                  }}
                >
                  Adjust
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-3 hidden overflow-x-auto md:block">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="text-left text-xs text-muted-foreground">
                <tr>
                  {["Product", "SKU", "Category", "Available", "Reserved", "Min", "Purchase", "Value", "Status", ""].map((h, i) => (
                    <th key={i} className="pb-2 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id} className="border-t border-border">
                    <td className="max-w-[200px] truncate py-2.5 font-medium">{p.name}</td>
                    <td className="font-mono text-xs">{p.sku}</td>
                    <td>{categories.find((c) => c.id === p.categoryId)?.name}</td>
                    <td>{p.stock}</td>
                    <td>{p.reserved}</td>
                    <td>{p.minStock}</td>
                    <td>{formatPKR(p.purchasePrice)}</td>
                    <td>{formatPKR(p.stock * p.purchasePrice)}</td>
                    <td>
                      <StockBadge stock={p.stock} min={p.minStock} max={p.maxStock} />
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setProductId(p.id);
                          setOpen(true);
                        }}
                      >
                        Adjust
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card className="mt-4 p-4">
          <h2 className="font-semibold">Movement history</h2>
          <div className="mt-3 space-y-2 md:hidden">
            {movements.map((m) => (
              <div key={m.id} className="rounded-xl border border-border p-3 text-sm">
                <p className="truncate font-medium">{m.productName}</p>
                <p className="text-xs text-muted-foreground">{m.date.slice(0, 16).replace("T", " ")} · {m.type}</p>
                <p className="mt-1">{m.quantity} · {m.previousStock} → {m.newStock}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground">
                <tr>
                  <th className="pb-2">Date</th>
                  <th>Product</th>
                  <th>Type</th>
                  <th>Qty</th>
                  <th>Stock</th>
                  <th>Reason</th>
                  <th>By</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr key={m.id} className="border-t border-border">
                    <td className="py-2">{m.date.slice(0, 16).replace("T", " ")}</td>
                    <td>{m.productName}</td>
                    <td>{m.type}</td>
                    <td>{m.quantity}</td>
                    <td>
                      {m.previousStock} → {m.newStock}
                    </td>
                    <td>{m.reason}</td>
                    <td>{m.employeeName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
      <Dialog open={open} onClose={() => setOpen(false)} title="Stock adjustment" description="Record inbound, damage, expiry and corrections">
        <div className="space-y-3">
          <div>
            <Label>Product</Label>
            <Select className="mt-1" value={productId} onChange={(e) => setProductId(e.target.value)}>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
            <p className="mt-1 text-xs text-muted-foreground">Current stock: {current?.stock ?? 0}</p>
          </div>
          <div>
            <Label>Type</Label>
            <Select className="mt-1" value={type} onChange={(e) => setType(e.target.value as AdjustmentType)}>
              {TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Quantity</Label>
            <Input className="mt-1" type="number" value={qty} onChange={(e) => setQty(Number(e.target.value) || 0)} />
          </div>
          <div>
            <Label>Reason</Label>
            <Input className="mt-1" value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <Button
            className="w-full"
            onClick={() => {
              adjustStock(productId, type, qty, reason || type, notes);
              toast.success("Inventory adjusted");
              setOpen(false);
            }}
          >
            Save adjustment
          </Button>
        </div>
      </Dialog>
    </>
  );
}
