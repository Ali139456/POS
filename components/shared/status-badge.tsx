import type { CreditStatus, ProductStatus, PurchaseStatus, SaleStatus, StockStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { stockStatus } from "@/lib/utils";

export function StockBadge({ stock, min, max }: { stock: number; min: number; max?: number }) {
  const status = stockStatus(stock, min, max);
  return <StatusBadge status={status} />;
}

export function StatusBadge({
  status,
}: {
  status: StockStatus | SaleStatus | PurchaseStatus | ProductStatus | CreditStatus | string;
}) {
  const map: Record<string, { tone: React.ComponentProps<typeof Badge>["tone"]; label: string }> = {
    "In Stock": { tone: "success", label: "In Stock" },
    "Low Stock": { tone: "warning", label: "Low Stock" },
    "Out of Stock": { tone: "danger", label: "Out of Stock" },
    Overstock: { tone: "info", label: "Overstock" },
    Completed: { tone: "success", label: "Completed" },
    Held: { tone: "warning", label: "Held" },
    Voided: { tone: "danger", label: "Voided" },
    Refunded: { tone: "info", label: "Refunded" },
    "Partial Refund": { tone: "warning", label: "Partial Refund" },
    Draft: { tone: "neutral", label: "Draft" },
    Ordered: { tone: "info", label: "Ordered" },
    "Partially Received": { tone: "warning", label: "Partial" },
    Received: { tone: "success", label: "Received" },
    Cancelled: { tone: "danger", label: "Cancelled" },
    Active: { tone: "success", label: "Active" },
    Inactive: { tone: "neutral", label: "Inactive" },
    Discontinued: { tone: "danger", label: "Discontinued" },
    Paid: { tone: "success", label: "Paid" },
    Partial: { tone: "warning", label: "Partial" },
    Due: { tone: "info", label: "Due" },
    Overdue: { tone: "danger", label: "Overdue" },
    Open: { tone: "success", label: "Open" },
    Closed: { tone: "neutral", label: "Closed" },
    Walkin: { tone: "neutral", label: "Walk-in" },
    Regular: { tone: "primary", label: "Regular" },
    Wholesale: { tone: "info", label: "Wholesale" },
    VIP: { tone: "warning", label: "VIP" },
    "Walk-in": { tone: "neutral", label: "Walk-in" },
    Pending: { tone: "warning", label: "Pending" },
    Approved: { tone: "success", label: "Approved" },
    Rejected: { tone: "danger", label: "Rejected" },
    Dispatched: { tone: "info", label: "Dispatched" },
    "Partial Recv": { tone: "warning", label: "Partial Recv" },
  };
  const cfg = map[status] ?? { tone: "neutral" as const, label: status };
  return <Badge tone={cfg.tone}>{cfg.label}</Badge>;
}
