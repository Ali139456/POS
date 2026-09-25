"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { TopHeader } from "@/components/layout/top-header";
import { PageHeader, EmptyState } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/badge";
import { StockTransferStatusBadge } from "@/components/org/request-status-badge";
import { useOrgStore, useIsParentUser } from "@/lib/store/org-store";
import { useCurrentEmployee } from "@/lib/store/app-store";
import { formatDateTime } from "@/lib/utils";
import { ArrowLeftRight } from "lucide-react";

export default function TransfersPage() {
  const isParent = useIsParentUser();
  const employee = useCurrentEmployee();
  const transfers = useOrgStore((s) => s.stockTransfers);
  const stores = useOrgStore((s) => s.childStores);
  const [q, setQ] = useState("");

  const store = stores.find((s) => s.organizationId === employee.organizationId);

  const rows = useMemo(() => {
    let list = transfers;
    if (!isParent && store) {
      list = list.filter((t) => t.toStoreId === store.id);
    }
    return list.filter(
      (t) =>
        t.transferNumber.toLowerCase().includes(q.toLowerCase()) ||
        t.toStoreName.toLowerCase().includes(q.toLowerCase()),
    );
  }, [transfers, isParent, store, q]);

  return (
    <>
      <TopHeader title="Transfers" />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-6">
        <PageHeader
          title="Stock Transfers"
          description="Warehouse to store movements"
          actions={
            isParent ? (
              <Link href="/transfers/new">
                <Button>New transfer</Button>
              </Link>
            ) : undefined
          }
        />
        <Card className="mt-4 p-4">
          <SearchInput value={q} onChange={setQ} placeholder="Search transfers" className="max-w-sm" />
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="p-2 font-medium">Transfer ID</th>
                  <th className="p-2 font-medium">From</th>
                  <th className="p-2 font-medium">To</th>
                  <th className="p-2 font-medium">Items</th>
                  <th className="p-2 font-medium">Date</th>
                  <th className="p-2 font-medium">Status</th>
                  <th className="p-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => (
                  <tr key={t.id} className="border-b border-border/60">
                    <td className="p-2 font-medium">{t.transferNumber}</td>
                    <td className="p-2">{t.fromLocationName}</td>
                    <td className="p-2">{t.toStoreName}</td>
                    <td className="p-2">{t.items.length}</td>
                    <td className="p-2">{formatDateTime(t.createdAt)}</td>
                    <td className="p-2">
                      <StockTransferStatusBadge status={t.status} />
                    </td>
                    <td className="p-2">
                      <Link href={`/transfers/${t.id}`}>
                        <Button variant="outline" size="sm">View</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length === 0 && (
            <EmptyState icon={<ArrowLeftRight className="size-8" />} title="No transfers found." description="Transfers appear when stock is dispatched from the warehouse." />
          )}
        </Card>
      </div>
    </>
  );
}
