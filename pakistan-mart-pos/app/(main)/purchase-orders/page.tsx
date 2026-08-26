"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { TopHeader } from "@/components/layout/top-header";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input, Label } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useAppStore } from "@/lib/store/app-store";
import { formatDate, formatPKR } from "@/lib/utils";
import { toast } from "sonner";
import type { PurchaseOrder } from "@/lib/types";

export default function PurchaseOrdersPage() {
  const pos = useAppStore((s) => s.purchaseOrders);
  const receivePO = useAppStore((s) => s.receivePO);
  const upsert = useAppStore((s) => s.upsertPO);
  const router = useRouter();
  const [recv, setRecv] = useState<PurchaseOrder | null>(null);
  const [cancel, setCancel] = useState<PurchaseOrder | null>(null);
  const [qtys, setQtys] = useState<Record<string, number>>({});

  return (
    <>
      <TopHeader title="Purchase orders" />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-6">
        <PageHeader
          title="Purchase orders"
          description="Restock from distributors"
          actions={<Button onClick={() => router.push("/purchase-orders/new")}>Create PO</Button>}
        />
        <div className="mt-4 space-y-2 md:hidden">
          {pos.map((p) => (
            <div key={p.id} className="rounded-xl border border-border p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium">{p.poNumber}</p>
                <StatusBadge status={p.status} />
              </div>
              <p className="mt-1 truncate text-sm">{p.supplierName}</p>
              <p className="text-xs text-muted-foreground">{formatDate(p.date)} · due {formatDate(p.expectedDelivery)}</p>
              <p className="mt-1 font-semibold tabular-nums">{formatPKR(p.total)}</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button size="sm" variant="outline" className="min-h-10" onClick={() => { setRecv(p); setQtys({}); }}>
                  Receive
                </Button>
                <Button size="sm" variant="ghost" className="min-h-10" onClick={() => setCancel(p)}>
                  Cancel
                </Button>
              </div>
            </div>
          ))}
        </div>
        <Card className="mt-4 hidden overflow-x-auto p-4 md:block">
          <table className="w-full min-w-[800px] text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr>
                {["PO", "Supplier", "Date", "Expected", "Total", "Status", ""].map((h, i) => (
                  <th key={i} className="pb-2 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pos.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="py-2.5 font-medium">{p.poNumber}</td>
                  <td>{p.supplierName}</td>
                  <td>{formatDate(p.date)}</td>
                  <td>{formatDate(p.expectedDelivery)}</td>
                  <td>{formatPKR(p.total)}</td>
                  <td>
                    <StatusBadge status={p.status} />
                  </td>
                  <td>
                    <Button size="sm" variant="outline" onClick={() => { setRecv(p); setQtys({}); }}>
                      Receive
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setCancel(p)}>
                      Cancel
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
      <Dialog open={!!recv} onClose={() => setRecv(null)} title="Receive inventory" wide>
          {recv?.items.map((i) => (
          <div key={i.id} className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{i.name}</p>
              <p className="text-xs text-muted-foreground">
                Ordered {i.quantity} · received {i.receivedQty}
              </p>
            </div>
            <Input
              className="w-full sm:w-28"
              type="number"
              placeholder="Qty"
              value={qtys[i.id] ?? ""}
              onChange={(e) => setQtys({ ...qtys, [i.id]: Number(e.target.value) || 0 })}
            />
          </div>
        ))}
        <Button
          className="mt-3 w-full"
          onClick={() => {
            if (recv) receivePO(recv.id, qtys);
            toast.success("Inventory received");
            setRecv(null);
          }}
        >
          Confirm receive
        </Button>
      </Dialog>
      <ConfirmDialog
        open={!!cancel}
        onClose={() => setCancel(null)}
        title="Cancel purchase order?"
        description={cancel?.poNumber ?? ""}
        destructive
        confirmLabel="Cancel PO"
        onConfirm={() => {
          if (cancel) upsert({ ...cancel, status: "Cancelled" });
        }}
      />
    </>
  );
}
