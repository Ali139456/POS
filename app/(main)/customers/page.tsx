"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TopHeader } from "@/components/layout/top-header";
import { PageHeader, EmptyState } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input, Label, Select } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useAppStore } from "@/lib/store/app-store";
import { formatPKR, uid } from "@/lib/utils";
import type { Customer, CustomerType } from "@/lib/types";
import { toast } from "sonner";

export default function CustomersPage() {
  const customers = useAppStore((s) => s.customers);
  const upsert = useAppStore((s) => s.upsertCustomer);
  const remove = useAppStore((s) => s.deleteCustomer);
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [del, setDel] = useState<Customer | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", whatsapp: "", email: "", address: "", type: "Regular" as CustomerType });
  const rows = useMemo(
    () => customers.filter((c) => c.id !== "cust_walkin" && `${c.name} ${c.phone}`.toLowerCase().includes(q.toLowerCase())),
    [customers, q],
  );

  return (
    <>
      <TopHeader title="Customers" />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-6">
        <PageHeader
          title="Customers"
          description="Regulars, wholesale and VIP accounts"
          actions={
            <>
              <Button variant="outline" onClick={() => router.push("/customers/khata")}>
                Khata / Udhaar
              </Button>
              <Button onClick={() => setOpen(true)}>Add customer</Button>
            </>
          }
        />
        <Card className="mt-4 p-4">
          <SearchInput value={q} onChange={setQ} placeholder="Name or phone" className="max-w-sm" />
          {rows.length === 0 ? (
            <div className="mt-6">
              <EmptyState title="No customers found" />
            </div>
          ) : (
            <>
              <div className="mt-4 space-y-2 md:hidden">
                {rows.map((c) => (
                  <div key={c.id} className="rounded-xl border border-border p-3">
                    <button className="block w-full truncate text-left font-medium text-primary" onClick={() => router.push(`/customers/${c.id}`)}>
                      {c.name}
                    </button>
                    <p className="truncate text-xs text-muted-foreground">{c.phone}</p>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                      <StatusBadge status={c.type} />
                      <p className="text-sm font-semibold tabular-nums">{formatPKR(c.totalPurchases)}</p>
                    </div>
                    {c.creditBalance > 0 && (
                      <p className="mt-1 text-xs font-medium text-warning">Credit {formatPKR(c.creditBalance)}</p>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 hidden overflow-x-auto md:block">
                <table className="w-full min-w-[900px] text-sm">
                <thead className="text-left text-xs text-muted-foreground">
                  <tr>
                    {["Name", "Phone", "Type", "Purchases", "Orders", "Avg order", "Credit", "Points", ""].map((h, i) => (
                      <th key={i} className="pb-2 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((c) => (
                    <tr key={c.id} className="border-t border-border">
                      <td className="py-2.5">
                        <button className="font-medium text-primary" onClick={() => router.push(`/customers/${c.id}`)}>
                          {c.name}
                        </button>
                      </td>
                      <td>{c.phone}</td>
                      <td>
                        <StatusBadge status={c.type} />
                      </td>
                      <td>{formatPKR(c.totalPurchases)}</td>
                      <td>{c.totalOrders}</td>
                      <td>{formatPKR(c.totalOrders ? c.totalPurchases / c.totalOrders : 0)}</td>
                      <td className={c.creditBalance > 0 ? "text-warning font-medium" : ""}>{formatPKR(c.creditBalance)}</td>
                      <td>{c.loyaltyPoints}</td>
                      <td>
                        <Button size="sm" variant="ghost" onClick={() => setDel(c)}>
                          Delete
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
      <Dialog open={open} onClose={() => setOpen(false)} title="New customer">
        <div className="space-y-3">
          {(["name", "phone", "whatsapp", "email", "address"] as const).map((k) => (
            <div key={k}>
              <Label className="capitalize">{k}</Label>
              <Input className="mt-1" value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
            </div>
          ))}
          <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as CustomerType })}>
            {["Walk-in", "Regular", "Wholesale", "VIP"].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Select>
          <Button
            className="w-full"
            onClick={() => {
              upsert({
                id: uid("cust"),
                ...form,
                totalPurchases: 0,
                totalOrders: 0,
                creditBalance: 0,
                loyaltyPoints: 0,
              });
              toast.success("Customer added");
              setOpen(false);
            }}
          >
            Save
          </Button>
        </div>
      </Dialog>
      <ConfirmDialog
        open={!!del}
        onClose={() => setDel(null)}
        title="Delete customer?"
        description={del?.name ?? ""}
        destructive
        confirmLabel="Delete"
        onConfirm={() => del && remove(del.id)}
      />
    </>
  );
}
