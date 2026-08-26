"use client";

import type { Product } from "@/lib/types";
import { Dialog } from "@/components/ui/dialog";
import { formatPKR } from "@/lib/utils";
import { usePosStore } from "@/lib/store/pos-store";
import { toast } from "sonner";

export function VariantDialog({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  const addProduct = usePosStore((s) => s.addProduct);
  if (!product) return null;

  return (
    <Dialog open={!!product} onClose={onClose} title={product.name} description="Choose a size / variant">
      <div className="grid grid-cols-2 gap-2">
        {product.variants.map((v) => (
          <button
            key={v.id}
            disabled={v.stock <= 0}
            onClick={() => {
              addProduct(product, v);
              toast.success(`${product.name} ${v.name} added to cart`);
              onClose();
            }}
            className="min-h-11 rounded-xl border border-border p-3 text-left hover:border-primary hover:bg-accent disabled:opacity-40"
          >
            <p className="font-semibold">{v.name}</p>
            <p className="text-sm text-primary">{formatPKR(v.sellingPrice)}</p>
            <p className="text-xs text-muted-foreground">{v.stock} in stock</p>
          </button>
        ))}
      </div>
    </Dialog>
  );
}
