import { Badge } from "@/components/ui/badge";
import {
  COMPLAINT_STATUS_LABELS,
  REQUEST_STATUS_LABELS,
  VERIFICATION_LABELS,
} from "@/lib/constants";
import type {
  ComplaintStatus,
  PaymentStatus,
  RequestStatus,
  VerificationStatus,
} from "@prisma/client";

const tone: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  REVIEWING: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200",
  APPROVED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  RELEASED: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
  REJECTED: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
  VERIFIED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  UNVERIFIED: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  NEW: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  IN_PROGRESS: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200",
  RESOLVED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  PAID: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  UNPAID: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
};

export function StatusBadge({
  value,
}: {
  value: RequestStatus | VerificationStatus | ComplaintStatus | PaymentStatus;
}) {
  const label =
    value in REQUEST_STATUS_LABELS
      ? REQUEST_STATUS_LABELS[value as RequestStatus]
      : value in VERIFICATION_LABELS
        ? VERIFICATION_LABELS[value as VerificationStatus]
        : value in COMPLAINT_STATUS_LABELS
          ? COMPLAINT_STATUS_LABELS[value as ComplaintStatus]
          : value;
  return (
    <Badge variant="secondary" className={tone[value] ?? ""}>
      {label}
    </Badge>
  );
}
