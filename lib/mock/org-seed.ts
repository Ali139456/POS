import type {
  ActivityEntry,
  CentralWarehouse,
  ChildStore,
  InventoryBalance,
  ParentOrganization,
  StockRequest,
  StockTransfer,
} from "@/lib/types";
import { products } from "./seed";

export const PARENT_ORG_ID = "org_parent";
export const WAREHOUSE_LOCATION_ID = "loc_warehouse";
export const ORG_GULBERG = "org_gulberg";
export const ORG_DHA = "org_dha";
export const ORG_BAHRIA = "org_bahria";

export const parentOrganization: ParentOrganization = {
  id: PARENT_ORG_ID,
  type: "parent",
  name: "Al-Noor Super Mart",
  legalName: "Al-Noor Super Mart (Pvt) Ltd",
  phone: "042-35789012",
  email: "hello@alnoormart.pk",
  address: "Head Office, Main Market",
  city: "Lahore",
};

export const centralWarehouse: CentralWarehouse = {
  id: "warehouse_1",
  organizationId: PARENT_ORG_ID,
  locationId: WAREHOUSE_LOCATION_ID,
  name: "Central Warehouse",
  address: "Industrial Area, Kot Lakhpat",
  city: "Lahore",
};

export const childStores: ChildStore[] = [
  {
    id: "store_gulberg",
    organizationId: ORG_GULBERG,
    parentOrganizationId: PARENT_ORG_ID,
    locationId: "loc_gulberg",
    name: "Al-Noor Gulberg",
    managerId: "emp_2",
    managerName: "Fatima Khan",
    location: "Shop 14-16, Main Market, Gulberg III",
    city: "Lahore",
    phone: "042-35789012",
    status: "Active",
  },
  {
    id: "store_dha",
    organizationId: ORG_DHA,
    parentOrganizationId: PARENT_ORG_ID,
    locationId: "loc_dha",
    name: "Al-Noor DHA",
    managerId: "emp_5",
    managerName: "Bilal Ahmed",
    location: "Block L, DHA Phase 6",
    city: "Lahore",
    phone: "042-37112233",
    status: "Active",
  },
  {
    id: "store_bahria",
    organizationId: ORG_BAHRIA,
    parentOrganizationId: PARENT_ORG_ID,
    locationId: "loc_bahria",
    name: "Al-Noor Bahria",
    managerId: "emp_4",
    managerName: "Ayesha Raza",
    location: "Sector C, Bahria Town",
    city: "Lahore",
    phone: "042-37889900",
    status: "Active",
  },
];

function balance(
  locationId: string,
  organizationId: string,
  productId: string,
  stock: number,
  minStock: number,
  reserved = 0,
  variantId?: string,
): InventoryBalance {
  return { locationId, organizationId, productId, variantId, stock, reserved, minStock };
}

/** Per-location inventory derived from master catalog */
export function buildInventoryBalances(): InventoryBalance[] {
  const rows: InventoryBalance[] = [];
  for (const p of products) {
    if (p.variants.length) {
      for (const v of p.variants) {
        rows.push(balance(WAREHOUSE_LOCATION_ID, PARENT_ORG_ID, p.id, Math.round(v.stock * 4.5), p.minStock, Math.round(v.reserved * 2), v.id));
        rows.push(balance("loc_gulberg", ORG_GULBERG, p.id, v.stock, p.minStock, v.reserved, v.id));
        rows.push(balance("loc_dha", ORG_DHA, p.id, Math.max(0, Math.round(v.stock * 0.65)), p.minStock, 0, v.id));
        rows.push(balance("loc_bahria", ORG_BAHRIA, p.id, Math.max(0, Math.round(v.stock * 0.45)), p.minStock, 0, v.id));
      }
    } else {
      rows.push(balance(WAREHOUSE_LOCATION_ID, PARENT_ORG_ID, p.id, Math.round(p.stock * 5), p.minStock, Math.round(p.reserved * 2)));
      rows.push(balance("loc_gulberg", ORG_GULBERG, p.id, p.stock, p.minStock, p.reserved));
      rows.push(balance("loc_dha", ORG_DHA, p.id, Math.max(0, Math.round(p.stock * 0.6)), p.minStock));
      rows.push(balance("loc_bahria", ORG_BAHRIA, p.id, Math.max(0, Math.round(p.stock * 0.4)), p.minStock));
    }
  }
  return rows;
}

