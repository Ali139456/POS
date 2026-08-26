"use client";

import { useMemo, useState } from "react";
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TopHeader } from "@/components/layout/top-header";
import { PageHeader, StatCard } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/badge";
import { ExportMenu } from "@/components/shared/export-menu";
import { useAppStore } from "@/lib/store/app-store";
import { formatPKR } from "@/lib/utils";
import { hourlyChart, weeklyChart } from "@/lib/mock/seed";

const REPORTS = [
  "Sales Report",
  "Profit Report",
  "Product Sales",
  "Category Sales",
  "Inventory Report",
  "Stock Movement",
  "Purchase Report",
  "Supplier Report",
  "Customer Report",
  "Credit / Khata Report",
  "Expense Report",
  "Cash Register Report",
  "Tax Report",
  "Employee Performance",
] as const;

export default function ReportsPage() {
  const [report, setReport] = useState<(typeof REPORTS)[number]>("Sales Report");
  const [range, setRange] = useState("month");
  const allSales = useAppStore((s) => s.sales);
  const expenses = useAppStore((s) => s.expenses);
  const products = useAppStore((s) => s.products);
  const employees = useAppStore((s) => s.employees);
  const customers = useAppStore((s) => s.customers);

  const sales = useMemo(() => allSales.filter((s) => s.status === "Completed"), [allSales]);
  const chartData = range === "today" ? hourlyChart : weeklyChart;
  const creditOutstanding = useMemo(() => customers.reduce((a, c) => a + c.creditBalance, 0), [customers]);
  const expenseChart = useMemo(() => expenses.map((e) => ({ name: e.category, value: e.amount })), [expenses]);

  const gross = sales.reduce((a, s) => a + s.total, 0);
  const cogs = sales.reduce((a, s) => a + s.items.reduce((x, i) => x + i.cost, 0), 0);
  const netSales = gross;
  const grossProfit = netSales - cogs;
  const expenseTotal = expenses.reduce((a, e) => a + e.amount, 0);
  const netProfit = grossProfit - expenseTotal / 4;
  const itemsSold = sales.reduce((a, s) => a + s.items.reduce((x, i) => x + i.quantity, 0), 0);

  const productPerf = useMemo(() => {
    const map = new Map<string, { name: string; units: number; revenue: number; profit: number }>();
    for (const s of sales) {
      for (const i of s.items) {
        const cur = map.get(i.name) ?? { name: i.name, units: 0, revenue: 0, profit: 0 };
        cur.units += i.quantity;
        cur.revenue += i.total;
        cur.profit += i.total - i.cost;
        map.set(i.name, cur);
      }
    }
    return [...map.values()].sort((a, b) => b.revenue - a.revenue);
  }, [sales]);

  const empPerf = useMemo(
    () =>
      employees.map((e) => ({
        name: e.name,
        tickets: sales.filter((s) => s.cashierId === e.id).length,
        sales: sales.filter((s) => s.cashierId === e.id).reduce((a, s) => a + s.total, 0),
      })),
    [employees, sales],
  );

  return (
    <>
      <TopHeader title="Reports" />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-6">
        <PageHeader
          title="Reports"
          description="Sales, profit, inventory and khata"
          actions={
            <>
              <ExportMenu filename="report" rows={productPerf.map((p) => ({ product: p.name, units: p.units, revenue: p.revenue }))} />
              <Button variant="outline" onClick={() => toastPrint()}>
                Print
              </Button>
            </>
          }
        />
        <div className="mt-4 md:hidden">
          <select
            className="h-11 w-full rounded-xl border border-input bg-card px-3 text-sm"
            value={report}
            onChange={(e) => setReport(e.target.value as (typeof REPORTS)[number])}
          >
            {REPORTS.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>
        <div className="mt-4 hidden flex-wrap gap-2 md:flex">
          {REPORTS.map((r) => (
            <Button key={r} size="sm" variant={report === r ? "default" : "outline"} onClick={() => setReport(r)}>
              {r}
            </Button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {["today", "yesterday", "week", "month", "last_month", "year"].map((r) => (
            <button key={r} onClick={() => setRange(r)} className={`rounded-full px-3 py-1 text-xs ${range === r ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
              {r.replace("_", " ")}
            </button>
          ))}
        </div>

        {(report === "Sales Report" || report === "Profit Report") && (
          <>
            <div className="mt-4 grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
              <StatCard label="Gross Sales" value={formatPKR(gross)} />
              <StatCard label="Net Sales" value={formatPKR(netSales)} />
              <StatCard label="Profit" value={formatPKR(grossProfit)} />
              <StatCard label="Orders" value={String(sales.length)} />
              <StatCard label="Items sold" value={String(itemsSold)} />
              <StatCard label="Avg order" value={formatPKR(sales.length ? gross / sales.length : 0)} />
            </div>
            {report === "Profit Report" && (
              <Card className="mt-4 p-5 text-sm">
                <p>Sales revenue {formatPKR(gross)}</p>
                <p>− Cost of goods sold {formatPKR(cogs)}</p>
                <p className="font-semibold">= Gross profit {formatPKR(grossProfit)}</p>
                <p>− Expenses (period share) {formatPKR(expenseTotal / 4)}</p>
                <p className="text-lg font-semibold text-primary">= Net profit {formatPKR(netProfit)}</p>
                <p className="mt-2 text-xs text-muted-foreground">vs previous period +8.4%</p>
              </Card>
            )}
            <Card className="mt-4 p-4">
              <div className="h-52 w-full min-w-0 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                    <YAxis width={36} tickFormatter={(v) => `${v / 1000}k`} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => formatPKR(Number(v ?? 0))} />
                    <Area dataKey="sales" stroke="#0f766e" fill="#0f766e33" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </>
        )}

        {(report === "Product Sales" || report === "Category Sales") && (
          <Card className="mt-4 overflow-x-auto p-4">
            <table className="w-full min-w-[480px] text-sm">
              <thead className="text-left text-xs text-muted-foreground">
                <tr>
                  <th className="pb-2">Product</th>
                  <th>Units</th>
                  <th>Revenue</th>
                  <th>Profit</th>
                </tr>
              </thead>
              <tbody>
                {(report === "Product Sales" ? productPerf : productPerf.slice(0, 8)).map((p) => (
                  <tr key={p.name} className="border-t border-border">
                    <td className="max-w-[220px] truncate py-2">{p.name}</td>
                    <td>{p.units}</td>
                    <td>{formatPKR(p.revenue)}</td>
                    <td>{formatPKR(p.profit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {report.startsWith("Inventory") || report === "Stock Movement" ? (
          <Card className="mt-4 p-4">
            <p className="text-sm text-muted-foreground">
              On-hand value {formatPKR(products.reduce((a, p) => a + p.stock * p.purchasePrice, 0))} · {products.filter((p) => p.stock <= p.minStock).length} low-stock SKUs
            </p>
          </Card>
        ) : null}

        {report === "Credit / Khata Report" && (
          <Card className="mt-4 p-4 text-sm">
            Outstanding customer credit {formatPKR(creditOutstanding)}
          </Card>
        )}

        {report === "Expense Report" && (
          <Card className="mt-4 p-4">
            <div className="h-48 w-full min-w-0 sm:h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={expenseChart}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={44} />
                  <Tooltip formatter={(v) => formatPKR(Number(v ?? 0))} />
                  <Bar dataKey="value" fill="#d97706" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {report === "Employee Performance" && (
          <Card className="mt-4 overflow-x-auto p-4">
            <table className="w-full min-w-[360px] text-sm">
              <thead className="text-left text-xs text-muted-foreground">
                <tr>
                  <th className="pb-2">Employee</th>
                  <th>Tickets</th>
                  <th>Sales</th>
                </tr>
              </thead>
              <tbody>
                {empPerf.map((e) => (
                  <tr key={e.name} className="border-t border-border">
                    <td className="py-2">{e.name}</td>
                    <td>{e.tickets}</td>
                    <td>{formatPKR(e.sales)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {["Purchase Report", "Supplier Report", "Customer Report", "Cash Register Report", "Tax Report"].includes(report) && (
          <Card className="mt-4 p-6 text-sm text-muted-foreground">
            Showing {report.toLowerCase()} for the selected range. Export CSV/Excel/PDF from the toolbar. Tax is currently 0% in store settings.
          </Card>
        )}

        {(report === "Product Sales") && (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Card className="p-4">
              <h3 className="font-semibold">Best selling</h3>
              {productPerf.slice(0, 3).map((p) => (
                <p key={p.name} className="text-sm">{p.name}</p>
              ))}
            </Card>
            <Card className="p-4">
              <h3 className="font-semibold">Slow moving / out of stock</h3>
              {products.filter((p) => p.stock <= 6).slice(0, 4).map((p) => (
                <p key={p.id} className="text-sm">{p.name} · {p.stock}</p>
              ))}
            </Card>
          </div>
        )}
      </div>
    </>
  );
}

function toastPrint() {
  window.print();
}
