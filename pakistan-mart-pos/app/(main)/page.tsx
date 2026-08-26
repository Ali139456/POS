"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowUpRight, Banknote, CreditCard, Package, ShoppingCart, TrendingUp, Users, Wallet } from "lucide-react";
import { format } from "date-fns";
import { TopHeader } from "@/components/layout/top-header";
import { StatCard } from "@/components/shared/page-header";
import { Badge, Card } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StockBadge } from "@/components/shared/status-badge";
import { ProductThumb } from "@/components/shared/thumbs";
import { useAppStore, useCurrentEmployee } from "@/lib/store/app-store";
import { formatDateTime, formatPKR, greeting, stockStatus } from "@/lib/utils";
import { hourlyChart, weeklyChart } from "@/lib/mock/seed";
import { useRouter } from "next/navigation";
import type { PaymentMethod } from "@/lib/types";

const PAY_COLORS: Record<string, string> = {
  Cash: "#0f766e",
  Card: "#0369a1",
  "Bank Transfer": "#7c3aed",
  JazzCash: "#c2410c",
  EasyPaisa: "#15803d",
  Credit: "#b45309",
};

export default function DashboardPage() {
  const employee = useCurrentEmployee();
  const sales = useAppStore((s) => s.sales);
  const products = useAppStore((s) => s.products);
  const customers = useAppStore((s) => s.customers);
  const suppliers = useAppStore((s) => s.suppliers);
  const categories = useAppStore((s) => s.categories);
  const router = useRouter();
  const [range, setRange] = useState<"today" | "7d" | "30d" | "3m" | "1y">("7d");

  const todaySales = sales.filter((s) => s.status === "Completed" && s.date.startsWith("2026-08-26"));
  const todayTotal = todaySales.reduce((a, s) => a + s.total, 0);
  const todayProfit = todaySales.reduce(
    (a, s) => a + s.items.reduce((x, i) => x + (i.unitPrice * i.quantity - i.cost - i.discount), 0) - s.orderDiscount,
    0,
  );
  const cashSales = todaySales.reduce((a, s) => a + s.payments.filter((p) => p.method === "Cash").reduce((x, p) => x + p.amount, 0), 0);
  const cardOnline = todaySales.reduce(
    (a, s) => a + s.payments.filter((p) => ["Card", "Bank Transfer", "JazzCash", "EasyPaisa"].includes(p.method)).reduce((x, p) => x + p.amount, 0),
    0,
  );
  const aov = todaySales.length ? todayTotal / todaySales.length : 0;

  const paymentData = useMemo(() => {
    const map: Record<string, number> = { Cash: 0, Card: 0, "Bank Transfer": 0, JazzCash: 0, EasyPaisa: 0, Credit: 0 };
    for (const s of todaySales) {
      for (const p of s.payments) {
        const key = p.method === "Customer Credit" ? "Credit" : p.method;
        if (key in map) map[key] += p.amount;
      }
    }
    return Object.entries(map)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }));
  }, [todaySales]);

  const chartData = range === "today" ? hourlyChart : weeklyChart;
  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; units: number; revenue: number; profit: number }>();
    for (const s of sales.filter((x) => x.status === "Completed")) {
      for (const i of s.items) {
        const cur = map.get(i.name) ?? { name: i.name, units: 0, revenue: 0, profit: 0 };
        cur.units += i.quantity;
        cur.revenue += i.total;
        cur.profit += i.total - i.cost;
        map.set(i.name, cur);
      }
    }
    return [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [sales]);

  const lowStock = products.filter((p) => stockStatus(p.stock, p.minStock, p.maxStock) !== "In Stock" && p.stock <= p.minStock);
  const inventoryValue = products.reduce((a, p) => a + p.stock * p.purchasePrice, 0);
  const creditOut = customers.reduce((a, c) => a + c.creditBalance, 0);
  const supplierOut = suppliers.reduce((a, s) => a + s.outstandingBalance, 0);

  return (
    <>
      <TopHeader />
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin p-3 sm:p-4 lg:p-6">
        <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">
              {greeting()}, {employee.name.split(" ")[0]} 👋
            </h1>
            <p className="truncate text-sm text-muted-foreground">
              {format(new Date(), "EEEE, d MMMM yyyy")} · Al-Noor Super Mart, Gulberg III
            </p>
          </div>
          <Button onClick={() => router.push("/pos")}>
            <ShoppingCart className="size-4" />
            Open POS
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-6">
          <StatCard label="Today's Sales" value={formatPKR(todayTotal)} hint="vs yesterday" trend={{ value: "+12.5%", up: true }} icon={<TrendingUp className="size-4" />} />
          <StatCard label="Today's Profit" value={formatPKR(todayProfit)} hint="gross on today's tickets" icon={<Wallet className="size-4" />} />
          <StatCard label="Total Orders" value={String(todaySales.length)} hint="completed invoices" icon={<ShoppingCart className="size-4" />} />
          <StatCard label="Average Order" value={formatPKR(aov)} hint="today" icon={<ArrowUpRight className="size-4" />} />
          <StatCard label="Cash Sales" value={formatPKR(cashSales)} icon={<Banknote className="size-4" />} />
          <StatCard label="Card / Online" value={formatPKR(cardOnline)} icon={<CreditCard className="size-4" />} />
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-3">
          <Card className="p-4 xl:col-span-2">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-semibold">Sales Overview</h2>
                <p className="text-xs text-muted-foreground">Sales vs profit</p>
              </div>
              <div className="-mx-1 flex gap-1 overflow-x-auto rounded-xl bg-muted p-1 scrollbar-thin">
                {(["today", "7d", "30d", "3m", "1y"] as const).map((k) => (
                  <button
                    key={k}
                    onClick={() => setRange(k)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium ${range === k ? "bg-card shadow-sm" : "text-muted-foreground"}`}
                  >
                    {k === "today" ? "Today" : k === "7d" ? "7 Days" : k === "30d" ? "30 Days" : k === "3m" ? "3 Months" : "1 Year"}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-52 w-full min-w-0 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="sales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0f766e" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#0f766e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                  <YAxis width={36} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip formatter={(v) => formatPKR(Number(v ?? 0))} />
                  <Area type="monotone" dataKey="sales" stroke="#0f766e" fill="url(#sales)" strokeWidth={2} />
                  <Area type="monotone" dataKey="profit" stroke="#d97706" fill="transparent" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-4">
            <h2 className="font-semibold">Payment Methods</h2>
            <p className="text-xs text-muted-foreground">Today's mix</p>
            <div className="mt-2 h-44 w-full min-h-[176px] min-w-0 sm:h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={paymentData} dataKey="value" nameKey="name" innerRadius="42%" outerRadius="70%" paddingAngle={3}>
                    {paymentData.map((e) => (
                      <Cell key={e.name} fill={PAY_COLORS[e.name] ?? "#64748b"} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatPKR(Number(v ?? 0))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {paymentData.map((e) => (
                <div key={e.name} className="flex items-center gap-2">
                  <span className="size-2 rounded-full" style={{ background: PAY_COLORS[e.name] }} />
                  {e.name}
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <Card className="p-4">
            <h2 className="font-semibold">Top Selling Products</h2>
            <div className="mt-3 space-y-2 md:hidden">
              {topProducts.map((p) => (
                <div key={p.name} className="flex items-center justify-between gap-3 rounded-xl border border-border p-3">
                  <p className="min-w-0 truncate text-sm font-medium">{p.name}</p>
                  <p className="shrink-0 text-sm font-semibold tabular-nums">{formatPKR(p.revenue)}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 hidden overflow-x-auto md:block">
              <table className="w-full min-w-[520px] text-sm">
                <thead className="text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="pb-2 font-medium">Product</th>
                    <th className="pb-2 font-medium">Units</th>
                    <th className="pb-2 font-medium">Revenue</th>
                    <th className="pb-2 font-medium">Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((p) => (
                    <tr key={p.name} className="border-t border-border">
                      <td className="max-w-[220px] truncate py-2.5 font-medium">{p.name}</td>
                      <td>{p.units}</td>
                      <td>{formatPKR(p.revenue)}</td>
                      <td className="text-success">{formatPKR(p.profit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex min-w-0 items-center justify-between gap-2">
              <h2 className="truncate font-semibold">Low Stock Alerts</h2>
              <Button variant="ghost" size="sm" onClick={() => router.push("/inventory")}>
                View all
              </Button>
            </div>
            <div className="mt-3 space-y-2">
              {lowStock.slice(0, 5).map((p) => (
                <div key={p.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-2.5">
                  <ProductThumb product={p} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.stock} / min {p.minStock}
                    </p>
                  </div>
                  <StockBadge stock={p.stock} min={p.minStock} max={p.maxStock} />
                  <Button size="sm" variant="outline" className="w-full sm:w-auto" onClick={() => router.push("/purchase-orders/new")}>
                    Restock
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-3">
          <Card className="p-4 xl:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Recent Sales</h2>
              <Button variant="ghost" size="sm" onClick={() => router.push("/sales")}>
                See all
              </Button>
            </div>
            <div className="mt-3 space-y-2 md:hidden">
              {sales.slice(0, 6).map((s) => (
                <button
                  key={s.id}
                  onClick={() => router.push(`/sales/${s.id}`)}
                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-border p-3 text-left"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-primary">{s.invoiceNumber}</p>
                    <p className="truncate text-xs text-muted-foreground">{s.customerName}</p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold tabular-nums">{formatPKR(s.total)}</p>
                </button>
              ))}
            </div>
            <div className="mt-3 hidden overflow-x-auto md:block">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="pb-2 font-medium">Invoice</th>
                    <th className="pb-2 font-medium">Customer</th>
                    <th className="pb-2 font-medium">Cashier</th>
                    <th className="pb-2 font-medium">Items</th>
                    <th className="pb-2 font-medium">Payment</th>
                    <th className="pb-2 font-medium">Total</th>
                    <th className="pb-2 font-medium">When</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.slice(0, 6).map((s) => (
                    <tr
                      key={s.id}
                      className="cursor-pointer border-t border-border hover:bg-muted/50"
                      onClick={() => router.push(`/sales/${s.id}`)}
                    >
                      <td className="py-2.5 font-medium text-primary">{s.invoiceNumber}</td>
                      <td className="max-w-[140px] truncate">{s.customerName}</td>
                      <td>{s.cashierName}</td>
                      <td>{s.items.reduce((a, i) => a + i.quantity, 0)}</td>
                      <td>
                        <Badge tone="neutral">{s.paymentMethod}</Badge>
                      </td>
                      <td className="font-medium">{formatPKR(s.total)}</td>
                      <td className="text-muted-foreground">{formatDateTime(s.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="p-4">
            <h2 className="font-semibold">Business Statistics</h2>
            <div className="mt-3 space-y-3 text-sm">
              <Row icon={<Package className="size-4" />} label="Total Products" value={String(products.length)} />
              <Row icon={<Wallet className="size-4" />} label="Inventory Value" value={formatPKR(inventoryValue)} />
              <Row icon={<Users className="size-4" />} label="Customers" value={String(customers.filter((c) => c.id !== "cust_walkin").length)} />
              <Row icon={<Users className="size-4" />} label="Suppliers" value={String(suppliers.length)} />
              <Row icon={<CreditCard className="size-4" />} label="Customer Credit" value={formatPKR(creditOut)} />
              <Row icon={<Banknote className="size-4" />} label="Supplier Payables" value={formatPKR(supplierOut)} />
              <Row icon={<Package className="size-4" />} label="Categories" value={String(categories.length)} />
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-muted/60 px-3 py-2.5">
      <span className="flex items-center gap-2 text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="min-w-0 truncate font-medium tabular-nums">{value}</span>
    </div>
  );
}
