"use client";

import { formatPKR, formatQty } from "@/lib/utils";
import type { Product } from "@/lib/types";
import { ProductThumb } from "@/components/shared/thumbs";
import { Badge } from "@/components/ui/badge";

export function ProductCard({ product, onAdd }: { product: Product; onAdd: () => void }) {
  const out = product.stock <= 0 && product.variants.every((v) => v.stock <= 0);
  return (
    <button
      onClick={onAdd}
      disabled={out}
      className="group flex h-full min-h-[132px] flex-col rounded-xl border border-border bg-card p-2.5 text-left shadow-sm transition hover:border-primary/40 hover:shadow-md disabled:opacity-50 min-[800px]:min-h-[148px] min-[800px]:rounded-2xl min-[800px]:p-3"
    >
      <div className="flex items-start justify-between gap-2">
        <ProductThumb product={product} size="sm" />
        {product.variants.length > 0 && <Badge tone="primary">Variants</Badge>}
      </div>
      <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug">{product.name}</p>
      <p className="mt-auto truncate text-sm font-semibold text-primary min-[800px]:text-base">{formatPKR(product.sellingPrice)}</p>
      <p className="mt-0.5 truncate text-[11px] text-muted-foreground min-[800px]:text-xs">
        {out ? "Out of stock" : `${formatQty(product.stock)} in stock`} · {product.unit}
      </p>
    </button>
  );
}
