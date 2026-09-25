"use client";

import { create } from "zustand";
import type {
  ActivityEntry,
  AppNotification,
  InventoryBalance,
  SaleItem,
  StockRequest,
  StockRequestStatus,
  StockTransfer,
  StockTransferStatus,
  StoreContextId,
} from "@/lib/types";
import {
  activityLog as seedActivity,
  childStores,
  centralWarehouse,
  getLocationIdForContext,
  inventoryBalances as seedBalances,
  parentOrganization,
  stockRequests as seedRequests,
  stockTransfers as seedTransfers,
} from "@/lib/mock/org-seed";
import { uid } from "@/lib/utils";
import { useAppStore } from "./app-store";

interface OrgState {
  parentOrganization: typeof parentOrganization;
  centralWarehouse: typeof centralWarehouse;
  childStores: typeof childStores;
  inventoryBalances: InventoryBalance[];
  stockRequests: StockRequest[];
  stockTransfers: StockTransfer[];
  activityLog: ActivityEntry[];
  storeContext: StoreContextId;
  requestSeq: number;
  transferSeq: number;

  setStoreContext: (context: StoreContextId) => void;
  initContextForEmployee: (accessLevel: "parent" | "store", organizationId: string) => void;
  getEffectiveLocationId: () => string | null;
  getEffectiveOrgId: () => string | null;
  getBalance: (locationId: string, productId: string, variantId?: string) => InventoryBalance | undefined;
  deductInventory: (locationId: string, items: Pick<SaleItem, "productId" | "variantId" | "quantity">[]) => void;
  addInventory: (locationId: string, productId: string, quantity: number, variantId?: string) => void;

  createStockRequest: (input: {
    storeId: string;
    items: StockRequest["items"];
    notes?: string;
    requestedById: string;
    requestedByName: string;
  }) => StockRequest;
  reviewStockRequest: (input: {
    requestId: string;
    status: Extract<StockRequestStatus, "APPROVED" | "PARTIALLY_APPROVED" | "REJECTED">;
    items: { id: string; approvedQuantity: number }[];
    reviewerId: string;
    reviewerName: string;
  }) => void;
  createTransfer: (input: {
    fromLocationId: string;
    toLocationId: string;
    toStoreId: string;
    toStoreName: string;
    stockRequestId?: string;
    items: StockTransfer["items"];
    createdById: string;
    createdByName: string;
    notes?: string;
  }) => StockTransfer;
  dispatchTransfer: (transferId: string, actorId: string, actorName: string) => void;
  receiveTransfer: (input: {
    transferId: string;
    items: { id: string; receivedQuantity: number; receiveNote?: string }[];
    receiverId: string;
    receiverName: string;
  }) => void;
  addActivity: (entry: Omit<ActivityEntry, "id" | "createdAt">) => void;
  pushNotification: (notification: Omit<AppNotification, "id" | "read">) => void;
}

function childStoreOrgId(storeId: string): string | undefined {
  return childStores.find((s) => s.id === storeId)?.organizationId;
}

function balanceKey(locationId: string, productId: string, variantId?: string) {
  return `${locationId}:${productId}:${variantId ?? ""}`;
}

