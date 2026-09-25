"use client";

import Link from "next/link";
import { useMemo } from "react";
import { TopHeader } from "@/components/layout/top-header";
import { PageHeader, EmptyState } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { useOrgStore, useIsParentUser } from "@/lib/store/org-store";
import { computeStoreSummaries } from "@/lib/services/parent-dashboard";
import { formatPKR } from "@/lib/utils";
import { Building2 } from "lucide-react";

export default function StoresPage() {
  const isParent = useIsParentUser();
  const stores = useOrgStore((s) => s.childStores);
  const summaries = useMemo(() => computeStoreSummaries(), [stores]);

  if (!isParent) {
    return (
      <>
        <TopHeader title="Stores" />
        <div className="flex-1 p-6">
          <EmptyState title="Access restricted" description="Store list is available to parent administrators only." />
        </div>
      </>
    );
  }

  return (
    <>
      <TopHeader title="Stores" />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-6">
        <PageHeader title="Child Stores" description="Manage and inspect all retail locations" />
        <Card className="mt-4 overflow-x-auto p-0">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-left text-muted-foreground">
                <th className="p-3 font-medium">Store</th>
                <th className="p-3 font-medium">Manager</th>
                <th className="p-3 font-medium">Location</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Today&apos;s Sales</th>
                <th className="p-3 font-medium">Inventory</th>
                <th className="p-3 font-medium">Low Stock</th>
                <th className="p-3 font-medium">Requests</th>
                <th className="p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((store) => {
                const s = summaries.find((x) => x.storeId === store.id);
                return (
                  <tr key={store.id} className="border-b border-border/60 last:border-0">
                    <td className="p-3 font-medium">{store.name}</td>
                    <td className="p-3">{store.managerName}</td>
                    <td className="max-w-[180px] truncate p-3 text-muted-foreground">{store.location}</td>
                    <td className="p-3">
                      <StatusBadge status={store.status} />
                    </td>
                    <td className="p-3">{formatPKR(s?.todaySales ?? 0)}</td>
                    <td className="p-3">{formatPKR(s?.inventoryValue ?? 0)}</td>
                    <td className="p-3">{s?.lowStockCount ?? 0}</td>
                    <td className="p-3">{s?.pendingRequests ?? 0}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        <Link href={`/stores/${store.id}`}>
                          <Button variant="outline" size="sm">View</Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
        {stores.length === 0 && (
          <EmptyState icon={<Building2 className="size-8" />} title="No stores configured" description="Child stores will appear here once added." />
        )}
      </div>
    </>
  );
}
