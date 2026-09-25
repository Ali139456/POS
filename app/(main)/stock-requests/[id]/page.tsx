"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { TopHeader } from "@/components/layout/top-header";
import { PageHeader, EmptyState } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { StockRequestStatusBadge } from "@/components/org/request-status-badge";
import { useOrgStore, useIsParentUser } from "@/lib/store/org-store";
import { useCurrentEmployee } from "@/lib/store/app-store";
import { WAREHOUSE_LOCATION_ID } from "@/lib/mock/org-seed";
import { formatDateTime } from "@/lib/utils";

export default function StockRequestDetailPage() {
  const { id = "" } = useParams<{ id: string }>();
  const router = useRouter();
  const isParent = useIsParentUser();
  const employee = useCurrentEmployee();
  const request = useOrgStore((s) => s.stockRequests.find((r) => r.id === id));
  const reviewStockRequest = useOrgStore((s) => s.reviewStockRequest);
  const createTransfer = useOrgStore((s) => s.createTransfer);
  const dispatchTransfer = useOrgStore((s) => s.dispatchTransfer);

  const [approved, setApproved] = useState<Record<string, number>>({});

  useEffect(() => {
    if (request) {
      const map: Record<string, number> = {};
      for (const item of request.items) {
        map[item.id] = item.approvedQuantity ?? item.requestedQuantity;
      }
      setApproved(map);
    }
  }, [request]);

  if (!request) {
    return (
      <>
        <TopHeader title="Stock Request" />
        <div className="flex-1 p-6">
          <EmptyState title="Request not found" description="Unable to load this stock request." />
        </div>
      </>
    );
  }

  const req = request;
  const canReview = isParent && req.status === "PENDING";
  const canReceive = !isParent && req.organizationId === employee.organizationId;

  function approve(partial: boolean) {
    const items = req.items.map((i) => ({ id: i.id, approvedQuantity: approved[i.id] ?? 0 }));
    reviewStockRequest({
      requestId: req.id,
      status: partial ? "PARTIALLY_APPROVED" : "APPROVED",
      items,
      reviewerId: employee.id,
      reviewerName: employee.name,
    });
    const store = useOrgStore.getState().childStores.find((s) => s.id === req.storeId)!;
    const tr = createTransfer({
      fromLocationId: WAREHOUSE_LOCATION_ID,
      toLocationId: store.locationId,
      toStoreId: store.id,
      toStoreName: store.name,
      stockRequestId: req.id,
      items: req.items
        .filter((i) => (approved[i.id] ?? 0) > 0)
        .map((i) => ({
          id: "",
          productId: i.productId,
          variantId: i.variantId,
          productName: i.productName,
          sentQuantity: approved[i.id] ?? 0,
          receivedQuantity: 0,
        })),
      createdById: employee.id,
      createdByName: employee.name,
    });
    dispatchTransfer(tr.id, employee.id, employee.name);
    toast.success(partial ? "Request partially approved and transfer dispatched" : "Request approved and transfer dispatched");
    router.refresh();
  }

  function reject() {
    reviewStockRequest({
      requestId: req.id,
      status: "REJECTED",
      items: req.items.map((i) => ({ id: i.id, approvedQuantity: 0 })),
      reviewerId: employee.id,
      reviewerName: employee.name,
    });
    toast.success("Request rejected");
  }

  return (
    <>
      <TopHeader title={req.requestNumber} />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-6">
        <PageHeader
          title={req.requestNumber}
          description={`${req.storeName} · ${req.requestedByName} · ${formatDateTime(req.createdAt)}`}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <StockRequestStatusBadge status={req.status} />
              <Link href="/stock-requests">
                <Button variant="outline">Back</Button>
              </Link>
            </div>
          }
        />
        <Card className="mt-4 overflow-x-auto p-0">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-left">
                <th className="p-3">Product</th>
                <th className="p-3">Current</th>
                <th className="p-3">Min</th>
                <th className="p-3">Requested</th>
                {canReview && <th className="p-3">Approved</th>}
                {!canReview && <th className="p-3">Approved</th>}
              </tr>
            </thead>
            <tbody>
              {req.items.map((item) => (
                <tr key={item.id} className="border-b border-border/60">
                  <td className="p-3">{item.productName}</td>
                  <td className="p-3">{item.currentStock}</td>
                  <td className="p-3">{item.minStock}</td>
                  <td className="p-3">{item.requestedQuantity}</td>
                  <td className="p-3">
                    {canReview ? (
                      <Input
                        type="number"
                        min={0}
                        max={item.requestedQuantity}
                        value={approved[item.id] ?? item.requestedQuantity}
                        onChange={(e) => setApproved((s) => ({ ...s, [item.id]: Number(e.target.value) || 0 }))}
                        className="w-24"
                      />
                    ) : (
                      item.approvedQuantity ?? "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        {req.notes && <p className="mt-3 text-sm text-muted-foreground">Notes: {req.notes}</p>}
        {canReview && (
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={() => approve(false)}>Approve</Button>
            <Button variant="outline" onClick={() => approve(true)}>
              Partially approve
            </Button>
            <Button variant="destructive" onClick={reject}>
              Reject
            </Button>
          </div>
        )}
        {canReceive && req.status === "DISPATCHED" && (
          <p className="mt-4 text-sm text-muted-foreground">Transfer dispatched — receive stock from the Transfers screen.</p>
        )}
      </div>
    </>
  );
}
