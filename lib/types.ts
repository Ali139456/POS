export type Unit =
  | "Piece"
  | "Pack"
  | "Box"
  | "Carton"
  | "Bag"
  | "KG"
  | "Gram"
  | "Liter"
  | "ML";

export type PaymentMethod =
  | "Cash"
  | "Card"
  | "Bank Transfer"
  | "EasyPaisa"
  | "JazzCash"
  | "Customer Credit"
  | "Split";

export type ProductStatus = "Active" | "Inactive" | "Discontinued";
export type StockStatus = "In Stock" | "Low Stock" | "Out of Stock" | "Overstock";
export type CustomerType = "Walk-in" | "Regular" | "Wholesale" | "VIP";
export type EmployeeRole = "Owner" | "Admin" | "Manager" | "Cashier" | "Inventory Manager";
export type EmployeeStatus = "Active" | "Inactive";
export type SaleStatus = "Completed" | "Held" | "Voided" | "Refunded" | "Partial Refund";
export type PurchaseStatus =
  | "Draft"
  | "Ordered"
  | "Partially Received"
  | "Received"
  | "Cancelled";
export type ReturnReason =
  | "Damaged"
  | "Wrong Product"
  | "Expired"
  | "Customer Changed Mind"
  | "Other";
export type RefundMethod = "Cash" | "Store Credit" | "Original Payment Method";
export type AdjustmentType =
  | "Stock In"
  | "Stock Out"
  | "Damage"
  | "Expired"
  | "Lost"
  | "Correction"
  | "Personal Use"
  | "Other";
export type ExpenseCategory =
  | "Rent"
  | "Electricity"
  | "Gas"
  | "Internet"
  | "Salary"
  | "Transport"
  | "Maintenance"
  | "Food"
  | "Supplies"
  | "Miscellaneous";
export type ShiftStatus = "Open" | "Closed";
export type CreditStatus = "Paid" | "Partial" | "Due" | "Overdue";
export type NotificationType =
  | "low_stock"
  | "out_of_stock"
  | "expiring"
  | "credit_overdue"
  | "supplier_due"
  | "large_discount"
  | "register_difference";

export interface Store {
  id: string;
  name: string;
  logo?: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  ntn: string;
  strn: string;
  currency: "PKR";
  taxRate: number;
  receiptSize: "58mm" | "80mm" | "A4";
  receiptFooter: string;
  receiptShowLogo: boolean;
  receiptShowAddress: boolean;
  receiptShowPhone: boolean;
  receiptShowNtn: boolean;
  receiptShowCashier: boolean;
  receiptShowCustomer: boolean;
  receiptShowBarcode: boolean;
  receiptShowTax: boolean;
  receiptShowDiscount: boolean;
}

export interface PermissionSet {
  canApplyDiscount: boolean;
  canChangeProductPrice: boolean;
  canDeleteSale: boolean;
  canVoidInvoice: boolean;
  canIssueRefund: boolean;
  canViewProfit: boolean;
  canManageInventory: boolean;
  canManageExpenses: boolean;
  canViewReports: boolean;
  canManageEmployees: boolean;
}

export interface Employee {
  id: string;
  name: string;
  phone: string;
  role: EmployeeRole;
  pin: string;
  status: EmployeeStatus;
  email?: string;
  permissions: PermissionSet;
  avatarHue: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
  productCount: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  barcode: string;
  purchasePrice: number;
  sellingPrice: number;
  wholesalePrice: number;
  minSellingPrice: number;
  stock: number;
  reserved: number;
  unit: Unit;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  brand: string;
  sku: string;
  barcode: string;
  purchasePrice: number;
  sellingPrice: number;
  wholesalePrice: number;
  minSellingPrice: number;
  stock: number;
  reserved: number;
  minStock: number;
  maxStock: number;
  unit: Unit;
  supplierId: string;
  manufacturingDate?: string;
  expiryDate?: string;
  batchNumber?: string;
  status: ProductStatus;
  imageHue: number;
  variants: ProductVariant[];
}

export interface Supplier {
  id: string;
  name: string;
  company: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  ntn: string;
  totalPurchases: number;
  outstandingBalance: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  type: CustomerType;
  totalPurchases: number;
  totalOrders: number;
  creditBalance: number;
  loyaltyPoints: number;
  notes?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  variantName?: string;
  unit: Unit;
  unitPrice: number;
  quantity: number;
  discount: number;
  stock: number;
  allowDecimal: boolean;
}

export interface PaymentSplit {
  method: PaymentMethod;
  amount: number;
  reference?: string;
}

export interface SaleItem {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  variantName?: string;
  quantity: number;
  unit: Unit;
  unitPrice: number;
  discount: number;
  total: number;
  cost: number;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  date: string;
  customerId: string;
  customerName: string;
  cashierId: string;
  cashierName: string;
  items: SaleItem[];
  subtotal: number;
  itemDiscount: number;
  orderDiscount: number;
  tax: number;
  previousBalance: number;
  roundOff: number;
  total: number;
  paymentMethod: PaymentMethod;
  payments: PaymentSplit[];
  status: SaleStatus;
  notes?: string;
  heldName?: string;
}

export interface HeldSale {
  id: string;
  holdNumber: string;
  createdAt: string;
  customerId: string;
  customerName: string;
  items: CartItem[];
  orderDiscount: number;
  notes?: string;
}

export interface ReturnItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface SaleReturn {
  id: string;
  returnNumber: string;
  saleId: string;
  invoiceNumber: string;
  date: string;
  customerId: string;
  customerName: string;
  cashierName: string;
  items: ReturnItem[];
  reason: ReturnReason;
  refundMethod: RefundMethod;
  total: number;
}

export interface InventoryMovement {
  id: string;
  date: string;
  productId: string;
  productName: string;
  type: AdjustmentType;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  notes?: string;
  employeeName: string;
}

export interface PurchaseOrderItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  receivedQty: number;
  cost: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  date: string;
  expectedDelivery: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: PurchaseStatus;
}

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  description: string;
  receiptName?: string;
}

export interface CashMovement {
  id: string;
  type: "in" | "out";
  amount: number;
  reason: string;
  notes?: string;
  date: string;
}

export interface CashRegister {
  id: string;
  cashierId: string;
  cashierName: string;
  openedAt: string;
  closedAt?: string;
  openingCash: number;
  cashSales: number;
  cashRefunds: number;
  cashIn: number;
  cashOut: number;
  expectedCash: number;
  actualCash?: number;
  difference?: number;
  differenceNote?: string;
  status: ShiftStatus;
  movements: CashMovement[];
}

export interface LedgerEntry {
  id: string;
  partyId: string;
  date: string;
  invoice?: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export interface PaymentMethodSetting {
  id: PaymentMethod;
  enabled: boolean;
}

export type DateRangeKey =
  | "today"
  | "yesterday"
  | "7d"
  | "30d"
  | "3m"
  | "1y"
  | "week"
  | "month"
  | "last_month"
  | "year"
  | "custom";
