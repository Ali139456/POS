import type { StoreContextId, StoreSummary } from "@/lib/types";
import type { ParentDashboardData } from "@/lib/services/contracts";
import { useAppStore } from "@/lib/store/app-store";
import { useOrgStore } from "@/lib/store/org-store";
import { countLowStock } from "@/lib/hooks/use-scoped-data";

const TODAY = "2026-08-26";

export function computeStoreSummaries(): StoreSummary[] {
  const sales = useAppStore.getState().sales;
  const products = useAppStore.getState().products;
  const { childStores, inventoryBalances, stockRequests } = useOrgStore.getState();

  return childStores.map((store) => {
    const storeSales = sales.filter((s) => s.organizationId === store.organizationId && s.status === "Completed");
    const todaySales = storeSales.filter((s) => s.date.startsWith(TODAY));
    const todayTotal = todaySales.reduce((a, s) => a + s.total, 0);
    const balances = inventoryBalances.filter((b) => b.locationId === store.locationId);
    let inventoryValue = 0;
    let lowStock = 0;
    for (const p of products) {
      const bal = balances.find((b) => b.productId === p.id && !b.variantId);
      const stock = p.variants.length
        ? p.variants.reduce((a, v) => a + (balances.find((b) => b.variantId === v.id)?.stock ?? 0), 0)
        : (bal?.stock ?? 0);
      inventoryValue += stock * p.purchasePrice;
      if (stock <= (bal?.minStock ?? p.minStock)) lowStock += 1;
    }
    const pendingRequests = stockRequests.filter(
      (r) => r.storeId === store.id && ["PENDING", "PARTIALLY_APPROVED", "APPROVED"].includes(r.status),
    ).length;

    return {
      storeId: store.id,
      organizationId: store.organizationId,
      storeName: store.name,
      todaySales: todayTotal,
      todayOrders: todaySales.length,
      inventoryValue,
      lowStockCount: lowStock,
      pendingRequests,
    };
  });
}

export function getParentDashboard(_context: StoreContextId = "all"): ParentDashboardData {
  const sales = useAppStore.getState().sales;
  const products = useAppStore.getState().products;
  const { childStores, inventoryBalances, stockRequests, stockTransfers } = useOrgStore.getState();
  const summaries = computeStoreSummaries();

  const completed = sales.filter((s) => s.status === "Completed");
  const today = completed.filter((s) => s.date.startsWith(TODAY));
  const warehouseValue = inventoryBalances
    .filter((b) => b.locationId === "loc_warehouse")
    .reduce((a, b) => {
      const p = products.find((x) => x.id === b.productId);
      return a + b.stock * (p?.purchasePrice ?? 0);
    }, 0);
  const storeValue = summaries.reduce((a, s) => a + s.inventoryValue, 0);

  return {
    totalStores: childStores.length,
    totalSales: completed.reduce((a, s) => a + s.total, 0),
    todaySales: today.reduce((a, s) => a + s.total, 0),
    totalInventoryValue: warehouseValue + storeValue,
    lowStockCount: summaries.reduce((a, s) => a + s.lowStockCount, 0),
    pendingRequests: stockRequests.filter((r) => r.status === "PENDING").length,
    pendingTransfers: stockTransfers.filter((t) => ["DRAFT", "APPROVED", "DISPATCHED"].includes(t.status)).length,
    storeSummaries: summaries,
  };
}

export function getLowStockAcrossStores() {
  const products = useAppStore.getState().products;
  const { childStores, inventoryBalances } = useOrgStore.getState();
  const rows: import("@/lib/types").LowStockItem[] = [];

  for (const store of childStores) {
    for (const p of products) {
      const bal = inventoryBalances.find((b) => b.locationId === store.locationId && b.productId === p.id && !b.variantId);
      const stock = p.variants.length
        ? p.variants.reduce((a, v) => a + (inventoryBalances.find((b) => b.locationId === store.locationId && b.variantId === v.id)?.stock ?? 0), 0)
        : (bal?.stock ?? 0);
      const min = bal?.minStock ?? p.minStock;
      if (stock <= min) {
        rows.push({
          productId: p.id,
          productName: p.name,
          storeId: store.id,
          storeName: store.name,
          locationId: store.locationId,
          currentStock: stock,
          minStock: min,
          suggestedQuantity: Math.max(min * 2 - stock, min),
        });
      }
    }
  }
  return rows.sort((a, b) => a.currentStock - b.currentStock).slice(0, 20);
}
