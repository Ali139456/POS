"use client";

import { useAppStore } from "@/lib/store/app-store";
import { formatDateTime, formatPKR } from "@/lib/utils";
import type { Sale } from "@/lib/types";

export function ReceiptPreview({ sale }: { sale: Sale }) {
  const store = useAppStore((s) => s.store);
  return (
    <div className="mx-auto max-w-sm rounded-xl border border-border bg-white p-5 text-slate-900 shadow-sm print:border-0 print:shadow-none">
      {store.receiptShowLogo && <p className="text-center text-lg font-bold tracking-tight">{store.name}</p>}
      {store.receiptShowAddress && (
        <p className="text-center text-xs text-slate-600">
          {store.address}, {store.city}
        </p>
      )}
      {store.receiptShowPhone && <p className="text-center text-xs text-slate-600">{store.phone}</p>}
      {store.receiptShowNtn && <p className="text-center text-xs text-slate-600">NTN {store.ntn}</p>}
      <div className="my-3 border-t border-dashed border-slate-300" />
      <p className="text-center font-mono text-sm">{sale.invoiceNumber}</p>
      <p className="text-center text-xs">{formatDateTime(sale.date)}</p>
      {store.receiptShowCashier && <p className="text-center text-xs">Cashier: {sale.cashierName}</p>}
      {store.receiptShowCustomer && <p className="text-center text-xs">Customer: {sale.customerName}</p>}
      <div className="my-3 border-t border-dashed border-slate-300" />
      {sale.items.map((i) => (
        <div key={i.id} className="flex justify-between gap-2 text-xs">
          <span className="min-w-0 break-words">
            {i.name} {i.variantName ?? ""} × {i.quantity}
          </span>
          <span className="shrink-0 tabular-nums">{formatPKR(i.total)}</span>
        </div>
      ))}
      <div className="my-3 border-t border-dashed border-slate-300" />
      {store.receiptShowDiscount && sale.orderDiscount + sale.itemDiscount > 0 && (
        <div className="flex justify-between text-xs">
          <span>Discount</span>
          <span>- {formatPKR(sale.orderDiscount + sale.itemDiscount)}</span>
        </div>
      )}
      {store.receiptShowTax && (
        <div className="flex justify-between text-xs">
          <span>Tax</span>
          <span>{formatPKR(sale.tax)}</span>
        </div>
      )}
      <div className="flex justify-between font-semibold">
        <span>Total</span>
        <span>{formatPKR(sale.total)}</span>
      </div>
      <p className="mt-1 text-xs">Paid via {sale.paymentMethod}</p>
      {store.receiptShowBarcode && <p className="mt-3 text-center font-mono text-lg tracking-[0.3em]">|{sale.invoiceNumber.replace(/\D/g, "").slice(-8)}|</p>}
      <p className="mt-3 text-center text-xs text-slate-500">{store.receiptFooter}</p>
    </div>
  );
}
