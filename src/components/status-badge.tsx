import {
  REQUEST_STATUS_LABELS,
  TUTOR_APPROVAL_LABELS,
} from "@/lib/constants";

const APPROVAL_COLOR: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-red-100 text-red-700",
};

const REQUEST_COLOR: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  COUNTERED: "bg-sky-100 text-sky-800",
  ACCEPTED: "bg-emerald-100 text-emerald-800",
  DECLINED: "bg-red-100 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-600",
};

export function ApprovalBadge({
  status,
}: {
  status: keyof typeof TUTOR_APPROVAL_LABELS;
}) {
  return (
    <span className={`badge ${APPROVAL_COLOR[status]}`}>
      {TUTOR_APPROVAL_LABELS[status]}
    </span>
  );
}

export function RequestStatusBadge({
  status,
}: {
  status: keyof typeof REQUEST_STATUS_LABELS;
}) {
  return (
    <span className={`badge ${REQUEST_COLOR[status]}`}>
      {REQUEST_STATUS_LABELS[status]}
    </span>
  );
}
