"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TopHeader } from "@/components/layout/top-header";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/badge";
import { Input, Label, Textarea } from "@/components/ui/input";
import { useScopedProducts } from "@/lib/hooks/use-scoped-data";
import { useOrgStore } from "@/lib/store/org-store";
import { useCurrentEmployee } from "@/lib/store/app-store";
import { stockStatus } from "@/lib/utils";

export default function NewStockRequestPage() {
  const router = useRouter();
  const employee = useCurrentEmployee();
  const store = useOrgStore((s) => s.childStores.find((x) => x.organizationId === employee.organizationId));
  const createStockRequest = useOrgStore((s) => s.createStockRequest);
  const products = useScopedProducts();
  const lowProducts = useMemo(
    () => products.filter((p) => stockStatus(p.stock, p.minStock) !== "In Stock" || p.stock <= p.minStock),
    [products],
  );
  const [selected, setSelected] = useState<Record<string, { qty: number; reason: string }>>({});
  const [notes, setNotes] = useState("");

  function toggle(productId: string, min: number, stock: number) {
    setSelected((s) => {
      const next = { ...s };
      if (next[productId]) delete next[productId];
      else next[productId] = { qty: Math.max(min * 2 - stock, min), reason: "Low stock" };
      return next;
    });
  }

  function submit() {
    if (!store) {
      toast.error("Store not found for your account");
      return;
    }
    const items = Object.entries(selected).map(([productId, v]) => {
      const p = products.find((x) => x.id === productId)!;
      return {
        id: "",
        productId,
        productName: p.name,
        currentStock: p.stock,
        minStock: p.minStock,
        requestedQuantity: v.qty,
        reason: v.reason,
      };
    });
    if (!items.length) {
      toast.error("Select at least one product");
      return;
    }
    const req = createStockRequest({
      storeId: store.id,
      items,
      notes,
      requestedById: employee.id,
      requestedByName: employee.name,
    });
    toast.success("Stock request submitted");
    router.push(`/stock-requests/${req.id}`);
  }

  return (
    <>
      <TopHeader title="New Stock Request" />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-6">
        <PageHeader title="Create Stock Request" description="Request stock from parent / central warehouse" />
        <Card className="mt-4 p-4">
          <p className="text-sm text-muted-foreground">Store: {store?.name ?? "—"}</p>
          <div className="mt-4 space-y-2">
            {(lowProducts.length ? lowProducts : products.slice(0, 12)).map((p) => (
              <div key={p.id} className="flex flex-col gap-2 rounded-xl border border-border p-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <label className="flex cursor-pointer items-start gap-2">
                    <input type="checkbox" checked={Boolean(selected[p.id])} onChange={() => toggle(p.id, p.minStock, p.stock)} className="mt-1" />
                    <span>
                      <span className="font-medium">{p.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        Current: {p.stock} · Min: {p.minStock}
                      </span>
                    </span>
                  </label>
                </div>
                {selected[p.id] && (
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min={1}
                      value={selected[p.id]!.qty}
                      onChange={(e) =>
                        setSelected((s) => ({ ...s, [p.id]: { ...s[p.id]!, qty: Number(e.target.value) || 0 } }))
                      }
                      className="w-24"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes for parent review" />
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={submit}>Submit request</Button>
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}
