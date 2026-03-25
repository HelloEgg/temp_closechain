import { CheckCircle2, Clock, AlertCircle, XCircle, PlayCircle, Send, PauseCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// All possible status values across the app
export type Status =
  // Project statuses
  | "active" | "completed" | "on_hold" | "archived"
  // Sub statuses
  | "not_started" | "in_progress" | "submitted" | "approved" | "rejected"
  // Document statuses
  | "pending" | "received" | "waived"
  // Legacy
  | "not_submitted" | "uploaded";

const variantMap: Record<Status, string> = {
  // Project
  active:         "bg-blue-50 text-blue-700 border border-blue-200",
  completed:      "bg-emerald-50 text-emerald-700 border border-emerald-200",
  on_hold:        "bg-amber-50 text-amber-700 border border-amber-200",
  archived:       "bg-gray-100 text-gray-500 border border-gray-200",
  // Sub
  not_started:    "bg-gray-100 text-gray-600 border border-gray-200",
  in_progress:    "bg-blue-50 text-blue-700 border border-blue-200",
  submitted:      "bg-violet-50 text-violet-700 border border-violet-200",
  approved:       "bg-emerald-50 text-emerald-700 border border-emerald-200",
  rejected:       "bg-red-50 text-red-700 border border-red-200",
  // Document
  pending:        "bg-gray-100 text-gray-600 border border-gray-200",
  received:       "bg-amber-50 text-amber-700 border border-amber-200",
  waived:         "bg-gray-100 text-gray-400 border border-gray-200",
  // Legacy
  not_submitted:  "bg-gray-100 text-gray-600 border border-gray-200",
  uploaded:       "bg-amber-50 text-amber-700 border border-amber-200",
};

const labelMap: Record<Status, string> = {
  active:        "Active",
  completed:     "Completed",
  on_hold:       "On Hold",
  archived:      "Archived",
  not_started:   "Not Started",
  in_progress:   "In Progress",
  submitted:     "Submitted",
  approved:      "Approved",
  rejected:      "Rejected",
  pending:       "Pending",
  received:      "Received",
  waived:        "Waived",
  not_submitted: "Not Submitted",
  uploaded:      "Pending Review",
};

const iconMap: Partial<Record<Status, React.ReactNode>> = {
  active:       <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />,
  completed:    <CheckCircle2 className="w-3.5 h-3.5" />,
  on_hold:      <PauseCircle className="w-3.5 h-3.5" />,
  archived:     <CheckCircle2 className="w-3.5 h-3.5" />,
  not_started:  <Clock className="w-3.5 h-3.5" />,
  in_progress:  <PlayCircle className="w-3.5 h-3.5" />,
  submitted:    <Send className="w-3.5 h-3.5" />,
  approved:     <CheckCircle2 className="w-3.5 h-3.5" />,
  rejected:     <XCircle className="w-3.5 h-3.5" />,
  pending:      <Clock className="w-3.5 h-3.5" />,
  received:     <Clock className="w-3.5 h-3.5" />,
  waived:       <AlertCircle className="w-3.5 h-3.5" />,
  not_submitted:<AlertCircle className="w-3.5 h-3.5" />,
  uploaded:     <Clock className="w-3.5 h-3.5" />,
};

export default function StatusBadge({
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
  const displayLabel = label ?? labelMap[status] ?? status;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        variantMap[status] ?? "bg-gray-100 text-gray-600 border border-gray-200",
        className
      )}
    >
      {showIcon && iconMap[status]}
      {displayLabel}
    </span>
  );
}
