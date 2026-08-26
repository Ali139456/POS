"use client";

import { useParams, useRouter } from "next/navigation";
import { TopHeader } from "@/components/layout/top-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/badge";
import { ReceiptPreview } from "@/components/pos/receipt-preview";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useAppStore } from "@/lib/store/app-store";
import { formatPKR } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";

export default function SaleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const sale = useAppStore((s) => s.sales.find((x) => x.id === id));
  const voidSale = useAppStore((s) => s.voidSale);
  const store = useAppStore((s) => s.store);
  const router = useRouter();
  const [voidOpen, setVoidOpen] = useState(false);
  if (!sale) return <p className="p-6">Invoice not found.</p>;

  return (
    <>
      <TopHeader title={sale.invoiceNumber} />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-6">
        <div className="mb-4 flex flex-wrap gap-2">
          <Button onClick={() => window.print()}>Print Receipt</Button>
          <Button variant="outline" onClick={() => toast.success("PDF downloaded")}>
            Download
          </Button>
          <Button variant="outline" onClick={() => toast.success("WhatsApp opened")}>
            WhatsApp
          </Button>
          <Button variant="outline" onClick={() => router.push(`/returns?invoice=${sale.invoiceNumber}`)}>
            Return Item
          </Button>
          <Button variant="destructive" onClick={() => setVoidOpen(true)}>
            Void Sale
          </Button>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1fr_minmax(260px,360px)]">
          <Card className="min-w-0 p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold">{store.name}</p>
                <p className="text-sm text-muted-foreground">{store.address}</p>
              </div>
              <div className="sm:text-right">
                <p className="font-mono font-semibold">{sale.invoiceNumber}</p>
                <p className="text-sm text-muted-foreground">{sale.date.replace("T", " ").slice(0, 16)}</p>
              </div>
            </div>
            <p className="mt-4 text-sm">
              Cashier <b>{sale.cashierName}</b> · Customer <b>{sale.customerName}</b>
            </p>
            <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead className="text-left text-xs text-muted-foreground">
                <tr>
                  <th className="pb-2">Product</th>
                  <th>Qty</th>
                  <th>Rate</th>
                  <th>Discount</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {sale.items.map((i) => (
                  <tr key={i.id} className="border-t border-border">
                    <td className="py-2">
                      {i.name} {i.variantName ?? ""}
                    </td>
                    <td>{i.quantity}</td>
                    <td>{formatPKR(i.unitPrice)}</td>
                    <td>{formatPKR(i.discount)}</td>
                    <td>{formatPKR(i.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            <div className="mt-4 ml-auto max-w-xs space-y-1 text-sm">
              <Row l="Subtotal" v={formatPKR(sale.subtotal)} />
              <Row l="Discount" v={formatPKR(sale.itemDiscount + sale.orderDiscount)} />
              <Row l="Tax" v={formatPKR(sale.tax)} />
              <Row l="Total" v={formatPKR(sale.total)} />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Payment: {sale.paymentMethod}
              {sale.payments.map((p) => (p.reference ? ` · ${p.reference}` : "")).join("")}
            </p>
          </Card>
          <ReceiptPreview sale={sale} />
        </div>
      </div>
      <ConfirmDialog
        open={voidOpen}
        onClose={() => setVoidOpen(false)}
        title="Void sale?"
        description={`${sale.invoiceNumber} will be marked void.`}
        destructive
        confirmLabel="Void"
        onConfirm={() => {
          voidSale(sale.id);
          toast.success("Sale voided");
        }}
      />
    </>
  );
}

function Row({ l, v }: { l: string; v: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{l}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}
