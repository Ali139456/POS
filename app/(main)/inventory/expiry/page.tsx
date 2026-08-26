"use client";

import { useState } from "react";
import { TopHeader } from "@/components/layout/top-header";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store/app-store";
import { daysUntil, formatDate, formatPKR } from "@/lib/utils";

const FILTERS = [
  { id: "expired", label: "Expired", max: -1 },
  { id: "7", label: "7 Days", max: 7 },
  { id: "30", label: "30 Days", max: 30 },
  { id: "60", label: "60 Days", max: 60 },
  { id: "90", label: "90 Days", max: 90 },
] as const;

export default function ExpiryPage() {
  const products = useAppStore((s) => s.products);
  const [f, setF] = useState<(typeof FILTERS)[number]["id"]>("30");
  const max = FILTERS.find((x) => x.id === f)!.max;
  const rows = products
    .map((p) => ({ p, days: daysUntil(p.expiryDate) }))
    .filter((x) => x.days !== null && (f === "expired" ? x.days! < 0 : x.days! <= max && x.days! >= 0));

  return (
    <>
      <TopHeader title="Expiry" />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-6">
        <PageHeader title="Expiry management" description="Watch dairy, bakery and frozen dates" />
        <div className="mt-4 flex flex-wrap gap-2">
          {FILTERS.map((x) => (
            <Button key={x.id} size="sm" variant={f === x.id ? "default" : "outline"} onClick={() => setF(x.id)}>
              {x.label}
            </Button>
          ))}
        </div>
        <Card className="mt-4 p-4">
          {rows.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">No products in this window 🎉</p>
          ) : (
            <>
              <div className="space-y-2 md:hidden">
                {rows.map(({ p, days }) => {
                  const tone = days! < 0 ? "text-destructive" : days! <= 7 ? "text-warning" : "text-foreground";
                  return (
                    <div key={p.id} className="rounded-xl border border-border p-3">
                      <p className="truncate font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.batchNumber ?? "—"} · qty {p.stock}</p>
                      <p className={`mt-1 text-sm font-medium ${tone}`}>{days! < 0 ? "Expired" : `${days} days`} · {p.expiryDate ? formatDate(p.expiryDate) : "—"}</p>
                      <p className="text-sm tabular-nums">{formatPKR(p.stock * p.purchasePrice)}</p>
                    </div>
                  );
                })}
              </div>
              <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="text-left text-xs text-muted-foreground">
                <tr>
                  <th className="pb-2">Product</th>
                  <th>Batch</th>
                  <th>Qty</th>
                  <th>Expiry</th>
                  <th>Days</th>
                  <th>Value</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ p, days }) => {
                  const tone = days! < 0 ? "text-destructive" : days! <= 7 ? "text-warning" : "text-foreground";
                  return (
                    <tr key={p.id} className="border-t border-border">
                      <td className="max-w-[200px] truncate py-2.5 font-medium">{p.name}</td>
                      <td>{p.batchNumber ?? "—"}</td>
                      <td>{p.stock}</td>
                      <td>{p.expiryDate ? formatDate(p.expiryDate) : "—"}</td>
                      <td className={tone}>{days}</td>
                      <td>{formatPKR(p.stock * p.purchasePrice)}</td>
                      <td className={tone}>{days! < 0 ? "Expired" : days! <= 7 ? "Critical" : "Watch"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
              </div>
            </>
          )}
        </Card>
      </div>
    </>
  );
}
