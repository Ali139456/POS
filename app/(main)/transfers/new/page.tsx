"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TopHeader } from "@/components/layout/top-header";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/badge";
import { Input, Label, Select } from "@/components/ui/input";
import { useWarehouseProducts } from "@/lib/hooks/use-scoped-data";
import { useOrgStore } from "@/lib/store/org-store";
import { useCurrentEmployee } from "@/lib/store/app-store";
import { WAREHOUSE_LOCATION_ID } from "@/lib/mock/org-seed";

export default function NewTransferPage() {
  const router = useRouter();
  const employee = useCurrentEmployee();
  const stores = useOrgStore((s) => s.childStores);
  const createTransfer = useOrgStore((s) => s.createTransfer);
  const dispatchTransfer = useOrgStore((s) => s.dispatchTransfer);
  const products = useWarehouseProducts();
  const [storeId, setStoreId] = useState(stores[0]?.id ?? "");
  const [lines, setLines] = useState<Record<string, number>>({});
  const [dispatchNow, setDispatchNow] = useState(true);

  const store = stores.find((s) => s.id === storeId);

  function submit() {
    if (!store) return;
    const items = Object.entries(lines)
      .filter(([, qty]) => qty > 0)
      .map(([productId, qty]) => {
        const p = products.find((x) => x.id === productId)!;
        return { id: "", productId, productName: p.name, sentQuantity: qty, receivedQuantity: 0 };
      });
    if (!items.length) {
      toast.error("Add at least one product quantity");
      return;
    }
    const tr = createTransfer({
      fromLocationId: WAREHOUSE_LOCATION_ID,
      toLocationId: store.locationId,
      toStoreId: store.id,
      toStoreName: store.name,
      items,
      createdById: employee.id,
      createdByName: employee.name,
    });
    if (dispatchNow) dispatchTransfer(tr.id, employee.id, employee.name);
    toast.success(dispatchNow ? "Transfer created and dispatched" : "Transfer saved as draft");
    router.push(`/transfers/${tr.id}`);
  }

  return (
    <>
      <TopHeader title="New Transfer" />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-6">
        <PageHeader title="Create Transfer" description="Move stock from Central Warehouse to a child store" />
        <Card className="mt-4 space-y-4 p-4">
          <div>
            <Label>Destination store</Label>
            <Select value={storeId} onChange={(e) => setStoreId(e.target.value)}>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            {products.slice(0, 15).map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-2 rounded-xl border border-border p-3">
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">Warehouse available: {p.stock}</p>
                </div>
                <Input
                  type="number"
                  min={0}
                  placeholder="Qty"
                  value={lines[p.id] ?? ""}
                  onChange={(e) => setLines((s) => ({ ...s, [p.id]: Number(e.target.value) || 0 }))}
                  className="w-24"
                />
              </div>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={dispatchNow} onChange={(e) => setDispatchNow(e.target.checked)} />
            Dispatch immediately (deduct warehouse stock)
          </label>
          <div className="flex gap-2">
            <Button onClick={submit}>Create transfer</Button>
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}
