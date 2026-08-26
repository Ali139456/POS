import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import type { StockStatus } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPKR(amount: number, compact = false): string {
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString("en-PK", {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  });
  const sign = amount < 0 ? "-" : "";
  if (compact && abs >= 100000) {
    return `${sign}Rs. ${(abs / 100000).toFixed(1)}L`;
  }
  return `${sign}Rs. ${formatted}`;
}

export function formatQty(qty: number, unit?: string): string {
  const value = Number.isInteger(qty) ? String(qty) : qty.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  return unit ? `${value} ${unit}` : value;
}

export function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
}

export function invoiceNumber(seq: number, year = 2026): string {
  return `INV-${year}-${String(seq).padStart(5, "0")}`;
}

export function poNumber(seq: number): string {
  return `PO-2026-${String(seq).padStart(4, "0")}`;
}

export function greeting(date = new Date()): string {
  const h = date.getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

export function formatDateTime(iso: string): string {
  const d = parseISO(iso);
  if (isToday(d)) return `Today, ${format(d, "h:mm a")}`;
  if (isYesterday(d)) return `Yesterday, ${format(d, "h:mm a")}`;
  return format(d, "dd MMM yyyy, h:mm a");
}

export function formatDate(iso: string): string {
  return format(parseISO(iso), "dd MMM yyyy");
}

export function stockStatus(stock: number, min: number, max?: number): StockStatus {
  if (stock <= 0) return "Out of Stock";
  if (stock <= min) return "Low Stock";
  if (max && stock > max) return "Overstock";
  return "In Stock";
}

export function profitMargin(purchase: number, selling: number): { amount: number; percent: number } {
  const amount = selling - purchase;
  const percent = purchase === 0 ? 0 : (amount / purchase) * 100;
  return { amount, percent };
}

export function roundOff(amount: number): { rounded: number; diff: number } {
  const rounded = Math.round(amount);
  return { rounded, diff: Number((rounded - amount).toFixed(2)) };
}

export function daysUntil(iso?: string): number | null {
  if (!iso) return null;
  const ms = parseISO(iso).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]!.toUpperCase())
    .join("");
}

export function downloadText(filename: string, content: string, mime = "text/plain"): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function toCsv(rows: Record<string, string | number>[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]!);
  const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  return [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h] ?? "")).join(","))].join("\n");
}

export function weightUnit(unit: string): boolean {
  return unit === "KG" || unit === "Gram" || unit === "Liter" || unit === "ML";
}
