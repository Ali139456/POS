"use client";

import { useMemo, useState } from "react";
import { TopHeader } from "@/components/layout/top-header";
import { PageHeader, EmptyState } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { Card } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store/app-store";
import { useOrgStore, useIsParentUser } from "@/lib/store/org-store";
import { WAREHOUSE_LOCATION_ID } from "@/lib/mock/org-seed";
import { stockStatus } from "@/lib/utils";

export default function AllInventoryPage() {
  const isParent = useIsParentUser();
  const products = useAppStore((s) => s.products);
  const balances = useOrgStore((s) => s.inventoryBalances);
  const stores = useOrgStore((s) => s.childStores);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "low" | "out">("all");

  const matrix = useMemo(() => {
    return products
      .filter((p) => `${p.name} ${p.sku}`.toLowerCase().includes(q.toLowerCase()))
      .map((p) => {
        const warehouse = balances
          .filter((b) => b.locationId === WAREHOUSE_LOCATION_ID && b.productId === p.id)
          .reduce((a, b) => a + b.stock, 0);
        const storeStocks: Record<string, number> = {};
        let total = warehouse;
        for (const store of stores) {
          const stock = balances
            .filter((b) => b.locationId === store.locationId && b.productId === p.id)
            .reduce((a, b) => a + b.stock, 0);
          storeStocks[store.id] = stock;
          total += stock;
        }
        const minStock = p.minStock;
        const lowest = Math.min(warehouse, ...Object.values(storeStocks));
        return { product: p, warehouse, storeStocks, total, lowest, minStock };
      })
      .filter((row) => {
        if (filter === "low") return row.lowest <= row.minStock;
        if (filter === "out") return row.total <= 0;
        return true;
      });
  }, [products, balances, stores, q, filter]);

  if (!isParent) {
    return (
      <>
        <TopHeader title="All Inventory" />
        <div className="flex-1 p-6">
          <EmptyState title="Access restricted" description="Cross-store inventory view is for parent administrators." />
        </div>
      </>
    );
  }

  return (
    <>
      <TopHeader title="All Inventory" />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-6">
        <PageHeader title="All Stores Inventory" description="Warehouse and retail stock by location" />
        <Card className="mt-4 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchInput value={q} onChange={setQ} placeholder="Search product" className="max-w-sm" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
              className="h-10 rounded-xl border border-border bg-card px-3 text-sm"
            >
              <option value="all">All products</option>
              <option value="low">Low stock</option>
              <option value="out">Out of stock</option>
            </select>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="p-2 font-medium">Product</th>
                  <th className="p-2 font-medium">Warehouse</th>
                  {stores.map((s) => (
                    <th key={s.id} className="p-2 font-medium">
                      {s.name.replace("Al-Noor ", "")}
                    </th>
                  ))}
                  <th className="p-2 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {matrix.map((row) => (
                  <tr key={row.product.id} className="border-b border-border/60">
                    <td className="p-2 font-medium">{row.product.name}</td>
                    <td className="p-2">{row.warehouse}</td>
                    {stores.map((s) => (
                      <td key={s.id} className={`p-2 ${stockStatus(row.storeStocks[s.id] ?? 0, row.minStock) !== "In Stock" ? "text-amber-700 dark:text-amber-400" : ""}`}>
                        {row.storeStocks[s.id] ?? 0}
                      </td>
                    ))}
                    <td className="p-2 font-medium">{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {matrix.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No low-stock products.</p>}
        </Card>
      </div>
    </>
  );
}
