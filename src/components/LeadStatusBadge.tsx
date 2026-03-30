import { STATUS_CONFIG, type LeadStatus } from "@/lib/types";

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color}`}
    >
      {config.label}
    </span>
  );
}
