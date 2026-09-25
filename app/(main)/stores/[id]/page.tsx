"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { TopHeader } from "@/components/layout/top-header";
import { PageHeader, StatCard, EmptyState } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { StockRequestStatusBadge, StockTransferStatusBadge } from "@/components/org/request-status-badge";
import { useOrgStore, useIsParentUser } from "@/lib/store/org-store";
import { useAppStore } from "@/lib/store/app-store";
import { computeStoreSummaries } from "@/lib/services/parent-dashboard";
import { formatDateTime, formatPKR } from "@/lib/utils";

const TABS = ["Overview", "Inventory", "Sales", "Stock Requests", "Transfers", "Activity"] as const;

export default function StoreDetailPage() {
  const { id = "" } = useParams<{ id: string }>();
  const isParent = useIsParentUser();
  const store = useOrgStore((s) => s.childStores.find((x) => x.id === id));
  const requests = useOrgStore((s) => s.stockRequests.filter((r) => r.storeId === id));
  const transfers = useOrgStore((s) => s.stockTransfers.filter((t) => t.toStoreId === id));
  const activity = useOrgStore((s) => s.activityLog.filter((a) => a.storeId === id));
  const products = useAppStore((s) => s.products);
  const balances = useOrgStore((s) => s.inventoryBalances);
  const sales = useAppStore((s) => s.sales.filter((s) => s.organizationId === store?.organizationId));
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  const summary = useMemo(() => computeStoreSummaries().find((s) => s.storeId === id), [id]);

  if (!isParent || !store) {
    return (
      <>
        <TopHeader title="Store" />
        <div className="flex-1 p-6">
          <EmptyState title="Store not found" description="This store does not exist or you do not have access." />
        </div>
      </>
    );
  }

  const storeBalances = balances.filter((b) => b.locationId === store.locationId);

  return (
    <>
      <TopHeader title={store.name} />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-6">
        <PageHeader
          title={store.name}
          description={`${store.location} · Manager: ${store.managerName}`}
          actions={
            <Link href="/stores">
              <Button variant="outline">Back to stores</Button>
            </Link>
          }
        />

        <div className="mt-4 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <Button key={t} variant={tab === t ? "default" : "outline"} size="sm" onClick={() => setTab(t)}>
              {t}
            </Button>
          ))}
        </div>

        {tab === "Overview" && (
          <div className="mt-4 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Today's Sales" value={formatPKR(summary?.todaySales ?? 0)} />
              <StatCard label="Orders" value={String(summary?.todayOrders ?? 0)} />
              <StatCard label="Inventory Value" value={formatPKR(summary?.inventoryValue ?? 0)} />
              <StatCard label="Low Stock" value={String(summary?.lowStockCount ?? 0)} />
            </div>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Phone: {store.phone}</p>
              <p className="mt-1 text-sm">
                Status: <StatusBadge status={store.status} />
              </p>
            </Card>
          </div>
        )}

        {tab === "Inventory" && (
          <Card className="mt-4 overflow-x-auto p-0">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-left">
                  <th className="p-3">Product</th>
                  <th className="p-3">Available</th>
                  <th className="p-3">Reserved</th>
                  <th className="p-3">Min</th>
                </tr>
              </thead>
              <tbody>
                {products.slice(0, 20).map((p) => {
                  const bal = storeBalances.find((b) => b.productId === p.id && !b.variantId);
                  const stock = p.variants.length
                    ? p.variants.reduce((a, v) => a + (storeBalances.find((b) => b.variantId === v.id)?.stock ?? 0), 0)
                    : (bal?.stock ?? 0);
                  return (
                    <tr key={p.id} className="border-b border-border/60">
                      <td className="p-3">{p.name}</td>
                      <td className="p-3">{stock}</td>
                      <td className="p-3">{bal?.reserved ?? 0}</td>
                      <td className="p-3">{bal?.minStock ?? p.minStock}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        )}

        {tab === "Sales" && (
          <Card className="mt-4 p-0 overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-left">
                  <th className="p-3">Invoice</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {sales.slice(0, 15).map((s) => (
                  <tr key={s.id} className="border-b border-border/60">
                    <td className="p-3">
                      <Link href={`/sales/${s.id}`} className="text-primary hover:underline">
                        {s.invoiceNumber}
                      </Link>
                    </td>
                    <td className="p-3">{formatDateTime(s.date)}</td>
                    <td className="p-3">{s.customerName}</td>
                    <td className="p-3">{formatPKR(s.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {tab === "Stock Requests" && (
          <Card className="mt-4 divide-y divide-border">
            {requests.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">No stock requests yet.</p>
            ) : (
              requests.map((r) => (
                <Link key={r.id} href={`/stock-requests/${r.id}`} className="flex items-center justify-between p-4 hover:bg-muted/40">
                  <div>
                    <p className="font-medium">{r.requestNumber}</p>
                    <p className="text-xs text-muted-foreground">{r.items.length} items · {formatDateTime(r.createdAt)}</p>
                  </div>
                  <StockRequestStatusBadge status={r.status} />
                </Link>
              ))
            )}
          </Card>
        )}

        {tab === "Transfers" && (
          <Card className="mt-4 divide-y divide-border">
            {transfers.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">No transfers found.</p>
            ) : (
              transfers.map((t) => (
                <Link key={t.id} href={`/transfers/${t.id}`} className="flex items-center justify-between p-4 hover:bg-muted/40">
                  <div>
                    <p className="font-medium">{t.transferNumber}</p>
                    <p className="text-xs text-muted-foreground">{t.fromLocationName} → {store.name}</p>
                  </div>
                  <StockTransferStatusBadge status={t.status} />
                </Link>
              ))
            )}
          </Card>
        )}

        {tab === "Activity" && (
          <Card className="mt-4 divide-y divide-border">
            {activity.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">No activity recorded.</p>
            ) : (
              activity.map((a) => (
                <div key={a.id} className="p-4">
                  <p className="font-medium">{a.title}</p>
                  <p className="text-sm text-muted-foreground">{a.description}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{a.actorName} · {formatDateTime(a.createdAt)}</p>
                </div>
              ))
            )}
          </Card>
        )}
      </div>
    </>
  );
}
