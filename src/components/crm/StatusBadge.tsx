import { cn } from "@/lib/cn";
import { statusBadgeClass } from "@/lib/crm/pipeline";

export function StatusBadge({
  status,
  label,
  className,
}: {
  status: string;
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        statusBadgeClass(status),
        className
      )}
    >
      {label}
    </span>
  );
}
