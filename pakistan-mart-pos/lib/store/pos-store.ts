"use client";

import { create } from "zustand";
import type { CartItem, Customer, Product, ProductVariant } from "@/lib/types";
import { uid, weightUnit } from "@/lib/utils";

interface PosState {
  items: CartItem[];
  customerId: string;
  orderDiscount: number;
  orderDiscountType: "amount" | "percent";
  notes: string;
  searchFocusToken: number;
  addProduct: (product: Product, variant?: ProductVariant, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  bumpQty: (id: string, delta: number) => void;
  setItemDiscount: (id: string, discount: number) => void;
  setItemPrice: (id: string, price: number) => void;
  removeItem: (id: string) => void;
  setCustomer: (id: string) => void;
  setOrderDiscount: (value: number, type?: "amount" | "percent") => void;
  setNotes: (notes: string) => void;
  clear: () => void;
  loadItems: (items: CartItem[], customerId: string, orderDiscount: number) => void;
  requestSearchFocus: () => void;
}

export const WALK_IN = "cust_walkin";

export function cartTotals(
  items: CartItem[],
  orderDiscount: number,
  orderDiscountType: "amount" | "percent",
  previousBalance = 0,
  taxRate = 0,
) {
  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const itemDiscount = items.reduce((s, i) => s + i.discount, 0);
  const afterItems = Math.max(0, subtotal - itemDiscount);
  const orderDisc = orderDiscountType === "percent" ? afterItems * (orderDiscount / 100) : orderDiscount;
  const taxable = Math.max(0, afterItems - orderDisc);
  const tax = taxable * taxRate;
  const beforeRound = taxable + tax + previousBalance;
  const rounded = Math.round(beforeRound);
  const roundOff = Number((rounded - beforeRound).toFixed(2));
  return {
    subtotal,
    itemDiscount,
    orderDiscount: orderDisc,
    tax,
    previousBalance,
    roundOff,
    grandTotal: rounded,
    itemCount: items.reduce((s, i) => s + i.quantity, 0),
  };
}

export const usePosStore = create<PosState>((set, get) => ({
  items: [],
  customerId: WALK_IN,
  orderDiscount: 0,
  orderDiscountType: "amount",
  notes: "",
  searchFocusToken: 0,

  addProduct: (product, variant, qty = 1) => {
    const name = product.name;
    const variantName = variant?.name;
    const unitPrice = variant?.sellingPrice ?? product.sellingPrice;
    const unit = variant?.unit ?? product.unit;
    const stock = variant?.stock ?? product.stock;
    const productId = product.id;
    const variantId = variant?.id;
    const existing = get().items.find((i) => i.productId === productId && i.variantId === variantId);
    if (existing) {
      set({
        items: get().items.map((i) =>
          i.id === existing.id ? { ...i, quantity: Math.min(stock, i.quantity + qty) } : i,
        ),
      });
      return;
    }
    const item: CartItem = {
      id: uid("cart"),
      productId,
      variantId,
      name,
      variantName,
      unit,
      unitPrice,
      quantity: qty,
      discount: 0,
      stock,
      allowDecimal: weightUnit(unit),
    };
    set({ items: [...get().items, item] });
  },

  setQty: (id, qty) =>
    set({
      items: get().items.map((i) => {
        if (i.id !== id) return i;
        const next = i.allowDecimal ? Math.max(0.01, qty) : Math.max(1, Math.round(qty));
        return { ...i, quantity: Math.min(i.stock || next, next) };
      }),
    }),

  bumpQty: (id, delta) => {
    const item = get().items.find((i) => i.id === id);
    if (!item) return;
    const step = item.allowDecimal ? 0.25 : 1;
    get().setQty(id, item.quantity + delta * step);
  },

  setItemDiscount: (id, discount) =>
    set({ items: get().items.map((i) => (i.id === id ? { ...i, discount: Math.max(0, discount) } : i)) }),

  setItemPrice: (id, price) =>
    set({ items: get().items.map((i) => (i.id === id ? { ...i, unitPrice: Math.max(0, price) } : i)) }),

  removeItem: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
  setCustomer: (id) => set({ customerId: id }),
  setOrderDiscount: (value, type) =>
    set({ orderDiscount: Math.max(0, value), orderDiscountType: type ?? get().orderDiscountType }),
  setNotes: (notes) => set({ notes }),
  clear: () => set({ items: [], customerId: WALK_IN, orderDiscount: 0, orderDiscountType: "amount", notes: "" }),
  loadItems: (items, customerId, orderDiscount) => set({ items, customerId, orderDiscount, orderDiscountType: "amount" }),
  requestSearchFocus: () => set({ searchFocusToken: get().searchFocusToken + 1 }),
}));

export function customerOf(customers: Customer[], id: string): Customer {
  return customers.find((c) => c.id === id) ?? customers[0]!;
}
