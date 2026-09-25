"use client";

import { useMemo, useState } from "react";
import { TopHeader } from "@/components/layout/top-header";
import { PageHeader, StatCard, EmptyState } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/badge";
import { StockBadge } from "@/components/shared/status-badge";
import { useWarehouseProducts } from "@/lib/hooks/use-scoped-data";
import { useIsParentUser } from "@/lib/store/org-store";
import { formatPKR, stockStatus } from "@/lib/utils";
import Link from "next/link";
import { PackageSearch } from "lucide-react";

export default function CentralInventoryPage() {
  const isParent = useIsParentUser();
  const products = useWarehouseProducts();
  const [q, setQ] = useState("");

  const rows = useMemo(
    () => products.filter((p) => `${p.name} ${p.sku}`.toLowerCase().includes(q.toLowerCase())),
    [products, q],
  );

  const value = products.reduce((a, p) => a + p.stock * p.purchasePrice, 0);
  const low = products.filter((p) => stockStatus(p.stock, p.minStock) === "Low Stock").length;
  const out = products.filter((p) => p.stock <= 0).length;
  const units = products.reduce((a, p) => a + p.stock, 0);

  if (!isParent) {
    return (
      <>
        <TopHeader title="Central Inventory" />
        <div className="flex-1 p-6">
          <EmptyState title="Access restricted" description="Central warehouse inventory is for parent administrators." />
        </div>
      </>
    );
  }

  return (
    <>
      <TopHeader title="Central Inventory" />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-6">
        <PageHeader
          title="Central Warehouse"
          description="Master stock available for distribution to child stores"
          actions={
            <Link href="/transfers/new">
              <Button>Create transfer</Button>
            </Link>
          }
        />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard label="Total Products" value={String(products.length)} icon={<PackageSearch className="size-4" />} />
          <StatCard label="Total Units" value={String(Math.round(units))} />
          <StatCard label="Inventory Value" value={formatPKR(value)} />
          <StatCard label="Low Stock" value={String(low)} />
          <StatCard label="Out of Stock" value={String(out)} />
        </div>
        <Card className="mt-4 p-4">
          <SearchInput value={q} onChange={setQ} placeholder="Search warehouse stock" className="max-w-sm" />
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-2 pr-3 font-medium">Product</th>
                  <th className="pb-2 pr-3 font-medium">Available</th>
                  <th className="pb-2 pr-3 font-medium">Reserved</th>
                  <th className="pb-2 pr-3 font-medium">Total</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id} className="border-b border-border/60">
                    <td className="py-2.5 pr-3">{p.name}</td>
                    <td className="py-2.5 pr-3">{p.stock - p.reserved}</td>
                    <td className="py-2.5 pr-3">{p.reserved}</td>
                    <td className="py-2.5 pr-3">{p.stock}</td>
                    <td className="py-2.5">
                      <StockBadge stock={p.stock} min={p.minStock} max={p.maxStock} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No products match your search.</p>}
        </Card>
      </div>
    </>
  );
}
