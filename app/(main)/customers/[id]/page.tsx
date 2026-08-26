"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { TopHeader } from "@/components/layout/top-header";
import { Card } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { useAppStore } from "@/lib/store/app-store";
import { formatDate, formatPKR } from "@/lib/utils";

export default function CustomerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const customer = useAppStore((s) => s.customers.find((c) => c.id === id));
  const allSales = useAppStore((s) => s.sales);
  const allReturns = useAppStore((s) => s.returns);
  const allLedger = useAppStore((s) => s.customerLedger);
  const sales = useMemo(() => allSales.filter((s) => s.customerId === id), [allSales, id]);
  const returns = useMemo(() => allReturns.filter((r) => r.customerId === id), [allReturns, id]);
  const ledger = useMemo(() => allLedger.filter((l) => l.partyId === id), [allLedger, id]);
  if (!customer) return <p className="p-6">Customer not found.</p>;

  return (
    <>
      <TopHeader title={customer.name} />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-6 space-y-4">
        <Card className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="truncate text-xl font-semibold sm:text-2xl">{customer.name}</h1>
              <p className="text-sm text-muted-foreground">
                {customer.phone} · {customer.whatsapp}
              </p>
              <p className="truncate text-sm text-muted-foreground">{customer.address}</p>
            </div>
            <StatusBadge status={customer.type} />
          </div>
          <div className="mt-4 grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
            <Mini label="Purchases" value={formatPKR(customer.totalPurchases)} />
            <Mini label="Orders" value={String(customer.totalOrders)} />
            <Mini label="Credit" value={formatPKR(customer.creditBalance)} />
            <Mini label="Points" value={String(customer.loyaltyPoints)} />
          </div>
          {customer.notes && <p className="mt-3 text-sm text-muted-foreground">{customer.notes}</p>}
        </Card>
        <Card className="p-5">
          <h2 className="font-semibold">Credit ledger</h2>
          <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr>
                <th className="pb-2">Date</th>
                <th>Invoice</th>
                <th>Description</th>
                <th>Debit</th>
                <th>Credit</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {ledger.map((l) => (
                <tr key={l.id} className="border-t border-border">
                  <td className="py-2">{formatDate(l.date)}</td>
                  <td>{l.invoice ?? "—"}</td>
                  <td>{l.description}</td>
                  <td>{formatPKR(l.debit)}</td>
                  <td>{formatPKR(l.credit)}</td>
                  <td className="font-medium">{formatPKR(l.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="font-semibold">Purchase history</h2>
          <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[360px] text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr>
                <th className="pb-2">Invoice</th>
                <th>Total</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr key={s.id} className="border-t border-border">
                  <td className="py-2">{s.invoiceNumber}</td>
                  <td>{formatPKR(s.total)}</td>
                  <td>{s.paymentMethod}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          {returns.length > 0 && (
            <p className="mt-3 text-sm text-muted-foreground">{returns.length} return(s) on file.</p>
          )}
        </Card>
      </div>
    </>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted px-3 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
