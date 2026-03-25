"use client";

import { CheckCircle2, Clock, AlertCircle, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "not_submitted" | "uploaded" | "approved" | "active" | "archived";

const variantMap: Record<Status, string> = {
  not_submitted: "bg-gray-100 text-gray-700 border border-gray-200",
  uploaded: "bg-amber-50 text-amber-700 border border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  active: "bg-blue-50 text-blue-700 border border-blue-200",
  archived: "bg-gray-100 text-gray-600 border border-gray-200",
};

const labelMap: Record<Status, string> = {
  not_submitted: "Not Submitted",
  uploaded: "Pending Review",
  approved: "Published",
  active: "Active",
  archived: "Archived",
};

export function StatusBadge({
  status,
  label,
  showIcon = true,
  className,
}: {
  status: Status;
  label?: string;
  showIcon?: boolean;
  className?: string;
}) {
  const displayLabel = label ?? labelMap[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        variantMap[status],
        className
      )}
    >
      {showIcon && status === "not_submitted" && <AlertCircle className="w-3.5 h-3.5" />}
      {showIcon && status === "uploaded" && <Clock className="w-3.5 h-3.5" />}
      {showIcon && status === "approved" && <Globe className="w-3.5 h-3.5" />}
      {showIcon && status === "active" && (
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
      )}
      {showIcon && status === "archived" && <CheckCircle2 className="w-3.5 h-3.5" />}
      {displayLabel}
    </span>
  );
}
