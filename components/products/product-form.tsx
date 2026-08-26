"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TopHeader } from "@/components/layout/top-header";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, Select } from "@/components/ui/input";
import { Card } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store/app-store";
import { profitMargin, uid } from "@/lib/utils";
import type { Product, Unit } from "@/lib/types";
import { toast } from "sonner";

const UNITS: Unit[] = ["Piece", "Pack", "Box", "Carton", "Bag", "KG", "Gram", "Liter", "ML"];

export function ProductForm({ existing }: { existing?: Product }) {
  const categories = useAppStore((s) => s.categories);
  const suppliers = useAppStore((s) => s.suppliers);
  const upsert = useAppStore((s) => s.upsertProduct);
  const router = useRouter();
  const [form, setForm] = useState({
    name: existing?.name ?? "",
    description: existing?.description ?? "",
    categoryId: existing?.categoryId ?? categories[0]?.id ?? "",
    brand: existing?.brand ?? "",
    sku: existing?.sku ?? "",
    barcode: existing?.barcode ?? "",
    purchasePrice: existing?.purchasePrice ?? 0,
    sellingPrice: existing?.sellingPrice ?? 0,
    wholesalePrice: existing?.wholesalePrice ?? 0,
    minSellingPrice: existing?.minSellingPrice ?? 0,
    stock: existing?.stock ?? 0,
    minStock: existing?.minStock ?? 5,
    maxStock: existing?.maxStock ?? 50,
    unit: (existing?.unit ?? "Piece") as Unit,
    supplierId: existing?.supplierId ?? suppliers[0]?.id ?? "",
    manufacturingDate: existing?.manufacturingDate ?? "",
    expiryDate: existing?.expiryDate ?? "",
    batchNumber: existing?.batchNumber ?? "",
  });
  const profit = profitMargin(form.purchasePrice, form.sellingPrice);
  const set = (k: string, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  function save() {
    if (!form.name) {
      toast.error("Product name is required");
      return;
    }
    const product: Product = {
      id: existing?.id ?? uid("p"),
      ...form,
      reserved: existing?.reserved ?? 0,
      status: existing?.status ?? "Active",
      imageHue: existing?.imageHue ?? Math.floor(Math.random() * 360),
      variants: existing?.variants ?? [],
    };
    upsert(product);
    toast.success(existing ? "Product updated" : "Product added");
    router.push("/products");
  }

  return (
    <>
      <TopHeader title={existing ? "Edit product" : "Add product"} />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-6">
        <PageHeader
          title={existing ? "Edit product" : "Add product"}
          description="Pricing, inventory and expiry in one place"
          actions={
            <>
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button onClick={save}>Save product</Button>
            </>
          }
        />
        <div className="mt-4 grid gap-4 xl:grid-cols-3">
          <Card className="space-y-4 p-5 xl:col-span-2">
            <h2 className="font-semibold">Basic information</h2>
            <Field label="Product name">
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
            </Field>
            <Field label="Description">
              <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Category">
                <Select value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Brand">
                <Input value={form.brand} onChange={(e) => set("brand", e.target.value)} />
              </Field>
              <Field label="SKU">
                <div className="flex min-w-0 flex-col gap-2 min-[480px]:flex-row">
                  <Input className="min-w-0 flex-1" value={form.sku} onChange={(e) => set("sku", e.target.value)} />
                  <Button variant="outline" type="button" onClick={() => set("sku", `SKU-${uid("").slice(0, 8).toUpperCase()}`)}>
                    Generate
                  </Button>
                </div>
              </Field>
              <Field label="Barcode">
                <div className="flex min-w-0 flex-col gap-2 min-[480px]:flex-row">
                  <Input className="min-w-0 flex-1" value={form.barcode} onChange={(e) => set("barcode", e.target.value)} />
                  <Button variant="outline" type="button" onClick={() => set("barcode", String(Math.floor(2000000000000 + Math.random() * 1e10)))}>
                    Generate
                  </Button>
                </div>
              </Field>
            </div>
          </Card>
          <Card className="space-y-3 p-5">
            <h2 className="font-semibold">Pricing</h2>
            <Field label="Purchase price">
              <Input type="number" value={form.purchasePrice} onChange={(e) => set("purchasePrice", Number(e.target.value))} />
            </Field>
            <Field label="Selling price">
              <Input type="number" value={form.sellingPrice} onChange={(e) => set("sellingPrice", Number(e.target.value))} />
            </Field>
            <Field label="Wholesale price">
              <Input type="number" value={form.wholesalePrice} onChange={(e) => set("wholesalePrice", Number(e.target.value))} />
            </Field>
            <Field label="Minimum selling price">
              <Input type="number" value={form.minSellingPrice} onChange={(e) => set("minSellingPrice", Number(e.target.value))} />
            </Field>
            <div className="rounded-xl bg-accent px-3 py-3 text-sm">
              <p>Profit: Rs. {profit.amount.toLocaleString("en-PK")}</p>
              <p>Margin: {profit.percent.toFixed(1)}%</p>
            </div>
          </Card>
          <Card className="space-y-3 p-5 xl:col-span-2">
            <h2 className="font-semibold">Inventory</h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <Field label="Opening / current stock">
                <Input type="number" value={form.stock} onChange={(e) => set("stock", Number(e.target.value))} />
              </Field>
              <Field label="Minimum stock">
                <Input type="number" value={form.minStock} onChange={(e) => set("minStock", Number(e.target.value))} />
              </Field>
              <Field label="Maximum stock">
                <Input type="number" value={form.maxStock} onChange={(e) => set("maxStock", Number(e.target.value))} />
              </Field>
              <Field label="Unit">
                <Select value={form.unit} onChange={(e) => set("unit", e.target.value)}>
                  {UNITS.map((u) => (
                    <option key={u}>{u}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Supplier">
                <Select value={form.supplierId} onChange={(e) => set("supplierId", e.target.value)}>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.company}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </Card>
          <Card className="space-y-3 p-5">
            <h2 className="font-semibold">Expiry / batch</h2>
            <Field label="Manufacturing date">
              <Input type="date" value={form.manufacturingDate} onChange={(e) => set("manufacturingDate", e.target.value)} />
            </Field>
            <Field label="Expiry date">
              <Input type="date" value={form.expiryDate} onChange={(e) => set("expiryDate", e.target.value)} />
            </Field>
            <Field label="Batch number">
              <Input value={form.batchNumber} onChange={(e) => set("batchNumber", e.target.value)} />
            </Field>
          </Card>
        </div>
        {existing?.variants.length ? (
          <Card className="mt-4 p-5">
            <h2 className="font-semibold">Variants</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="pb-2">Name</th>
                    <th>SKU</th>
                    <th>Barcode</th>
                    <th>Purchase</th>
                    <th>Selling</th>
                    <th>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {existing.variants.map((v) => (
                    <tr key={v.id} className="border-t border-border">
                      <td className="py-2">{v.name}</td>
                      <td className="font-mono text-xs">{v.sku}</td>
                      <td className="font-mono text-xs">{v.barcode}</td>
                      <td>{v.purchasePrice}</td>
                      <td>{v.sellingPrice}</td>
                      <td>{v.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : null}
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
