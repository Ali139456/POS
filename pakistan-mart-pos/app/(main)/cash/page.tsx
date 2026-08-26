"use client";

import { useState } from "react";
import { TopHeader } from "@/components/layout/top-header";
import { PageHeader, StatCard } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input, Label, Textarea } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/status-badge";
import { useAppStore } from "@/lib/store/app-store";
import { formatDateTime, formatPKR } from "@/lib/utils";
import { toast } from "sonner";

export default function CashPage() {
  const register = useAppStore((s) => s.register);
  const cashInOut = useAppStore((s) => s.cashInOut);
  const closeShift = useAppStore((s) => s.closeShift);
  const openShift = useAppStore((s) => s.openShift);
  const [move, setMove] = useState<"in" | "out" | null>(null);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("Petty Expense");
  const [notes, setNotes] = useState("");
  const [closeOpen, setCloseOpen] = useState(false);
  const [actual, setActual] = useState(String(register.expectedCash));
  const [diffNote, setDiffNote] = useState("");
  const diff = (Number(actual) || 0) - register.expectedCash;
  const label = diff === 0 ? "Exact" : diff < 0 ? "Short" : "Over";

  return (
    <>
      <TopHeader title="Cash management" />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-6">
        <PageHeader
          title="Cash register"
          description={`${register.cashierName} · opened ${formatDateTime(register.openedAt)}`}
          actions={
            register.status === "Open" ? (
              <Button onClick={() => setCloseOpen(true)}>Close shift</Button>
            ) : (
              <Button onClick={() => openShift(15000)}>Open shift</Button>
            )
          }
        />
        <div className="mt-2">
          <StatusBadge status={register.status} />
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard label="Opening balance" value={formatPKR(register.openingCash)} />
          <StatCard label="Cash sales" value={formatPKR(register.cashSales)} />
          <StatCard label="Cash refunds" value={formatPKR(register.cashRefunds)} />
          <StatCard label="Cash in" value={formatPKR(register.cashIn)} />
          <StatCard label="Cash out" value={formatPKR(register.cashOut)} />
          <StatCard label="Expected cash" value={formatPKR(register.expectedCash)} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setMove("in")}>
            Cash in
          </Button>
          <Button variant="outline" onClick={() => setMove("out")}>
            Cash out
          </Button>
        </div>
        <Card className="mt-4 p-4">
          <h2 className="font-semibold">Movements</h2>
          {register.movements.map((m) => (
            <div key={m.id} className="flex flex-wrap items-center justify-between gap-2 border-t border-border py-2 text-sm">
              <span className="capitalize">{m.type}</span>
              <span className="min-w-0 truncate text-muted-foreground">{m.reason}</span>
              <span className="tabular-nums">{formatPKR(m.amount)}</span>
            </div>
          ))}
        </Card>
      </div>
      <Dialog open={!!move} onClose={() => setMove(null)} title={move === "in" ? "Cash in" : "Cash out"}>
        <Label>Reason</Label>
        <select className="mt-1 h-10 w-full rounded-xl border border-input bg-card px-3 text-sm" value={reason} onChange={(e) => setReason(e.target.value)}>
          {["Petty Expense", "Owner Withdrawal", "Supplier Payment", "Cash Deposit"].map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
        <Label className="mt-3 block">Amount</Label>
        <Input className="mt-1" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <Label className="mt-3 block">Notes</Label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        <Button
          className="mt-4 w-full"
          onClick={() => {
            if (move) cashInOut(move, Number(amount) || 0, reason, notes);
            toast.success("Register updated");
            setMove(null);
          }}
        >
          Save
        </Button>
      </Dialog>
      <Dialog open={closeOpen} onClose={() => setCloseOpen(false)} title="Close shift">
        <p className="text-sm text-muted-foreground">Expected {formatPKR(register.expectedCash)}</p>
        <Label className="mt-3 block">Actual cash counted</Label>
        <Input className="mt-1" value={actual} onChange={(e) => setActual(e.target.value)} />
        <p className={`mt-2 text-sm font-medium ${diff === 0 ? "text-success" : "text-warning"}`}>
          {label}: {formatPKR(diff)}
        </p>
        {diff !== 0 && (
          <>
            <Label className="mt-3 block">Notes (required)</Label>
            <Textarea value={diffNote} onChange={(e) => setDiffNote(e.target.value)} />
          </>
        )}
        <Button
          className="mt-4 w-full"
          onClick={() => {
            if (diff !== 0 && !diffNote.trim()) {
              toast.error("Add a note for the difference");
              return;
            }
            closeShift(Number(actual) || 0, diffNote);
            toast.success("Shift closed");
            setCloseOpen(false);
          }}
        >
          Close shift
        </Button>
      </Dialog>
    </>
  );
}
