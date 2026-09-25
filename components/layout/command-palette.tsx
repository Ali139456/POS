"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useUiStore } from "@/lib/store/ui-store";
import { useAppStore } from "@/lib/store/app-store";
import { formatPKR } from "@/lib/utils";

export function CommandPalette() {
  const open = useUiStore((s) => s.commandOpen);
  const setOpen = useUiStore((s) => s.setCommandOpen);
  const router = useRouter();
  const products = useAppStore((s) => s.products);
  const customers = useAppStore((s) => s.customers);
  const sales = useAppStore((s) => s.sales);
  const suppliers = useAppStore((s) => s.suppliers);
  const [q, setQ] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  useEffect(() => {
    if (!open) setQ("");
  }, [open]);

  const pages = [
    { label: "Dashboard", href: "/" },
    { label: "POS Checkout", href: "/pos" },
    { label: "Sales", href: "/sales" },
    { label: "Products", href: "/products" },
    { label: "Inventory", href: "/inventory" },
    { label: "Stores", href: "/stores" },
    { label: "Central Inventory", href: "/central-inventory" },
    { label: "Stock Requests", href: "/stock-requests" },
    { label: "Transfers", href: "/transfers" },
    { label: "Customers / Khata", href: "/customers" },
    { label: "Suppliers", href: "/suppliers" },
    { label: "Reports", href: "/reports" },
    { label: "Settings", href: "/settings" },
  ];

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    const go = (href: string) => {
      setOpen(false);
      router.push(href);
    };
    if (!query) return pages.map((p) => ({ group: "Pages", label: p.label, sub: p.href, onSelect: () => go(p.href) }));
    return [
      ...pages
        .filter((p) => p.label.toLowerCase().includes(query))
        .map((p) => ({ group: "Pages", label: p.label, sub: p.href, onSelect: () => go(p.href) })),
      ...products
        .filter((p) => `${p.name} ${p.sku} ${p.barcode}`.toLowerCase().includes(query))
        .slice(0, 6)
        .map((p) => ({ group: "Products", label: p.name, sub: `${p.sku} · ${formatPKR(p.sellingPrice)}`, onSelect: () => go(`/products/${p.id}`) })),
      ...customers
        .filter((c) => `${c.name} ${c.phone}`.toLowerCase().includes(query))
        .slice(0, 5)
        .map((c) => ({ group: "Customers", label: c.name, sub: c.phone, onSelect: () => go(`/customers/${c.id}`) })),
      ...sales
        .filter((s) => s.invoiceNumber.toLowerCase().includes(query) || s.customerName.toLowerCase().includes(query))
        .slice(0, 5)
        .map((s) => ({ group: "Invoices", label: s.invoiceNumber, sub: `${s.customerName} · ${formatPKR(s.total)}`, onSelect: () => go(`/sales/${s.id}`) })),
      ...suppliers
        .filter((s) => `${s.name} ${s.company}`.toLowerCase().includes(query))
        .slice(0, 4)
        .map((s) => ({ group: "Suppliers", label: s.company, sub: s.name, onSelect: () => go(`/suppliers/${s.id}`) })),
    ];
  }, [q, products, customers, sales, suppliers, router, setOpen]);

  if (!open) return null;

  const grouped = results.reduce<Record<string, typeof results>>((acc, r) => {
    (acc[r.group] ??= []).push(r);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-[60] flex items-stretch justify-center sm:items-start sm:pt-[12vh] sm:px-4">
      <button className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
      <div className="relative z-10 flex h-full w-full max-w-xl flex-col overflow-hidden bg-card shadow-2xl sm:h-auto sm:max-h-[70vh] sm:rounded-2xl sm:border sm:border-border">
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products, customers, invoices, pages..."
          className="h-14 w-full border-b border-border bg-transparent px-4 text-sm outline-none"
        />
        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {results.length === 0 && <p className="px-3 py-8 text-center text-sm text-muted-foreground">No matches</p>}
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group} className="mb-2">
              <p className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{group}</p>
              {items.map((item) => (
                <button
                  key={group + item.label + item.sub}
                  onClick={item.onSelect}
                  className="flex min-h-11 w-full items-center gap-2 rounded-lg px-2 py-2.5 text-sm hover:bg-muted"
                >
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="text-xs text-muted-foreground">{item.sub}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