export const inventoryBalances = buildInventoryBalances();

export const stockRequests: StockRequest[] = [
  {
    id: "req_1",
    requestNumber: "REQ-00124",
    organizationId: ORG_DHA,
    storeId: "store_dha",
    storeName: "Al-Noor DHA",
    locationId: "loc_dha",
    requestedById: "emp_5",
    requestedByName: "Bilal Ahmed",
    status: "PENDING",
    notes: "Weekend rush expected",
    createdAt: "2026-08-26T08:30:00",
    updatedAt: "2026-08-26T08:30:00",
    items: [
      {
        id: "ri_1",
        productId: "p_coke",
        variantId: "v_coke_500",
        productName: "Coca Cola 500ml",
        currentStock: 12,
        minStock: 20,
        requestedQuantity: 48,
        reason: "Low stock",
      },
      {
        id: "ri_2",
        productId: "p_dalda",
        productName: "Dalda Cooking Oil 5L",
        currentStock: 4,
        minStock: 6,
        requestedQuantity: 20,
        reason: "Low stock",
      },
      {
        id: "ri_3",
        productId: "p_milk",
        productName: "Nestlé Milk 1L",
        currentStock: 8,
        minStock: 12,
        requestedQuantity: 30,
        reason: "Weekend demand",
      },
    ],
  },
  {
    id: "req_2",
    requestNumber: "REQ-00123",
    organizationId: ORG_BAHRIA,
    storeId: "store_bahria",
    storeName: "Al-Noor Bahria",
    locationId: "loc_bahria",
    requestedById: "emp_4",
    requestedByName: "Ayesha Raza",
    status: "APPROVED",
    reviewedById: "emp_3",
    reviewedByName: "Usman Malik",
    reviewedAt: "2026-08-25T16:00:00",
    createdAt: "2026-08-25T14:20:00",
    updatedAt: "2026-08-25T16:00:00",
    items: [
      {
        id: "ri_4",
        productId: "p_lays",
        productName: "Lays Masala 50g",
        currentStock: 6,
        minStock: 15,
        requestedQuantity: 36,
        approvedQuantity: 36,
      },
      {
        id: "ri_5",
        productId: "p_water",
        productName: "Nestlé Water 1.5L",
        currentStock: 10,
        minStock: 18,
        requestedQuantity: 24,
        approvedQuantity: 24,
      },
    ],
  },
  {
    id: "req_3",
    requestNumber: "REQ-00122",
    organizationId: ORG_GULBERG,
    storeId: "store_gulberg",
    storeName: "Al-Noor Gulberg",
    locationId: "loc_gulberg",
    requestedById: "emp_2",
    requestedByName: "Fatima Khan",
    status: "RECEIVED",
    reviewedById: "emp_3",
    reviewedByName: "Usman Malik",
    reviewedAt: "2026-08-24T11:00:00",
    createdAt: "2026-08-24T09:00:00",
    updatedAt: "2026-08-24T15:30:00",
    items: [
      {
        id: "ri_6",
        productId: "p_tapal",
        productName: "Tapal Danedar 900g",
        currentStock: 5,
        minStock: 8,
        requestedQuantity: 12,
        approvedQuantity: 12,
      },
    ],
  },
];

