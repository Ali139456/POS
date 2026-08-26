"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TopHeader } from "@/components/layout/top-header";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput, FilterBar } from "@/components/shared/search-input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { Card } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { ExportMenu } from "@/components/shared/export-menu";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/page-header";
import { useAppStore } from "@/lib/store/app-store";
import { formatDateTime, formatPKR } from "@/lib/utils";
import { toast } from "sonner";

export default function SalesPage() {
  const sales = useAppStore((s) => s.sales);
  const voidSale = useAppStore((s) => s.voidSale);
  const router = useRouter();
  const [q, setQ] = useState("");
  const [range, setRange] = useState("30d");
  const [pay, setPay] = useState("all");
  const [voidId, setVoidId] = useState<string | null>(null);

  const rows = useMemo(() => {
    return sales.filter((s) => {
      if (pay !== "all" && s.paymentMethod !== pay) return false;
      if (q && !`${s.invoiceNumber} ${s.customerName} ${s.cashierName}`.toLowerCase().includes(q.toLowerCase())) return false;
      const day = s.date.slice(0, 10);
      if (range === "today" && day !== "2026-08-26") return false;
      if (range === "yesterday" && day !== "2026-08-25") return false;
      return true;
    });
  }, [sales, q, range, pay]);

  return (
    <>
      <TopHeader title="Sales" />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-6">
        <PageHeader
          title="Sales history"
          description="Invoices, payments and voids"
          actions={<ExportMenu filename="sales" rows={rows.map((s) => ({ invoice: s.invoiceNumber, customer: s.customerName, total: s.total, method: s.paymentMethod }))} />}
        />
        <Card className="mt-4 p-4">
          <FilterBar>
            <SearchInput value={q} onChange={setQ} placeholder="Search invoice" className="w-full md:w-64" />
            <Select value={range} onChange={(e) => setRange(e.target.value)} className="w-full md:w-36">
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="7d">7 Days</option>
              <option value="30d">30 Days</option>
            </Select>
            <Select value={pay} onChange={(e) => setPay(e.target.value)} className="w-full md:w-40">
              <option value="all">All payments</option>
              {["Cash", "Card", "Bank Transfer", "JazzCash", "EasyPaisa", "Split"].map((m) => (
                <option key={m}>{m}</option>
              ))}
            </Select>
          </FilterBar>
          {rows.length === 0 ? (
            <div className="mt-6">
              <EmptyState title="No sales yet" description="Completed tickets will show up here." />
            </div>
          ) : (
            <>
            <div className="mt-4 space-y-2 md:hidden">
              {rows.map((s) => (
                <button
                  key={s.id}
                  onClick={() => router.push(`/sales/${s.id}`)}
                  className="w-full rounded-xl border border-border p-3 text-left"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-primary">{s.invoiceNumber}</p>
                    <StatusBadge status={s.status} />
                  </div>
                  <p className="mt-1 truncate text-sm">{s.customerName}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(s.date)} · {s.paymentMethod}</p>
                  <p className="mt-1 font-semibold">{formatPKR(s.total)}</p>
                </button>
              ))}
            </div>
            <div className="mt-4 hidden overflow-x-auto md:block">
              <table className="w-full min-w-[1000px] text-sm">
                <thead className="text-left text-xs text-muted-foreground">
                  <tr>
                    {["Invoice", "Date", "Customer", "Cashier", "Items", "Subtotal", "Discount", "Payment", "Total", "Status", ""].map((h, i) => (
                      <th key={i} className="pb-2 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((s) => (
                    <tr key={s.id} className="border-t border-border">
                      <td className="py-2.5">
                        <button className="font-medium text-primary" onClick={() => router.push(`/sales/${s.id}`)}>
                          {s.invoiceNumber}
                        </button>
                      </td>
                      <td>{formatDateTime(s.date)}</td>
                      <td>{s.customerName}</td>
                      <td>{s.cashierName}</td>
                      <td>{s.items.length}</td>
                      <td>{formatPKR(s.subtotal)}</td>
                      <td>{formatPKR(s.itemDiscount + s.orderDiscount)}</td>
                      <td>{s.paymentMethod}</td>
                      <td className="font-semibold">{formatPKR(s.total)}</td>
                      <td>
                        <StatusBadge status={s.status} />
                      </td>
                      <td className="whitespace-nowrap">
                        <Button size="sm" variant="ghost" onClick={() => router.push(`/sales/${s.id}`)}>
                          View
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => window.print()}>
                          Print
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => router.push(`/returns?invoice=${s.invoiceNumber}`)}>
                          Return
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setVoidId(s.id)}>
                          Void
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </>
          )}
        </Card>
      </div>
      <ConfirmDialog
        open={!!voidId}
        onClose={() => setVoidId(null)}
        title="Void this invoice?"
        description="This cannot be undone in the demo ledger."
        destructive
        confirmLabel="Void sale"
        onConfirm={() => {
          if (voidId) voidSale(voidId);
          toast.success("Sale voided");
        }}
      />
    </>
  );
}
