"use client";

import { useRouter } from "next/navigation";
import { TopHeader } from "@/components/layout/top-header";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store/app-store";
import { formatPKR } from "@/lib/utils";

export default function SuppliersPage() {
  const suppliers = useAppStore((s) => s.suppliers);
  const router = useRouter();
  return (
    <>
      <TopHeader title="Suppliers" />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-6">
        <PageHeader
          title="Suppliers"
          description="Distributors and mandi vendors"
          actions={<Button onClick={() => router.push("/purchase-orders/new")}>Create purchase order</Button>}
        />
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {suppliers.map((s) => (
            <Card key={s.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <button className="block max-w-full truncate text-left text-lg font-semibold hover:text-primary" onClick={() => router.push(`/suppliers/${s.id}`)}>
                    {s.company}
                  </button>
                  <p className="text-sm text-muted-foreground">{s.name}</p>
                  <p className="mt-1 truncate text-sm">{s.phone} · {s.email}</p>
                  <p className="truncate text-xs text-muted-foreground">{s.address} · NTN {s.ntn}</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-xl bg-muted px-3 py-2">
                  Purchases
                  <p className="font-semibold">{formatPKR(s.totalPurchases)}</p>
                </div>
                <div className="rounded-xl bg-muted px-3 py-2">
                  Outstanding
                  <p className="font-semibold">{formatPKR(s.outstandingBalance)}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => router.push("/purchase-orders/new")}>
                  Create PO
                </Button>
                <Button size="sm" variant="ghost" onClick={() => router.push(`/suppliers/${s.id}`)}>
                  Record payment
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
