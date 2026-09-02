import {
  displayStatus,
  displayStatusLabel,
  type DisplayStatus,
  type Report,
} from "@/lib/store";
import { cn } from "@/lib/utils";

export const statusTone: Record<
  DisplayStatus,
  {
    badge: string;
    dot: string;
    bar: string;
    card: string;
    value: string;
  }
> = {
  draft: {
    badge: "bg-secondary text-secondary-foreground",
    dot: "bg-muted-foreground",
    bar: "bg-muted-foreground",
    card: "border-s-muted-foreground/55 bg-secondary/80",
    value: "text-foreground",
  },
  waiting: {
    badge: "bg-primary-soft text-primary",
    dot: "bg-primary",
    bar: "bg-primary",
    card: "border-s-primary bg-primary-soft",
    value: "text-primary",
  },
  review: {
    badge: "bg-warning-soft text-warning-foreground",
    dot: "bg-warning",
    bar: "bg-warning",
    card: "border-s-warning bg-warning-soft",
    value: "text-warning-foreground",
  },
  approved: {
    badge: "bg-success-soft text-success",
    dot: "bg-success",
    bar: "bg-success",
    card: "border-s-success bg-success-soft",
    value: "text-success",
  },
};

export function StatusBadge({
  report,
  className,
}: {
  report: Pick<Report, "status" | "reviewRequestedAt">;
  className?: string;
}) {
  const status = displayStatus(report);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold",
        statusTone[status].badge,
        className,
      )}
    >
      <span className={cn("size-1.5 shrink-0 rounded-full", statusTone[status].dot)} />
      {displayStatusLabel[status]}
    </span>
  );
}
