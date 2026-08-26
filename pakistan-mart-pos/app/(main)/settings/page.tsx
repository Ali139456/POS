"use client";

import { useState } from "react";
import { TopHeader } from "@/components/layout/top-header";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/badge";
import { Input, Label, Textarea } from "@/components/ui/input";
import { ReceiptPreview } from "@/components/pos/receipt-preview";
import { useAppStore } from "@/lib/store/app-store";
import { toast } from "sonner";
import type { Store } from "@/lib/types";

const TABS = [
  "Store Information",
  "POS Settings",
  "Receipt Settings",
  "Tax Settings",
  "Payment Methods",
  "Inventory Settings",
  "Barcode Settings",
  "Users & Permissions",
  "Backup",
  "Notifications",
] as const;

export default function SettingsPage() {
  const store = useAppStore((s) => s.store);
  const setStore = useAppStore((s) => s.setStore);
  const methods = useAppStore((s) => s.paymentMethods);
  const toggle = useAppStore((s) => s.togglePaymentMethod);
  const sales = useAppStore((s) => s.sales);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Store Information");
  const [draft, setDraft] = useState<Store>(store);

  const sample = sales[0];

  return (
    <>
      <TopHeader title="Settings" />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-6">
        <PageHeader title="Store settings" description="Branding, receipts, tax and payments" />
        <div className="-mx-1 mt-4 overflow-x-auto pb-1 scrollbar-thin">
          <div className="flex w-max gap-2 px-1">
          {TABS.map((t) => (
            <Button key={t} size="sm" variant={tab === t ? "default" : "outline"} onClick={() => setTab(t)}>
              {t}
            </Button>
          ))}
          </div>
        </div>

        {tab === "Store Information" && (
          <Card className="mt-4 grid gap-3 p-5 sm:grid-cols-2">
            <Field label="Store name">
              <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </Field>
            <Field label="Phone">
              <Input value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
            </Field>
            <Field label="WhatsApp">
              <Input value={draft.whatsapp} onChange={(e) => setDraft({ ...draft, whatsapp: e.target.value })} />
            </Field>
            <Field label="Email">
              <Input value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
            </Field>
            <Field label="Address">
              <Input value={draft.address} onChange={(e) => setDraft({ ...draft, address: e.target.value })} />
            </Field>
            <Field label="NTN">
              <Input value={draft.ntn} onChange={(e) => setDraft({ ...draft, ntn: e.target.value })} />
            </Field>
            <Field label="STRN">
              <Input value={draft.strn} onChange={(e) => setDraft({ ...draft, strn: e.target.value })} />
            </Field>
            <div className="sm:col-span-2">
              <Button
                onClick={() => {
                  setStore(draft);
                  toast.success("Store details saved");
                }}
              >
                Save
              </Button>
            </div>
          </Card>
        )}

        {tab === "Receipt Settings" && (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <Card className="space-y-3 p-5">
              {(
                [
                  ["receiptShowLogo", "Store Logo"],
                  ["receiptShowAddress", "Store Address"],
                  ["receiptShowPhone", "Phone"],
                  ["receiptShowNtn", "NTN"],
                  ["receiptShowCashier", "Cashier"],
                  ["receiptShowCustomer", "Customer"],
                  ["receiptShowBarcode", "Barcode"],
                  ["receiptShowTax", "Tax"],
                  ["receiptShowDiscount", "Discount"],
                ] as const
              ).map(([k, label]) => (
                <label key={k} className="flex items-center justify-between text-sm">
                  {label}
                  <input type="checkbox" checked={Boolean(draft[k])} onChange={(e) => setDraft({ ...draft, [k]: e.target.checked })} />
                </label>
              ))}
              <Field label="Footer message">
                <Textarea value={draft.receiptFooter} onChange={(e) => setDraft({ ...draft, receiptFooter: e.target.value })} />
              </Field>
              <Field label="Receipt size">
                <select
                  className="h-10 w-full rounded-xl border border-input bg-card px-3 text-sm"
                  value={draft.receiptSize}
                  onChange={(e) => setDraft({ ...draft, receiptSize: e.target.value as Store["receiptSize"] })}
                >
                  <option>58mm</option>
                  <option>80mm</option>
                  <option>A4</option>
                </select>
              </Field>
              <Button
                onClick={() => {
                  setStore(draft);
                  toast.success("Receipt settings saved");
                }}
              >
                Save
              </Button>
            </Card>
            {sample && <ReceiptPreview sale={sample} />}
          </div>
        )}

        {tab === "Payment Methods" && (
          <Card className="mt-4 divide-y divide-border p-2">
            {methods.filter((m) => m.id !== "Split").map((m) => (
              <label key={m.id} className="flex items-center justify-between px-3 py-3 text-sm">
                {m.id}
                <input type="checkbox" checked={m.enabled} onChange={() => toggle(m.id)} />
              </label>
            ))}
          </Card>
        )}

        {tab === "Tax Settings" && (
          <Card className="mt-4 max-w-sm space-y-3 p-5">
            <Field label="Sales tax %">
              <Input
                type="number"
                value={draft.taxRate * 100}
                onChange={(e) => setDraft({ ...draft, taxRate: Number(e.target.value) / 100 })}
              />
            </Field>
            <Button onClick={() => { setStore(draft); toast.success("Tax updated"); }}>Save</Button>
          </Card>
        )}

        {tab === "POS Settings" && (
          <Card className="mt-4 p-5 text-sm text-muted-foreground">
            Barcode-first search, F-key shortcuts, and large cart totals are enabled. Default customer is Walk-in Customer.
          </Card>
        )}
        {tab === "Inventory Settings" && (
          <Card className="mt-4 p-5 text-sm text-muted-foreground">Low-stock alerts fire when available quantity is at or below the product minimum.</Card>
        )}
        {tab === "Barcode Settings" && (
          <Card className="mt-4 p-5 text-sm text-muted-foreground">Default label size medium. Print from Products → Print Barcodes.</Card>
        )}
        {tab === "Users & Permissions" && (
          <Card className="mt-4 p-5 text-sm text-muted-foreground">Manage roles on the Employees page. Cashiers use 4-digit PIN login.</Card>
        )}
        {tab === "Backup" && (
          <Card className="mt-4 p-5">
            <Button variant="outline" onClick={() => toast.success("Mock backup exported")}>
              Export backup JSON
            </Button>
          </Card>
        )}
        {tab === "Notifications" && (
          <Card className="mt-4 p-5 text-sm text-muted-foreground">Low stock, expiry, overdue khata, supplier payables and register differences appear in the bell menu.</Card>
        )}
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1.5 block">{label}</Label>
      {children}
    </div>
  );
}