export const stockTransfers: StockTransfer[] = [
  {
    id: "tr_1",
    transferNumber: "TR-00124",
    organizationId: PARENT_ORG_ID,
    stockRequestId: "req_2",
    fromLocationId: WAREHOUSE_LOCATION_ID,
    fromLocationName: "Central Warehouse",
    toLocationId: "loc_bahria",
    toStoreId: "store_bahria",
    toStoreName: "Al-Noor Bahria",
    toLocationName: "Al-Noor Bahria",
    status: "DISPATCHED",
    createdById: "emp_3",
    createdByName: "Usman Malik",
    dispatchedById: "emp_3",
    dispatchedByName: "Usman Malik",
    createdAt: "2026-08-25T16:30:00",
    dispatchedAt: "2026-08-25T17:00:00",
    items: [
      { id: "ti_1", productId: "p_lays", productName: "Lays Masala 50g", sentQuantity: 36, receivedQuantity: 0 },
      { id: "ti_2", productId: "p_water", productName: "Nestlé Water 1.5L", sentQuantity: 24, receivedQuantity: 0 },
    ],
  },
  {
    id: "tr_2",
    transferNumber: "TR-00123",
    organizationId: PARENT_ORG_ID,
    stockRequestId: "req_3",
    fromLocationId: WAREHOUSE_LOCATION_ID,
    fromLocationName: "Central Warehouse",
    toLocationId: "loc_gulberg",
    toStoreId: "store_gulberg",
    toStoreName: "Al-Noor Gulberg",
    toLocationName: "Al-Noor Gulberg",
    status: "RECEIVED",
    createdById: "emp_3",
    createdByName: "Usman Malik",
    dispatchedById: "emp_3",
    dispatchedByName: "Usman Malik",
    receivedById: "emp_2",
    receivedByName: "Fatima Khan",
    createdAt: "2026-08-24T11:30:00",
    dispatchedAt: "2026-08-24T12:00:00",
    receivedAt: "2026-08-24T15:30:00",
    items: [
      { id: "ti_3", productId: "p_tapal", productName: "Tapal Danedar 900g", sentQuantity: 12, receivedQuantity: 12 },
    ],
  },
  {
    id: "tr_3",
    transferNumber: "TR-00125",
    organizationId: PARENT_ORG_ID,
    fromLocationId: WAREHOUSE_LOCATION_ID,
    fromLocationName: "Central Warehouse",
    toLocationId: "loc_dha",
    toStoreId: "store_dha",
    toStoreName: "Al-Noor DHA",
    toLocationName: "Al-Noor DHA",
    status: "DRAFT",
    createdById: "emp_3",
    createdByName: "Usman Malik",
    createdAt: "2026-08-26T07:00:00",
    notes: "Proactive restock before approval",
    items: [
      { id: "ti_4", productId: "p_bread", productName: "Dawn Bread Large", sentQuantity: 30, receivedQuantity: 0 },
    ],
  },
];

export const activityLog: ActivityEntry[] = [
  {
    id: "act_1",
    organizationId: ORG_DHA,
    storeId: "store_dha",
    storeName: "Al-Noor DHA",
    type: "stock_request_created",
    title: "Stock request created",
    description: "REQ-00124 submitted with 8 items",
    actorName: "Bilal Ahmed",
    createdAt: "2026-08-26T08:30:00",
  },
  {
    id: "act_2",
    organizationId: PARENT_ORG_ID,
    storeId: "store_bahria",
    storeName: "Al-Noor Bahria",
    type: "transfer_dispatched",
    title: "Transfer dispatched",
    description: "TR-00124 dispatched to Al-Noor Bahria",
    actorName: "Usman Malik",
    createdAt: "2026-08-25T17:00:00",
  },
  {
    id: "act_3",
    organizationId: ORG_BAHRIA,
    storeId: "store_bahria",
    storeName: "Al-Noor Bahria",
    type: "stock_request_approved",
    title: "Stock request approved",
    description: "REQ-00123 approved by parent admin",
    actorName: "Usman Malik",
    createdAt: "2026-08-25T16:00:00",
  },
  {
    id: "act_4",
    organizationId: ORG_GULBERG,
    storeId: "store_gulberg",
    storeName: "Al-Noor Gulberg",
    type: "transfer_received",
    title: "Transfer received",
    description: "TR-00123 fully received at Gulberg",
    actorName: "Fatima Khan",
    createdAt: "2026-08-24T15:30:00",
  },
];

export function getStoreByOrgId(orgId: string): ChildStore | undefined {
  return childStores.find((s) => s.organizationId === orgId);
}

export function getLocationIdForContext(contextId: string): string | null {
  if (contextId === "all") return null;
  if (contextId === "warehouse") return WAREHOUSE_LOCATION_ID;
  const store = childStores.find((s) => s.organizationId === contextId);
  return store?.locationId ?? null;
}

export function getOrgIdForContext(contextId: string): string | null {
  if (contextId === "all") return null;
  if (contextId === "warehouse") return PARENT_ORG_ID;
  return contextId;
}
