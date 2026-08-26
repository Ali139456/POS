"use client";

import { useMemo, useState } from "react";
import { TopHeader } from "@/components/layout/top-header";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Card } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store/app-store";
import { formatPKR } from "@/lib/utils";

export default function BarcodesPage() {
  const products = useAppStore((s) => s.products);
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [qty, setQty] = useState(10);
  const [size, setSize] = useState("medium");
  const product = products.find((p) => p.id === productId);

  const labels = useMemo(() => Array.from({ length: qty }, (_, i) => i), [qty]);

  return (
    <>
      <TopHeader title="Barcode labels" />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-6">
        <PageHeader
          title="Barcode management"
          description="Print shelf and pack labels"
          actions={<Button onClick={() => window.print()}>Print sheet</Button>}
        />
        <div className="mt-4 grid gap-4 lg:grid-cols-[280px_1fr]">
          <Card className="p-4 space-y-3 no-print">
            <div>
              <Label>Product</Label>
              <Select className="mt-1" value={productId} onChange={(e) => setProductId(e.target.value)}>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Quantity</Label>
              <Input className="mt-1" type="number" value={qty} onChange={(e) => setQty(Number(e.target.value) || 1)} />
            </div>
            <div>
              <Label>Size</Label>
              <Select className="mt-1" value={size} onChange={(e) => setSize(e.target.value)}>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </Select>
            </div>
          </Card>
          <Card className="p-4">
            <div className={`grid gap-3 ${size === "small" ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4" : size === "large" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-2 sm:grid-cols-3"}`}>
              {product &&
                labels.map((i) => (
                  <div key={i} className="rounded-lg border border-border p-3 text-center">
                    <p className="line-clamp-2 min-h-[2rem] text-xs font-semibold">{product.name}</p>
                    <p className="text-sm font-bold">{formatPKR(product.sellingPrice)}</p>
                    <p className="my-1 font-mono text-lg tracking-[0.25em]">|||| |||| ||||</p>
                    <p className="font-mono text-[10px]">{product.barcode}</p>
                    <p className="text-[10px] text-muted-foreground">{product.sku}</p>
                  </div>
                ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
