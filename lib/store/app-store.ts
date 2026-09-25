"use client";

import { create } from "zustand";
import type {
  AppNotification,
  CashRegister,
  Category,
  Customer,
  Employee,
  Expense,
  HeldSale,
  InventoryMovement,
  LedgerEntry,
  PaymentMethodSetting,
  Product,
  PurchaseOrder,
  Sale,
  SaleReturn,
  Store,
  Supplier,
} from "@/lib/types";
import {
  cashRegister as seedRegister,
  categories as seedCategories,
  customerLedger as seedCustomerLedger,
  customers as seedCustomers,
  employees as seedEmployees,
  expenses as seedExpenses,
  movements as seedMovements,
  notifications as seedNotifications,
  paymentMethods as seedPaymentMethods,
  products as seedProducts,
  purchaseOrders as seedPOs,
  returns as seedReturns,
  sales as seedSales,
  store as seedStore,
  supplierLedger as seedSupplierLedger,
  suppliers as seedSuppliers,
} from "@/lib/mock/seed";
import { uid } from "@/lib/utils";

interface AppState {
  store: Store;
  employees: Employee[];
  currentEmployeeId: string;
  categories: Category[];
  products: Product[];
  suppliers: Supplier[];
  customers: Customer[];
  sales: Sale[];
  heldSales: HeldSale[];
  returns: SaleReturn[];
  purchaseOrders: PurchaseOrder[];
  expenses: Expense[];
  movements: InventoryMovement[];
  customerLedger: LedgerEntry[];
  supplierLedger: LedgerEntry[];
  register: CashRegister;
  notifications: AppNotification[];
  paymentMethods: PaymentMethodSetting[];
  invoiceSeq: number;
  poSeq: number;
  holdSeq: number;
  returnSeq: number;

  setStore: (patch: Partial<Store>) => void;
  setCurrentEmployee: (id: string) => void;
  upsertProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (
    productId: string,
    type: InventoryMovement["type"],
    quantity: number,
    reason: string,
    notes?: string,
  ) => void;
  upsertCustomer: (customer: Customer) => void;
  deleteCustomer: (id: string) => void;
  upsertSupplier: (supplier: Supplier) => void;
  upsertCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  addSale: (sale: Sale) => void;
  voidSale: (id: string) => void;
  holdSale: (held: HeldSale) => void;
  deleteHeld: (id: string) => void;
  addReturn: (ret: SaleReturn) => void;
  upsertPO: (po: PurchaseOrder) => void;
  receivePO: (id: string, received: Record<string, number>) => void;
  addExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;
  addLedgerEntry: (kind: "customer" | "supplier", entry: LedgerEntry) => void;
  recordCustomerPayment: (customerId: string, amount: number, note?: string) => void;
  recordSupplierPayment: (supplierId: string, amount: number, note?: string) => void;
  upsertEmployee: (employee: Employee) => void;
  togglePaymentMethod: (id: PaymentMethodSetting["id"]) => void;
  cashInOut: (type: "in" | "out", amount: number, reason: string, notes?: string) => void;
  closeShift: (actualCash: number, note?: string) => void;
  openShift: (openingCash: number) => void;
  addNotification: (notification: Omit<AppNotification, "id" | "read">) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  nextInvoice: () => string;
  nextPO: () => string;
  nextHold: () => string;
  nextReturn: () => string;
}

function withCategoryCounts(categories: Category[], products: Product[]): Category[] {
  return categories.map((c) => ({
    ...c,
    productCount: products.filter((p) => p.categoryId === c.id && p.status !== "Discontinued").length,
  }));
}

