"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowUpRight, Building2, ClipboardList, Package, ShoppingCart, TrendingUp, Truck, Warehouse } from "lucide-react";
import { StatCard } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/badge";
import { StockRequestStatusBadge, StockTransferStatusBadge } from "@/components/org/request-status-badge";
import { getLowStockAcrossStores, getParentDashboard } from "@/lib/services/parent-dashboard";
import { useOrgStore } from "@/lib/store/org-store";
import { formatPKR } from "@/lib/utils";

export function ParentDashboard() {
  const data = useMemo(() => getParentDashboard("all"), []);
  const requests = useOrgStore((s) => s.stockRequests);
  const transfers = useOrgStore((s) => s.stockTransfers);
  const lowStock = useMemo(() => getLowStockAcrossStores(), []);

  const recentRequests = requests.filter((r) => r.status === "PENDING" || r.status === "APPROVED").slice(0, 5);
  const recentTransfers = transfers.slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
        <StatCard label="Total Stores" value={String(data.totalStores)} icon={<Building2 className="size-4" />} />
        <StatCard label="Total Sales" value={formatPKR(data.totalSales)} icon={<TrendingUp className="size-4" />} />
        <StatCard label="Today's Sales" value={formatPKR(data.todaySales)} icon={<ShoppingCart className="size-4" />} />
        <StatCard label="Total Inventory" value={formatPKR(data.totalInventoryValue)} icon={<Package className="size-4" />} />
        <StatCard label="Low Stock Items" value={String(data.lowStockCount)} icon={<Warehouse className="size-4" />} />
        <StatCard label="Pending Requests" value={String(data.pendingRequests)} icon={<ClipboardList className="size-4" />} />
        <StatCard label="Pending Transfers" value={String(data.pendingTransfers)} icon={<Truck className="size-4" />} />
      </div>

      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-base font-semibold">Store Performance</h2>
          <Link href="/stores">
            <Button variant="outline" size="sm">View all</Button>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="pb-2 pr-3 font-medium">Store</th>
                <th className="pb-2 pr-3 font-medium">Today&apos;s Sales</th>
                <th className="pb-2 pr-3 font-medium">Orders</th>
                <th className="pb-2 pr-3 font-medium">Inventory</th>
                <th className="pb-2 font-medium">Low Stock</th>
              </tr>
            </thead>
            <tbody>
              {data.storeSummaries.map((s) => (
                <tr key={s.storeId} className="border-b border-border/60 last:border-0">
                  <td className="py-2.5 pr-3 font-medium">{s.storeName}</td>
                  <td className="py-2.5 pr-3">{formatPKR(s.todaySales)}</td>
                  <td className="py-2.5 pr-3">{s.todayOrders}</td>
                  <td className="py-2.5 pr-3">{formatPKR(s.inventoryValue)}</td>
                  <td className="py-2.5">{s.lowStockCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold">Recent Stock Requests</h2>
            <Link href="/stock-requests">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </div>
          {recentRequests.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No stock requests yet.</p>
          ) : (
            <div className="space-y-2">
              {recentRequests.map((r) => (
                <Link
                  key={r.id}
                  href={`/stock-requests/${r.id}`}
                  className="flex items-center justify-between gap-2 rounded-xl border border-border p-3 hover:bg-muted/50"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{r.requestNumber}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {r.storeName} · {r.requestedByName} · {r.items.length} items
                    </p>
                  </div>
                  <StockRequestStatusBadge status={r.status} />
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold">Recent Transfers</h2>
            <Link href="/transfers">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </div>
          {recentTransfers.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No transfers found.</p>
          ) : (
            <div className="space-y-2">
              {recentTransfers.map((t) => (
                <Link
                  key={t.id}
                  href={`/transfers/${t.id}`}
                  className="flex items-center justify-between gap-2 rounded-xl border border-border p-3 hover:bg-muted/50"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{t.transferNumber}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {t.fromLocationName} → {t.toStoreName} · {t.items.length} items
                    </p>
                  </div>
                  <StockTransferStatusBadge status={t.status} />
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">Low Stock Across Stores</h2>
          <Link href="/all-inventory">
            <Button variant="outline" size="sm">All inventory</Button>
          </Link>
        </div>
        {lowStock.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No low-stock products.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-2 pr-3 font-medium">Product</th>
                  <th className="pb-2 pr-3 font-medium">Store</th>
                  <th className="pb-2 pr-3 font-medium">Current</th>
                  <th className="pb-2 pr-3 font-medium">Minimum</th>
                  <th className="pb-2 pr-3 font-medium">Suggested</th>
                  <th className="pb-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.slice(0, 8).map((row) => (
                  <tr key={`${row.storeId}-${row.productId}`} className="border-b border-border/60 last:border-0">
                    <td className="py-2.5 pr-3">{row.productName}</td>
                    <td className="py-2.5 pr-3">{row.storeName}</td>
                    <td className="py-2.5 pr-3">{row.currentStock}</td>
                    <td className="py-2.5 pr-3">{row.minStock}</td>
                    <td className="py-2.5 pr-3">{row.suggestedQuantity}</td>
                    <td className="py-2.5">
                      <Link href="/stock-requests/new">
                        <Button variant="ghost" size="sm">
                          Request
                          <ArrowUpRight className="size-3.5" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
