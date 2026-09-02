import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Field({
  label,
  ltr,
  children,
}: {
  label: string;
  ltr?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5" dir={ltr ? "ltr" : undefined}>
      <label className="field-label" dir="rtl">
        {label}
      </label>
      {children}
    </div>
  );
}

export function TextField({
  label,
  ltr,
  className,
  ...props
}: {
  label: string;
  ltr?: boolean;
} & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Field label={label} ltr={ltr}>
      <input className={cn("field-input", ltr && "text-start", className)} dir={ltr ? "ltr" : "rtl"} {...props} />
    </Field>
  );
}

export function TextAreaField({
  label,
  ltr,
  className,
  ...props
}: {
  label: string;
  ltr?: boolean;
} & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Field label={label} ltr={ltr}>
      <textarea
        className={cn("field-input min-h-20", className)}
        dir={ltr ? "ltr" : "rtl"}
        {...props}
      />
    </Field>
  );
}