export const useAppStore = create<AppState>()((set, get) => ({
      store: seedStore,
      employees: seedEmployees,
      currentEmployeeId: "emp_1",
      categories: withCategoryCounts(seedCategories, seedProducts),
      products: seedProducts,
      suppliers: seedSuppliers,
      customers: seedCustomers,
      sales: seedSales,
      heldSales: [],
      returns: seedReturns,
      purchaseOrders: seedPOs,
      expenses: seedExpenses,
      movements: seedMovements,
      customerLedger: seedCustomerLedger,
      supplierLedger: seedSupplierLedger,
      register: seedRegister,
      notifications: seedNotifications,
      paymentMethods: seedPaymentMethods,
      invoiceSeq: 123,
      poSeq: 42,
      holdSeq: 1,
      returnSeq: 9,

      setStore: (patch) => set({ store: { ...get().store, ...patch } }),
      setCurrentEmployee: (id) => set({ currentEmployeeId: id }),

      upsertProduct: (product) =>
        set((s) => {
          const exists = s.products.some((p) => p.id === product.id);
          const products = exists ? s.products.map((p) => (p.id === product.id ? product : p)) : [product, ...s.products];
          return { products, categories: withCategoryCounts(s.categories, products) };
        }),

      deleteProduct: (id) =>
        set((s) => {
          const products = s.products.filter((p) => p.id !== id);
          return { products, categories: withCategoryCounts(s.categories, products) };
        }),

      adjustStock: (productId, type, quantity, reason, notes) => {
        const product = get().products.find((p) => p.id === productId);
        if (!product) return;
        const inbound = type === "Stock In" || type === "Correction";
        const delta = inbound && type === "Stock In" ? quantity : type === "Correction" ? quantity : -quantity;
        const previousStock = product.stock;
        const newStock = Math.max(0, previousStock + delta);
        const employee = get().employees.find((e) => e.id === get().currentEmployeeId);
        set((s) => ({
          products: s.products.map((p) => (p.id === productId ? { ...p, stock: newStock } : p)),
          movements: [
            {
              id: uid("mov"),
              date: new Date().toISOString(),
              productId,
              productName: product.name,
              type,
              quantity,
              previousStock,
              newStock,
              reason,
              notes,
              employeeName: employee?.name ?? "Staff",
            },
            ...s.movements,
          ],
        }));
      },

      upsertCustomer: (customer) =>
        set((s) => {
          const exists = s.customers.some((c) => c.id === customer.id);
          return { customers: exists ? s.customers.map((c) => (c.id === customer.id ? customer : c)) : [customer, ...s.customers] };
        }),

      deleteCustomer: (id) => set((s) => ({ customers: s.customers.filter((c) => c.id !== id && c.id !== "cust_walkin") })),

      upsertSupplier: (supplier) =>
        set((s) => {
          const exists = s.suppliers.some((x) => x.id === supplier.id);
          return { suppliers: exists ? s.suppliers.map((x) => (x.id === supplier.id ? supplier : x)) : [supplier, ...s.suppliers] };
        }),

      upsertCategory: (category) =>
        set((s) => {
          const exists = s.categories.some((c) => c.id === category.id);
          const categories = exists ? s.categories.map((c) => (c.id === category.id ? category : c)) : [...s.categories, category];
          return { categories: withCategoryCounts(categories, s.products) };
        }),

      deleteCategory: (id) => set((s) => ({ categories: s.categories.filter((c) => c.id !== id) })),

      addSale: (sale) =>
        set((s) => {
          const useOrgInventory = Boolean(sale.organizationId);
          const products = useOrgInventory
            ? s.products
            : s.products.map((p) => {
            const item = sale.items.find((i) => i.productId === p.id && (!i.variantId || p.variants.some((v) => v.id === i.variantId)));
            if (!item) return p;
            if (item.variantId) {
              return {
                ...p,
                variants: p.variants.map((v) => (v.id === item.variantId ? { ...v, stock: Math.max(0, v.stock - item.quantity) } : v)),
                stock: p.variants.length ? p.variants.reduce((sum, v) => sum + (v.id === item.variantId ? Math.max(0, v.stock - item.quantity) : v.stock), 0) : Math.max(0, p.stock - item.quantity),
              };
            }
            return { ...p, stock: Math.max(0, p.stock - item.quantity) };
          });
          const customers = s.customers.map((c) => {
            if (c.id !== sale.customerId || c.id === "cust_walkin") return c;
            const credit = sale.payments.filter((p) => p.method === "Customer Credit").reduce((a, b) => a + b.amount, 0);
            return {
              ...c,
              totalPurchases: c.totalPurchases + sale.total,
              totalOrders: c.totalOrders + 1,
              creditBalance: c.creditBalance + credit,
              loyaltyPoints: c.loyaltyPoints + Math.floor(sale.total / 100),
            };
          });
          const cashPaid = sale.payments.filter((p) => p.method === "Cash").reduce((a, b) => a + b.amount, 0);
          const register = {
            ...s.register,
            cashSales: s.register.cashSales + cashPaid,
            expectedCash: s.register.expectedCash + cashPaid,
          };
          return { sales: [sale, ...s.sales], products, customers, register, categories: withCategoryCounts(s.categories, products) };
        }),

      voidSale: (id) =>
        set((s) => ({
          sales: s.sales.map((sale) => (sale.id === id ? { ...sale, status: "Voided" as const } : sale)),
        })),

      holdSale: (held) => set((s) => ({ heldSales: [held, ...s.heldSales] })),
      deleteHeld: (id) => set((s) => ({ heldSales: s.heldSales.filter((h) => h.id !== id) })),

      addReturn: (ret) =>
        set((s) => {
          const register =
            ret.refundMethod === "Cash"
              ? { ...s.register, cashRefunds: s.register.cashRefunds + ret.total, expectedCash: s.register.expectedCash - ret.total }
              : s.register;
          const products = s.products.map((p) => {
            const item = ret.items.find((i) => i.productId === p.id);
            return item ? { ...p, stock: p.stock + item.quantity } : p;
          });
          return { returns: [ret, ...s.returns], register, products };
        }),

      upsertPO: (po) =>
        set((s) => {
          const exists = s.purchaseOrders.some((p) => p.id === po.id);
          return { purchaseOrders: exists ? s.purchaseOrders.map((p) => (p.id === po.id ? po : p)) : [po, ...s.purchaseOrders] };
        }),

      receivePO: (id, received) =>
        set((s) => {
          const po = s.purchaseOrders.find((p) => p.id === id);
          if (!po) return s;
          const items = po.items.map((item) => ({
            ...item,
            receivedQty: Math.min(item.quantity, item.receivedQty + (received[item.id] ?? 0)),
          }));
          const all = items.every((i) => i.receivedQty >= i.quantity);
          const any = items.some((i) => i.receivedQty > 0);
          const products = s.products.map((p) => {
            const item = po.items.find((i) => i.productId === p.id);
            const add = item ? received[item.id] ?? 0 : 0;
            return add ? { ...p, stock: p.stock + add } : p;
          });
          return {
            purchaseOrders: s.purchaseOrders.map((p) =>
              p.id === id ? { ...p, items, status: all ? "Received" : any ? "Partially Received" : p.status } : p,
            ),
            products,
          };
        }),

      addExpense: (expense) => set((s) => ({ expenses: [expense, ...s.expenses] })),
      deleteExpense: (id) => set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) })),

      addLedgerEntry: (kind, entry) =>
        set((s) =>
          kind === "customer"
            ? { customerLedger: [entry, ...s.customerLedger] }
            : { supplierLedger: [entry, ...s.supplierLedger] },
        ),

      recordCustomerPayment: (customerId, amount, note) => {
        const customer = get().customers.find((c) => c.id === customerId);
        if (!customer) return;
        const balance = Math.max(0, customer.creditBalance - amount);
        const entry: LedgerEntry = {
          id: uid("cl"),
          partyId: customerId,
          date: new Date().toISOString(),
          description: note || "Payment received",
          debit: 0,
          credit: amount,
          balance,
        };
        set((s) => ({
          customers: s.customers.map((c) => (c.id === customerId ? { ...c, creditBalance: balance } : c)),
          customerLedger: [entry, ...s.customerLedger],
        }));
      },

      recordSupplierPayment: (supplierId, amount, note) => {
        const supplier = get().suppliers.find((s) => s.id === supplierId);
        if (!supplier) return;
        const balance = Math.max(0, supplier.outstandingBalance - amount);
        const entry: LedgerEntry = {
          id: uid("sl"),
          partyId: supplierId,
          date: new Date().toISOString(),
          description: note || "Payment to supplier",
          debit: amount,
          credit: 0,
          balance,
        };
        set((s) => ({
          suppliers: s.suppliers.map((x) => (x.id === supplierId ? { ...x, outstandingBalance: balance } : x)),
          supplierLedger: [entry, ...s.supplierLedger],
        }));
      },

      upsertEmployee: (employee) =>
        set((s) => {
          const exists = s.employees.some((e) => e.id === employee.id);
          return { employees: exists ? s.employees.map((e) => (e.id === employee.id ? employee : e)) : [...s.employees, employee] };
        }),

      togglePaymentMethod: (id) =>
        set((s) => ({
          paymentMethods: s.paymentMethods.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m)),
        })),

      cashInOut: (type, amount, reason, notes) =>
        set((s) => {
          const movement = { id: uid("cm"), type, amount, reason, notes, date: new Date().toISOString() };
          const cashIn = s.register.cashIn + (type === "in" ? amount : 0);
          const cashOut = s.register.cashOut + (type === "out" ? amount : 0);
          const expectedCash = s.register.openingCash + s.register.cashSales - s.register.cashRefunds + cashIn - cashOut;
          return {
            register: {
              ...s.register,
              cashIn,
              cashOut,
              expectedCash,
              movements: [movement, ...s.register.movements],
            },
          };
        }),

      closeShift: (actualCash, note) =>
        set((s) => ({
          register: {
            ...s.register,
            closedAt: new Date().toISOString(),
            actualCash,
            difference: actualCash - s.register.expectedCash,
            differenceNote: note,
            status: "Closed",
          },
        })),

      openShift: (openingCash) => {
        const emp = get().employees.find((e) => e.id === get().currentEmployeeId);
        set({
          register: {
            id: uid("reg"),
            cashierId: emp?.id ?? "emp_1",
            cashierName: emp?.name ?? "Cashier",
            openedAt: new Date().toISOString(),
            openingCash,
            cashSales: 0,
            cashRefunds: 0,
            cashIn: 0,
            cashOut: 0,
            expectedCash: openingCash,
            status: "Open",
            movements: [],
          },
        });
      },

      addNotification: (notification) =>
        set((s) => ({
          notifications: [{ ...notification, id: uid("notif"), read: false }, ...s.notifications],
        })),

      markNotificationRead: (id) =>
        set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
      markAllNotificationsRead: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),

      nextInvoice: () => {
        const seq = get().invoiceSeq + 1;
        set({ invoiceSeq: seq });
        return `INV-2026-${String(seq).padStart(5, "0")}`;
      },
      nextPO: () => {
        const seq = get().poSeq + 1;
        set({ poSeq: seq });
        return `PO-2026-${String(seq).padStart(4, "0")}`;
      },
      nextHold: () => {
        const seq = get().holdSeq + 1;
        set({ holdSeq: seq });
        return `Hold #${String(seq).padStart(3, "0")}`;
      },
      nextReturn: () => {
        const seq = get().returnSeq + 1;
        set({ returnSeq: seq });
        return `RET-2026-${String(seq).padStart(4, "0")}`;
      },
}));

export function useCurrentEmployee() {
  return useAppStore((s) => s.employees.find((e) => e.id === s.currentEmployeeId) ?? s.employees[0]!);
}
