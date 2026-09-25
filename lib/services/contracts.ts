/**
 * Backend API contracts for Parent / Child store management.
 * UI calls service modules; swap mock implementations for Supabase/REST when wired.
 */

import type {
  InventoryBalance,
  LowStockItem,
  StockRequest,
  StockRequestItem,
  StockRequestStatus,
  StockTransfer,
  StockTransferStatus,
  StoreContextId,
  StoreSummary,
} from "@/lib/types";

export interface CreateStockRequestInput {
  storeId: string;
  items: Omit<StockRequestItem, "id">[];
  notes?: string;
}

export interface ReviewStockRequestInput {
  requestId: string;
  status: Extract<StockRequestStatus, "APPROVED" | "PARTIALLY_APPROVED" | "REJECTED">;
  items: { id: string; approvedQuantity: number }[];
  notes?: string;
}

export interface CreateTransferInput {
  fromLocationId: string;
  toLocationId: string;
  toStoreId: string;
  stockRequestId?: string;
  items: { productId: string; variantId?: string; productName: string; quantity: number }[];
  notes?: string;
}

export interface ReceiveTransferInput {
  transferId: string;
  items: { id: string; receivedQuantity: number; receiveNote?: string }[];
}

export interface ParentDashboardData {
  totalStores: number;
  totalSales: number;
  todaySales: number;
  totalInventoryValue: number;
  lowStockCount: number;
  pendingRequests: number;
  pendingTransfers: number;
  storeSummaries: StoreSummary[];
}

export interface StoreService {
  listChildStores(): Promise<import("@/lib/types").ChildStore[]>;
  getStoreSummary(storeId: string): Promise<StoreSummary>;
}

export interface InventoryService {
  getBalances(context: StoreContextId): Promise<InventoryBalance[]>;
  getMatrix(filters?: { q?: string; lowStock?: boolean }): Promise<
    { productId: string; productName: string; warehouse: number; stores: Record<string, number>; total: number }[]
  >;
  getLowStockAcrossStores(): Promise<LowStockItem[]>;
}

export interface StockRequestService {
  list(context: StoreContextId, storeOrgId?: string): Promise<StockRequest[]>;
  get(id: string): Promise<StockRequest | null>;
  create(input: CreateStockRequestInput): Promise<StockRequest>;
  review(input: ReviewStockRequestInput): Promise<StockRequest>;
}

export interface StockTransferService {
  list(context: StoreContextId, storeOrgId?: string): Promise<StockTransfer[]>;
  get(id: string): Promise<StockTransfer | null>;
  create(input: CreateTransferInput): Promise<StockTransfer>;
  dispatch(transferId: string): Promise<StockTransfer>;
  receive(input: ReceiveTransferInput): Promise<StockTransfer>;
}

export interface ParentDashboardService {
  getDashboard(context: StoreContextId): Promise<ParentDashboardData>;
}
