"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { TopHeader } from "@/components/layout/top-header";
import { PageHeader, EmptyState } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/badge";
import { StockRequestStatusBadge } from "@/components/org/request-status-badge";
import { useOrgStore, useIsParentUser } from "@/lib/store/org-store";
import { useCurrentEmployee } from "@/lib/store/app-store";
import { formatDateTime } from "@/lib/utils";
import { ClipboardList } from "lucide-react";

export default function StockRequestsPage() {
  const isParent = useIsParentUser();
  const employee = useCurrentEmployee();
  const requests = useOrgStore((s) => s.stockRequests);
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    let list = requests;
    if (!isParent) {
      list = list.filter((r) => r.organizationId === employee.organizationId);
    }
    return list.filter(
      (r) =>
        r.requestNumber.toLowerCase().includes(q.toLowerCase()) ||
        r.storeName.toLowerCase().includes(q.toLowerCase()) ||
        r.requestedByName.toLowerCase().includes(q.toLowerCase()),
    );
  }, [requests, isParent, employee.organizationId, q]);

  return (
    <>
      <TopHeader title="Stock Requests" />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-6">
        <PageHeader
          title="Stock Requests"
          description={isParent ? "Review and approve requests from child stores" : "Request stock from central warehouse"}
          actions={
            !isParent ? (
              <Link href="/stock-requests/new">
                <Button>New request</Button>
              </Link>
            ) : undefined
          }
        />
        <Card className="mt-4 p-4">
          <SearchInput value={q} onChange={setQ} placeholder="Search requests" className="max-w-sm" />
          <div className="mt-3 space-y-2 md:hidden">
            {rows.map((r) => (
              <Link key={r.id} href={`/stock-requests/${r.id}`} className="block rounded-xl border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{r.requestNumber}</p>
                  <StockRequestStatusBadge status={r.status} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {r.storeName} · {r.items.length} items · {formatDateTime(r.createdAt)}
                </p>
              </Link>
            ))}
          </div>
          <div className="mt-3 hidden overflow-x-auto md:block">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="p-2 font-medium">Request ID</th>
                  <th className="p-2 font-medium">Store</th>
                  <th className="p-2 font-medium">Requested By</th>
                  <th className="p-2 font-medium">Items</th>
                  <th className="p-2 font-medium">Date</th>
                  <th className="p-2 font-medium">Status</th>
                  <th className="p-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-border/60">
                    <td className="p-2 font-medium">{r.requestNumber}</td>
                    <td className="p-2">{r.storeName}</td>
                    <td className="p-2">{r.requestedByName}</td>
                    <td className="p-2">{r.items.length}</td>
                    <td className="p-2">{formatDateTime(r.createdAt)}</td>
                    <td className="p-2">
                      <StockRequestStatusBadge status={r.status} />
                    </td>
                    <td className="p-2">
                      <Link href={`/stock-requests/${r.id}`}>
                        <Button variant="outline" size="sm">View</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length === 0 && (
            <EmptyState icon={<ClipboardList className="size-8" />} title="No stock requests yet." description="Child stores can submit requests when stock runs low." />
          )}
        </Card>
      </div>
    </>
  );
}
