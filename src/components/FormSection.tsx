import { ChevronDown, type LucideIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function FormSection({
  title,
  icon: Icon,
  defaultOpen = true,
  testId,
  children,
}: {
  title: string;
  icon: LucideIcon;
  defaultOpen?: boolean;
  testId?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border pb-6">
      <button
        type="button"
        data-testid={testId}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-2 text-start"
      >
        <span className="flex items-center gap-2.5">
          <Icon className="size-4 text-primary" />
          <span className="text-lg font-semibold text-foreground">{title}</span>
        </span>
        <ChevronDown
          className={cn("size-5 text-muted-foreground transition-transform", open && "rotate-180")}
        />
      </button>
      {open && <div className="mt-4 flex flex-col gap-4">{children}</div>}
    </div>
  );
}
