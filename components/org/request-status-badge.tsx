import type { StockRequestStatus, StockTransferStatus } from "@/lib/types";
import { StatusBadge } from "@/components/shared/status-badge";

const REQUEST_LABELS: Record<StockRequestStatus, string> = {
  DRAFT: "Draft",
  PENDING: "Pending",
  APPROVED: "Approved",
  PARTIALLY_APPROVED: "Partial",
  REJECTED: "Rejected",
  DISPATCHED: "Dispatched",
  PARTIALLY_RECEIVED: "Partial Recv",
  RECEIVED: "Received",
  CANCELLED: "Cancelled",
};

const TRANSFER_LABELS: Record<StockTransferStatus, string> = {
  DRAFT: "Draft",
  APPROVED: "Approved",
  DISPATCHED: "Dispatched",
  PARTIALLY_RECEIVED: "Partial Recv",
  RECEIVED: "Received",
  CANCELLED: "Cancelled",
};

export function StockRequestStatusBadge({ status }: { status: StockRequestStatus }) {
  return <StatusBadge status={REQUEST_LABELS[status] ?? status} />;
}

export function StockTransferStatusBadge({ status }: { status: StockTransferStatus }) {
  return <StatusBadge status={TRANSFER_LABELS[status] ?? status} />;
}
