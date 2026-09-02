import { Building2, FilePlus2 } from "lucide-react";

export function OnboardingCard({
  onAddCompany,
  onLoadDemo,
}: {
  onAddCompany: () => void;
  onLoadDemo?: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl rounded-xl border border-border bg-card p-8 text-start">
      <p className="text-[11px] font-bold tracking-wide text-primary">البداية</p>
      <h2 className="mt-1 text-xl font-bold">أضف شركة، ثم أنشئ المحضر</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        المحاسب يبدأ بملف الشركة. المحضر يسحب الاسم والعنوان والشركاء حتى لا تُعاد كتابتها في وورد.
      </p>
      <ol className="mt-6 space-y-3">
        <li className="flex gap-3 rounded-lg border border-border bg-secondary/60 p-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
            1
          </span>
          <div>
            <p className="flex items-center gap-1.5 font-semibold">
              <Building2 className="size-4" />
              بيانات الشركة
            </p>
            <p className="text-xs text-muted-foreground">السجل، الشكل القانوني، المركز، والشركاء.</p>
          </div>
        </li>
        <li className="flex gap-3 rounded-lg border border-dashed border-border p-3 text-muted-foreground">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-secondary text-sm font-bold">
            2
          </span>
          <div>
            <p className="flex items-center gap-1.5 font-semibold text-foreground">
              <FilePlus2 className="size-4" />
              محضر الجمعية
            </p>
            <p className="text-xs">عادية أو غير عادية — بعد حفظ الشركة مباشرة.</p>
          </div>
        </li>
      </ol>
      <button type="button" onClick={onAddCompany} className="btn-primary mt-6 w-full py-2.5">
        إضافة شركة
      </button>
      {onLoadDemo && (
        <button type="button" onClick={onLoadDemo} className="btn-ghost mt-2 w-full">
          عرض نموذج ببيانات جاهزة
        </button>
      )}
    </div>
  );
}
