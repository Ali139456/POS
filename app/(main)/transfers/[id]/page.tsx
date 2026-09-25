"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { TopHeader } from "@/components/layout/top-header";
import { PageHeader, EmptyState } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/badge";
import { Input, Textarea } from "@/components/ui/input";
import { StockTransferStatusBadge } from "@/components/org/request-status-badge";
import { useOrgStore, useIsParentUser } from "@/lib/store/org-store";
import { useCurrentEmployee } from "@/lib/store/app-store";
import { formatDateTime } from "@/lib/utils";

export default function TransferDetailPage() {
  const { id = "" } = useParams<{ id: string }>();
  const isParent = useIsParentUser();
  const employee = useCurrentEmployee();
  const transfer = useOrgStore((s) => s.stockTransfers.find((t) => t.id === id));
  const dispatchTransfer = useOrgStore((s) => s.dispatchTransfer);
  const receiveTransfer = useOrgStore((s) => s.receiveTransfer);
  const store = useOrgStore((s) => s.childStores.find((x) => x.id === transfer?.toStoreId));

  const [received, setReceived] = useState<Record<string, { qty: number; note: string }>>({});

  if (!transfer) {
    return (
      <>
        <TopHeader title="Transfer" />
        <div className="flex-1 p-6">
          <EmptyState title="Transfer not found" description="Unable to load this transfer." />
        </div>
      </>
    );
  }

  const tr = transfer;
  const canDispatch = isParent && tr.status === "DRAFT";
  const canReceive =
    !isParent &&
    store?.organizationId === employee.organizationId &&
    (tr.status === "DISPATCHED" || tr.status === "PARTIALLY_RECEIVED");

  function handleReceive() {
    const items = tr.items.map((i) => ({
      id: i.id,
      receivedQuantity: received[i.id]?.qty ?? i.sentQuantity,
      receiveNote: received[i.id]?.note,
    }));
    receiveTransfer({
      transferId: tr.id,
      items,
      receiverId: employee.id,
      receiverName: employee.name,
    });
    toast.success("Transfer received");
  }

  return (
    <>
      <TopHeader title={tr.transferNumber} />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-6">
        <PageHeader
          title={tr.transferNumber}
          description={`${tr.fromLocationName} → ${tr.toStoreName}`}
          actions={
            <div className="flex items-center gap-2">
              <StockTransferStatusBadge status={tr.status} />
              <Link href="/transfers">
                <Button variant="outline">Back</Button>
              </Link>
            </div>
          }
        />
        <Card className="mt-4 p-4 text-sm text-muted-foreground">
          <p>Created by {tr.createdByName} · {formatDateTime(tr.createdAt)}</p>
          {tr.dispatchedAt && <p>Dispatched {formatDateTime(tr.dispatchedAt)}</p>}
          {tr.receivedAt && <p>Received {formatDateTime(tr.receivedAt)}</p>}
        </Card>
        <Card className="mt-4 overflow-x-auto p-0">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-left">
                <th className="p-3">Product</th>
                <th className="p-3">Sent</th>
                <th className="p-3">Received</th>
                <th className="p-3">Difference</th>
                {canReceive && <th className="p-3">Receive qty</th>}
                {canReceive && <th className="p-3">Note</th>}
              </tr>
            </thead>
            <tbody>
              {tr.items.map((item) => {
                const recv = received[item.id]?.qty ?? item.sentQuantity;
                return (
                  <tr key={item.id} className="border-b border-border/60">
                    <td className="p-3">{item.productName}</td>
                    <td className="p-3">{item.sentQuantity}</td>
                    <td className="p-3">{item.receivedQuantity || (canReceive ? "—" : item.receivedQuantity)}</td>
                    <td className="p-3">{canReceive ? recv - item.sentQuantity : item.receivedQuantity - item.sentQuantity}</td>
                    {canReceive && (
                      <>
                        <td className="p-3">
                          <Input
                            type="number"
                            min={0}
                            defaultValue={item.sentQuantity}
                            onChange={(e) =>
                              setReceived((s) => ({
                                ...s,
                                [item.id]: { qty: Number(e.target.value) || 0, note: s[item.id]?.note ?? "" },
                              }))
                            }
                            className="w-24"
                          />
                        </td>
                        <td className="p-3">
                          <Textarea
                            placeholder="If short/damaged"
                            className="min-h-10"
                            onChange={(e) =>
                              setReceived((s) => ({
                                ...s,
                                [item.id]: { qty: s[item.id]?.qty ?? item.sentQuantity, note: e.target.value },
                              }))
                            }
                          />
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
        {canDispatch && (
          <Button className="mt-4" onClick={() => dispatchTransfer(tr.id, employee.id, employee.name)}>
            Dispatch transfer
          </Button>
        )}
        {canReceive && (
          <Button className="mt-4" onClick={handleReceive}>
            Confirm receipt
          </Button>
        )}
      </div>
    </>
  );
}
