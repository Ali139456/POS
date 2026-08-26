"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TopHeader } from "@/components/layout/top-header";
import { PageHeader, StatCard } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { useAppStore } from "@/lib/store/app-store";
import { formatDate, formatPKR, uid } from "@/lib/utils";
import type { ExpenseCategory, PaymentMethod } from "@/lib/types";
import { toast } from "sonner";

const CATS: ExpenseCategory[] = ["Rent", "Electricity", "Gas", "Internet", "Salary", "Transport", "Maintenance", "Food", "Supplies", "Miscellaneous"];

export default function ExpensesPage() {
  const expenses = useAppStore((s) => s.expenses);
  const add = useAppStore((s) => s.addExpense);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", category: "Rent" as ExpenseCategory, amount: 0, date: "2026-08-26", paymentMethod: "Cash" as PaymentMethod, description: "" });
  const monthTotal = expenses.filter((e) => e.date.startsWith("2026-08")).reduce((a, e) => a + e.amount, 0);
  const byCat = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of expenses) map[e.category] = (map[e.category] ?? 0) + e.amount;
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  return (
    <>
      <TopHeader title="Expenses" />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-6">
        <PageHeader title="Expense management" actions={<Button onClick={() => setOpen(true)}>Add expense</Button>} />
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <StatCard label="August expenses" value={formatPKR(monthTotal)} />
          <StatCard label="Entries" value={String(expenses.length)} />
          <StatCard label="Largest" value={formatPKR(Math.max(...expenses.map((e) => e.amount)))} />
        </div>
        <Card className="mt-4 p-4">
          <h2 className="font-semibold">Monthly analytics</h2>
          <div className="h-48 w-full min-w-0 sm:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byCat}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={48} />
                <YAxis width={36} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip formatter={(v) => formatPKR(Number(v ?? 0))} />
                <Bar dataKey="value" fill="#0f766e" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <div className="mt-4 space-y-2 md:hidden">
          {expenses.map((e) => (
            <div key={e.id} className="rounded-xl border border-border p-3">
              <p className="truncate font-medium">{e.title}</p>
              <p className="text-xs text-muted-foreground">{e.category} · {formatDate(e.date)}</p>
              <p className="mt-1 font-semibold tabular-nums">{formatPKR(e.amount)}</p>
            </div>
          ))}
        </div>
        <Card className="mt-4 hidden overflow-x-auto p-4 md:block">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr>
                <th className="pb-2">Title</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Method</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id} className="border-t border-border">
                  <td className="py-2.5 font-medium">{e.title}</td>
                  <td>{e.category}</td>
                  <td>{formatPKR(e.amount)}</td>
                  <td>{formatDate(e.date)}</td>
                  <td>{e.paymentMethod}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
      <Dialog open={open} onClose={() => setOpen(false)} title="Add expense">
        <div className="space-y-3">
          <div>
            <Label>Title</Label>
            <Input className="mt-1" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <Label>Category</Label>
            <Select className="mt-1" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ExpenseCategory })}>
              {CATS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Amount</Label>
            <Input className="mt-1" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
          </div>
          <div>
            <Label>Date</Label>
            <Input className="mt-1" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div>
            <Label>Payment method</Label>
            <Select className="mt-1" value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value as PaymentMethod })}>
              {["Cash", "Card", "Bank Transfer", "EasyPaisa", "JazzCash"].map((m) => (
                <option key={m}>{m}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <Button
            className="w-full"
            onClick={() => {
              add({ id: uid("exp"), ...form, date: `${form.date}T00:00:00` });
              toast.success("Expense added");
              setOpen(false);
            }}
          >
            Save
          </Button>
        </div>
      </Dialog>
    </>
  );
}
