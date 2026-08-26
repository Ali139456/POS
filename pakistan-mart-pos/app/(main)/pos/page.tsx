"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, ScanBarcode, ShoppingCart } from "lucide-react";
import { TopHeader } from "@/components/layout/top-header";
import { SearchInput } from "@/components/shared/search-input";
import { ProductCard } from "@/components/pos/product-card";
import { PosCart } from "@/components/pos/pos-cart";
import { VariantDialog } from "@/components/pos/variant-dialog";
import { PaymentDialog } from "@/components/pos/payment-dialog";
import { CustomerSelector } from "@/components/pos/customer-selector";
import { HoldDialog } from "@/components/pos/hold-dialog";
import { useAppStore } from "@/lib/store/app-store";
import { cartTotals, usePosStore } from "@/lib/store/pos-store";
import { formatPKR, uid } from "@/lib/utils";
import { toast } from "sonner";
import type { Product } from "@/lib/types";

export default function PosPage() {
  const products = useAppStore((s) => s.products);
  const categories = useAppStore((s) => s.categories);
  const customers = useAppStore((s) => s.customers);
  const holdSale = useAppStore((s) => s.holdSale);
  const nextHold = useAppStore((s) => s.nextHold);
  const addProduct = usePosStore((s) => s.addProduct);
  const items = usePosStore((s) => s.items);
  const customerId = usePosStore((s) => s.customerId);
  const orderDiscount = usePosStore((s) => s.orderDiscount);
  const orderDiscountType = usePosStore((s) => s.orderDiscountType);
  const clear = usePosStore((s) => s.clear);
  const searchToken = usePosStore((s) => s.searchFocusToken);
  const requestSearch = usePosStore((s) => s.requestSearchFocus);
  const totals = cartTotals(items, orderDiscount, orderDiscountType);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [variantOf, setVariantOf] = useState<Product | null>(null);
  const [payOpen, setPayOpen] = useState(false);
  const [custOpen, setCustOpen] = useState(false);
  const [holdOpen, setHoldOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    searchRef.current?.focus();
  }, [searchToken]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (e.key === "F1") {
        e.preventDefault();
        requestSearch();
        searchRef.current?.focus();
      }
      if (e.key === "F2") {
        e.preventDefault();
        setCustOpen(true);
      }
      if (e.key === "F4") {
        e.preventDefault();
        doHold();
      }
      if (e.key === "F8" || e.key === "F10" || e.key === "F9") {
        e.preventDefault();
        if (items.length) setPayOpen(true);
      }
      if (e.key === "Escape" && tag !== "INPUT") {
        setPayOpen(false);
        setCustOpen(false);
        setHoldOpen(false);
        setVariantOf(null);
        setCartOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [items.length, requestSearch]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return products.filter((p) => {
      if (p.status !== "Active") return false;
      if (cat !== "all" && p.categoryId !== cat) return false;
      if (!query) return true;
      const catName = categories.find((c) => c.id === p.categoryId)?.name ?? "";
      return `${p.name} ${p.sku} ${p.barcode} ${p.brand} ${catName}`.toLowerCase().includes(query);
    });
  }, [products, q, cat, categories]);

  function add(p: Product) {
    if (p.variants.length) {
      setVariantOf(p);
      return;
    }
    addProduct(p);
    toast.success(`${p.name} added to cart`);
    setQ("");
    searchRef.current?.focus();
  }

  function onSearchEnter() {
    if (filtered.length === 1) add(filtered[0]!);
  }

  function doHold() {
    if (!items.length) {
      setHoldOpen(true);
      return;
    }
    const customer = customers.find((c) => c.id === customerId);
    holdSale({
      id: uid("hold"),
      holdNumber: nextHold(),
      createdAt: new Date().toISOString(),
      customerId,
      customerName: customer?.name ?? "Walk-in Customer",
      items,
      orderDiscount,
    });
    clear();
    toast.success("Sale held");
  }

  const cart = (
    <PosCart
      onPay={() => {
        setCartOpen(false);
        setPayOpen(true);
      }}
      onCustomer={() => setCustOpen(true)}
      onHold={doHold}
      onClose={() => setCartOpen(false)}
    />
  );

  return (
    <>
      <TopHeader
        title="POS Checkout"
        extra={
          <button onClick={() => setHoldOpen(true)} className="flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm">
            <Pause className="size-4" />
            Held
          </button>
        }
      />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="shrink-0 border-b border-border p-2 min-[800px]:p-3 [@media(max-height:760px)]:p-2">
            <div className="relative">
              <SearchInput
                inputRef={searchRef}
                value={q}
                onChange={setQ}
                placeholder="Search product, SKU or barcode..."
                inputClassName="pr-10"
                onKeyDown={(e) => {
                  if (e.key === "Enter") onSearchEnter();
                }}
              />
              <ScanBarcode className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>
            <div className="-mx-2 mt-2 flex gap-2 overflow-x-auto px-2 pb-1 scrollbar-thin min-[800px]:mx-0 min-[800px]:mt-3 min-[800px]:px-0">
              <CatChip active={cat === "all"} onClick={() => setCat("all")} label="All" />
              {categories.map((c) => (
                <CatChip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)} label={c.name} />
              ))}
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin p-2 pb-24 min-[800px]:p-3 lg:pb-3">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 min-[800px]:gap-3">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} onAdd={() => add(p)} />
              ))}
            </div>
            {filtered.length === 0 && (
              <p className="py-16 text-center text-sm text-muted-foreground">No products match that search.</p>
            )}
          </div>
          <div className="hidden shrink-0 flex-wrap gap-3 border-t border-border px-4 py-1.5 text-[11px] text-muted-foreground min-[820px]:flex [@media(max-height:800px)]:hidden">
            <span>F1 Search</span>
            <span>F2 Customer</span>
            <span>F4 Hold</span>
            <span>F8 Pay</span>
            <span>ESC Close</span>
          </div>
        </div>

        <div className="hidden min-h-0 w-[38%] min-w-[280px] max-w-[480px] lg:flex xl:w-[36%] 2xl:w-[34%]">{cart}</div>
      </div>

      {!cartOpen && (
        <div className="no-print sticky bottom-0 z-20 border-t border-border bg-card/95 px-3 py-2 backdrop-blur lg:hidden pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <button
            onClick={() => setCartOpen(true)}
            className="flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl bg-primary px-4 py-3 text-primary-foreground"
          >
            <span className="flex min-w-0 items-center gap-2">
              <ShoppingCart className="size-4 shrink-0" />
              <span className="truncate text-sm font-medium">
                {totals.itemCount || 0} items — {formatPKR(totals.grandTotal)}
              </span>
            </span>
            <span className="shrink-0 text-sm font-semibold">{items.length ? "View Cart" : "Cart"}</span>
          </button>
        </div>
      )}

      {cartOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button className="absolute inset-0 bg-slate-950/45" aria-label="Close cart" onClick={() => setCartOpen(false)} />
          <div className="absolute inset-0 flex flex-col overflow-hidden bg-card shadow-2xl sm:inset-y-0 sm:left-auto sm:right-0 sm:top-0 sm:w-[min(100%,420px)]">
            {cart}
          </div>
        </div>
      )}

      <VariantDialog product={variantOf} onClose={() => setVariantOf(null)} />
      <PaymentDialog open={payOpen} onClose={() => setPayOpen(false)} />
      <CustomerSelector open={custOpen} onClose={() => setCustOpen(false)} />
      <HoldDialog open={holdOpen} onClose={() => setHoldOpen(false)} />
    </>
  );
}

function CatChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`h-10 shrink-0 rounded-full px-3.5 text-sm font-medium ${active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
    >
      {label}
    </button>
  );
}