export const useOrgStore = create<OrgState>()((set, get) => ({
  parentOrganization,
  centralWarehouse,
  childStores,
  inventoryBalances: seedBalances,
  stockRequests: seedRequests,
  stockTransfers: seedTransfers,
  activityLog: seedActivity,
  storeContext: "all",
  requestSeq: 125,
  transferSeq: 126,

  setStoreContext: (context) => set({ storeContext: context }),

  initContextForEmployee: (accessLevel, organizationId) => {
    if (accessLevel === "parent") {
      set({ storeContext: "all" });
      return;
    }
    set({ storeContext: organizationId });
  },

  getEffectiveLocationId: () => {
    const { storeContext } = get();
    return getLocationIdForContext(storeContext);
  },

  getEffectiveOrgId: () => {
    const { storeContext } = get();
    if (storeContext === "all") return null;
    if (storeContext === "warehouse") return parentOrganization.id;
    return storeContext;
  },

  getBalance: (locationId, productId, variantId) =>
    get().inventoryBalances.find(
      (b) => b.locationId === locationId && b.productId === productId && (b.variantId ?? "") === (variantId ?? ""),
    ),

  deductInventory: (locationId, items) => {
    set((s) => {
      const map = new Map(s.inventoryBalances.map((b) => [balanceKey(b.locationId, b.productId, b.variantId), { ...b }]));
      for (const item of items) {
        const key = balanceKey(locationId, item.productId, item.variantId);
        const row = map.get(key);
        if (row) row.stock = Math.max(0, row.stock - item.quantity);
      }
      return { inventoryBalances: [...map.values()] };
    });
  },

  addInventory: (locationId, productId, quantity, variantId) => {
    set((s) => {
      const idx = s.inventoryBalances.findIndex(
        (b) => b.locationId === locationId && b.productId === productId && (b.variantId ?? "") === (variantId ?? ""),
      );
      if (idx >= 0) {
        const next = [...s.inventoryBalances];
        next[idx] = { ...next[idx]!, stock: next[idx]!.stock + quantity };
        return { inventoryBalances: next };
      }
      const store = childStores.find((c) => c.locationId === locationId);
      return {
        inventoryBalances: [
          ...s.inventoryBalances,
          {
            locationId,
            organizationId: store?.organizationId ?? parentOrganization.id,
            productId,
            variantId,
            stock: quantity,
            reserved: 0,
            minStock: 0,
          },
        ],
      };
    });
  },

  createStockRequest: (input) => {
    const store = childStores.find((s) => s.id === input.storeId)!;
    const seq = get().requestSeq + 1;
    const req: StockRequest = {
      id: uid("req"),
      requestNumber: `REQ-${String(seq).padStart(5, "0")}`,
      organizationId: store.organizationId,
      storeId: store.id,
      storeName: store.name,
      locationId: store.locationId,
      requestedById: input.requestedById,
      requestedByName: input.requestedByName,
      items: input.items.map((i) => ({ ...i, id: i.id || uid("ri") })),
      status: "PENDING",
      notes: input.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((s) => ({ stockRequests: [req, ...s.stockRequests], requestSeq: seq }));
    get().addActivity({
      organizationId: store.organizationId,
      storeId: store.id,
      storeName: store.name,
      type: "stock_request_created",
      title: "Stock request created",
      description: `${req.requestNumber} submitted with ${req.items.length} items`,
      actorName: input.requestedByName,
    });
    get().pushNotification({
      type: "stock_request",
      title: "New stock request",
      message: `${req.requestNumber} from ${store.name}`,
      date: new Date().toISOString(),
    });
    return req;
  },

  reviewStockRequest: ({ requestId, status, items, reviewerId, reviewerName }) => {
    set((s) => ({
      stockRequests: s.stockRequests.map((r) => {
        if (r.id !== requestId) return r;
        const nextItems = r.items.map((item) => {
          const approved = items.find((x) => x.id === item.id);
          return approved ? { ...item, approvedQuantity: approved.approvedQuantity } : item;
        });
        return {
          ...r,
          items: nextItems,
          status,
          reviewedById: reviewerId,
          reviewedByName: reviewerName,
          reviewedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
    const req = get().stockRequests.find((r) => r.id === requestId);
    if (req) {
      get().addActivity({
        organizationId: req.organizationId,
        storeId: req.storeId,
        storeName: req.storeName,
        type: status === "REJECTED" ? "stock_request_rejected" : "stock_request_approved",
        title: status === "REJECTED" ? "Stock request rejected" : "Stock request approved",
        description: `${req.requestNumber} reviewed by ${reviewerName}`,
        actorName: reviewerName,
      });
      get().pushNotification({
        type: "stock_request",
        title: status === "REJECTED" ? "Request rejected" : "Request approved",
        message: `${req.requestNumber} for ${req.storeName}`,
        date: new Date().toISOString(),
      });
    }
  },

  createTransfer: (input) => {
    const seq = get().transferSeq + 1;
    const tr: StockTransfer = {
      id: uid("tr"),
      transferNumber: `TR-${String(seq).padStart(5, "0")}`,
      organizationId: parentOrganization.id,
      stockRequestId: input.stockRequestId,
      fromLocationId: input.fromLocationId,
      fromLocationName: centralWarehouse.name,
      toLocationId: input.toLocationId,
      toStoreId: input.toStoreId,
      toStoreName: input.toStoreName,
      toLocationName: input.toStoreName,
      items: input.items.map((i) => ({ ...i, id: i.id || uid("ti"), receivedQuantity: 0 })),
      status: "DRAFT",
      createdById: input.createdById,
      createdByName: input.createdByName,
      createdAt: new Date().toISOString(),
      notes: input.notes,
    };
    set((s) => ({ stockTransfers: [tr, ...s.stockTransfers], transferSeq: seq }));
    get().addActivity({
      organizationId: parentOrganization.id,
      storeId: input.toStoreId,
      storeName: input.toStoreName,
      type: "transfer_created",
      title: "Transfer created",
      description: `${tr.transferNumber} to ${input.toStoreName}`,
      actorName: input.createdByName,
    });
    return tr;
  },

  dispatchTransfer: (transferId, actorId, actorName) => {
    const tr = get().stockTransfers.find((t) => t.id === transferId);
    if (!tr || (tr.status !== "DRAFT" && tr.status !== "APPROVED")) return;

    for (const item of tr.items) {
      get().deductInventory(tr.fromLocationId, [
        { productId: item.productId, variantId: item.variantId, quantity: item.sentQuantity },
      ]);
    }

    set((s) => ({
      stockTransfers: s.stockTransfers.map((t) =>
        t.id === transferId
          ? {
              ...t,
              status: "DISPATCHED" as StockTransferStatus,
              dispatchedById: actorId,
              dispatchedByName: actorName,
              dispatchedAt: new Date().toISOString(),
            }
          : t,
      ),
      stockRequests: tr.stockRequestId
        ? s.stockRequests.map((r) =>
            r.id === tr.stockRequestId ? { ...r, status: "DISPATCHED" as StockRequestStatus, updatedAt: new Date().toISOString() } : r,
          )
        : s.stockRequests,
    }));

    get().addActivity({
      organizationId: parentOrganization.id,
      storeId: tr.toStoreId,
      storeName: tr.toStoreName,
      type: "transfer_dispatched",
      title: "Transfer dispatched",
      description: `${tr.transferNumber} dispatched to ${tr.toStoreName}`,
      actorName: actorName,
    });
    get().pushNotification({
      type: "stock_transfer",
      title: "Transfer ready to receive",
      message: `${tr.transferNumber} dispatched to ${tr.toStoreName}`,
      date: new Date().toISOString(),
    });
  },

  receiveTransfer: ({ transferId, items, receiverId, receiverName }) => {
    const tr = get().stockTransfers.find((t) => t.id === transferId);
    if (!tr || (tr.status !== "DISPATCHED" && tr.status !== "PARTIALLY_RECEIVED")) return;

    const nextItems = tr.items.map((item) => {
      const recv = items.find((x) => x.id === item.id);
      if (!recv) return item;
      get().addInventory(tr.toLocationId, item.productId, recv.receivedQuantity, item.variantId);
      return { ...item, receivedQuantity: recv.receivedQuantity, receiveNote: recv.receiveNote };
    });

    const allReceived = nextItems.every((i) => i.receivedQuantity >= i.sentQuantity);
    const anyReceived = nextItems.some((i) => i.receivedQuantity > 0);
    const status: StockTransferStatus = allReceived ? "RECEIVED" : anyReceived ? "PARTIALLY_RECEIVED" : tr.status;

    set((s) => ({
      stockTransfers: s.stockTransfers.map((t) =>
        t.id === transferId
          ? {
              ...t,
              items: nextItems,
              status,
              receivedById: receiverId,
              receivedByName: receiverName,
              receivedAt: new Date().toISOString(),
            }
          : t,
      ),
      stockRequests: tr.stockRequestId
        ? s.stockRequests.map((r) =>
            r.id === tr.stockRequestId
              ? { ...r, status: allReceived ? "RECEIVED" : "PARTIALLY_RECEIVED", updatedAt: new Date().toISOString() }
              : r,
          )
        : s.stockRequests,
    }));

    get().addActivity({
      organizationId: childStoreOrgId(tr.toStoreId),
      storeId: tr.toStoreId,
      storeName: tr.toStoreName,
      type: "transfer_received",
      title: allReceived ? "Transfer received" : "Transfer partially received",
      description: `${tr.transferNumber} received at ${tr.toStoreName}`,
      actorName: receiverName,
    });
  },

  addActivity: (entry) =>
    set((s) => ({
      activityLog: [{ ...entry, id: uid("act"), createdAt: new Date().toISOString() }, ...s.activityLog],
    })),

  pushNotification: (notification) => {
    void import("./app-store").then(({ useAppStore }) => {
      useAppStore.getState().addNotification(notification);
    });
  },
}));

export function useIsParentUser() {
  const employee = useAppStore((s) => s.employees.find((e) => e.id === s.currentEmployeeId));
  return employee?.accessLevel === "parent";
}

export function useStoreContextLabel() {
  const context = useOrgStore((s) => s.storeContext);
  const stores = useOrgStore((s) => s.childStores);
  if (context === "all") return "All Stores";
  if (context === "warehouse") return "Central Warehouse";
  return stores.find((s) => s.organizationId === context)?.name ?? "Store";
}
