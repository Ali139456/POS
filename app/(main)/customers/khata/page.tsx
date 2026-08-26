"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TopHeader } from "@/components/layout/top-header";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input, Label } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/status-badge";
import { useAppStore } from "@/lib/store/app-store";
import { formatPKR, uid } from "@/lib/utils";
import type { CreditStatus } from "@/lib/types";
import { toast } from "sonner";

function statusOf(balance: number, lastDays = 0): CreditStatus {
  if (balance <= 0) return "Paid";
  if (lastDays > 14) return "Overdue";
  return "Due";
}

export default function KhataPage() {
  const customers = useAppStore((s) => s.customers);
  const ledger = useAppStore((s) => s.customerLedger);
  const pay = useAppStore((s) => s.recordCustomerPayment);
  const addLedger = useAppStore((s) => s.addLedgerEntry);
  const upsert = useAppStore((s) => s.upsertCustomer);
  const router = useRouter();
  const rows = customers.filter((c) => c.id !== "cust_walkin");
  const [payFor, setPayFor] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [creditFor, setCreditFor] = useState<string | null>(null);

  const withPaid = useMemo(
    () =>
      rows.map((c) => {
        const paid = ledger.filter((l) => l.partyId === c.id).reduce((a, l) => a + l.credit, 0);
        const totalCredit = ledger.filter((l) => l.partyId === c.id).reduce((a, l) => a + l.debit, 0);
        const last = ledger.find((l) => l.partyId === c.id && l.credit > 0);
        return { c, paid, totalCredit, last: last?.date, st: statusOf(c.creditBalance) };
      }),
    [rows, ledger],
  );

  return (
    <>
      <TopHeader title="Khata" />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-6">
        <PageHeader title="Customer Khata / Udhaar" description="Digital ledger for Pakistani mart credit" />
        <div className="mt-4 space-y-2 md:hidden">
          {withPaid.map(({ c, paid, totalCredit, last, st }) => (
            <div key={c.id} className="rounded-xl border border-border p-3">
              <button className="block w-full truncate text-left font-medium text-primary" onClick={() => router.push(`/customers/${c.id}`)}>
                {c.name}
              </button>
              <p className="truncate text-xs text-muted-foreground">{c.phone}</p>
              <p className="mt-2 text-lg font-semibold tabular-nums">{formatPKR(c.creditBalance)}</p>
              <p className="text-xs text-muted-foreground">Paid {formatPKR(paid)} · Credit {formatPKR(totalCredit)}</p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <StatusBadge status={st} />
                <span className="text-xs text-muted-foreground">{last ? last.slice(0, 10) : "—"}</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button size="sm" variant="outline" className="min-h-10" onClick={() => setPayFor(c.id)}>
                  Record payment
                </Button>
                <Button size="sm" variant="outline" className="min-h-10" onClick={() => setCreditFor(c.id)}>
                  Give credit
                </Button>
              </div>
            </div>
          ))}
        </div>
        <Card className="mt-4 hidden overflow-x-auto p-4 md:block">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr>
                {["Customer", "Phone", "Total Credit", "Paid", "Outstanding", "Last Payment", "Status", ""].map((h, i) => (
                  <th key={i} className="pb-2 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {withPaid.map(({ c, paid, totalCredit, last, st }) => (
                <tr key={c.id} className="border-t border-border">
                  <td className="py-2.5">
                    <button className="font-medium text-primary" onClick={() => router.push(`/customers/${c.id}`)}>
                      {c.name}
                    </button>
                  </td>
                  <td>{c.phone}</td>
                  <td>{formatPKR(totalCredit)}</td>
                  <td>{formatPKR(paid)}</td>
                  <td className="font-semibold">{formatPKR(c.creditBalance)}</td>
                  <td>{last ? last.slice(0, 10) : "—"}</td>
                  <td>
                    <StatusBadge status={st} />
                  </td>
                  <td className="whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                    <Button size="sm" variant="outline" onClick={() => setPayFor(c.id)}>
                      Record payment
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setCreditFor(c.id)}>
                      Give credit
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => toast.success("Statement ready to print")}>
                      Print
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => toast.success("WhatsApp statement sent")}>
                      WhatsApp
                    </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
      <Dialog open={!!payFor} onClose={() => setPayFor(null)} title="Record payment">
        <Label>Amount (Rs.)</Label>
        <Input className="mt-1" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <Button
          className="mt-4 w-full"
          onClick={() => {
            if (payFor) pay(payFor, Number(amount) || 0, "Khata payment");
            toast.success("Customer payment recorded");
            setPayFor(null);
            setAmount("");
          }}
        >
          Save
        </Button>
      </Dialog>
      <Dialog open={!!creditFor} onClose={() => setCreditFor(null)} title="Give credit">
        <Label>Amount (Rs.)</Label>
        <Input className="mt-1" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <Button
          className="mt-4 w-full"
          onClick={() => {
            const c = customers.find((x) => x.id === creditFor);
            if (!c) return;
            const amt = Number(amount) || 0;
            const balance = c.creditBalance + amt;
            upsert({ ...c, creditBalance: balance });
            addLedger("customer", {
              id: uid("cl"),
              partyId: c.id,
              date: new Date().toISOString(),
              description: "Manual credit / udhaar",
              debit: amt,
              credit: 0,
              balance,
            });
            toast.success("Credit added");
            setCreditFor(null);
            setAmount("");
          }}
        >
          Save
        </Button>
      </Dialog>
    </>
  );
}
