"use client";

import { useMemo } from "react";
import type { Product, Sale } from "@/lib/types";
import { useAppStore } from "@/lib/store/app-store";
import { useOrgStore } from "@/lib/store/org-store";
import { WAREHOUSE_LOCATION_ID } from "@/lib/mock/org-seed";
import { stockStatus } from "@/lib/utils";

/** Products with stock from the active store/warehouse context */
export function useScopedProducts(): Product[] {
  const products = useAppStore((s) => s.products);
  const balances = useOrgStore((s) => s.inventoryBalances);
  const locationId = useOrgStore((s) => s.getEffectiveLocationId());
  const context = useOrgStore((s) => s.storeContext);

  return useMemo(() => {
    if (context === "all" || !locationId) return products;

    return products.map((p) => {
      if (p.variants.length) {
        const variants = p.variants.map((v) => {
          const bal = balances.find(
            (b) => b.locationId === locationId && b.productId === p.id && b.variantId === v.id,
          );
          return { ...v, stock: bal?.stock ?? 0, reserved: bal?.reserved ?? 0 };
        });
        const stock = variants.reduce((a, v) => a + v.stock, 0);
        const bal = balances.find((b) => b.locationId === locationId && b.productId === p.id && !b.variantId);
        return { ...p, variants, stock, reserved: variants.reduce((a, v) => a + v.reserved, 0), minStock: bal?.minStock ?? p.minStock };
      }
      const bal = balances.find((b) => b.locationId === locationId && b.productId === p.id && !b.variantId);
      return {
        ...p,
        stock: bal?.stock ?? 0,
        reserved: bal?.reserved ?? 0,
        minStock: bal?.minStock ?? p.minStock,
      };
    });
  }, [products, balances, locationId, context]);
}

export function useScopedSales(): Sale[] {
  const sales = useAppStore((s) => s.sales);
  const context = useOrgStore((s) => s.storeContext);
  const orgId = useOrgStore((s) => s.getEffectiveOrgId());
  const childStores = useOrgStore((s) => s.childStores);

  return useMemo(() => {
    if (context === "all") return sales;
    if (context === "warehouse") return [];
    if (orgId) return sales.filter((s) => s.organizationId === orgId);
    return sales;
  }, [sales, context, orgId, childStores]);
}

export function useWarehouseProducts(): Product[] {
  const products = useAppStore((s) => s.products);
  const balances = useOrgStore((s) => s.inventoryBalances);

  return useMemo(
    () =>
      products.map((p) => {
        if (p.variants.length) {
          const variants = p.variants.map((v) => {
            const bal = balances.find(
              (b) => b.locationId === WAREHOUSE_LOCATION_ID && b.productId === p.id && b.variantId === v.id,
            );
            return { ...v, stock: bal?.stock ?? 0, reserved: bal?.reserved ?? 0 };
          });
          return { ...p, variants, stock: variants.reduce((a, v) => a + v.stock, 0) };
        }
        const bal = balances.find((b) => b.locationId === WAREHOUSE_LOCATION_ID && b.productId === p.id);
        return { ...p, stock: bal?.stock ?? 0, reserved: bal?.reserved ?? 0 };
      }),
    [products, balances],
  );
}

export function useEffectiveLocationId() {
  return useOrgStore((s) => s.getEffectiveLocationId());
}

export function useEffectiveOrgId() {
  return useOrgStore((s) => s.getEffectiveOrgId());
}

export function countLowStock(products: Product[]) {
  return products.filter((p) => stockStatus(p.stock, p.minStock, p.maxStock) !== "In Stock" && p.stock <= p.minStock).length;
}
