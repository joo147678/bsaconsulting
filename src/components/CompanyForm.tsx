import { TextAreaField, TextField } from "@/components/Field";
import { companyShortName, uid, type Company } from "@/lib/store";

export function CompanyForm({
  company,
  onChange,
  onCancel,
  onSave,
  stepLabel,
  cancelLabel = "إلغاء",
}: {
  company: Company;
  onChange: (company: Company) => void;
  onCancel: () => void;
  onSave: () => void;
  stepLabel?: string;
  cancelLabel?: string;
}) {
  const setName = (name: string) => {
    const autoShort = !company.shortName || company.shortName === companyShortName(company.name);
    onChange({
      ...company,
      name,
      shortName: autoShort ? companyShortName(name) : company.shortName,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/40 p-4">
      <form
        className="w-full max-w-2xl rounded-lg border border-border bg-card p-6"
        onSubmit={(e) => {
          e.preventDefault();
          if (!company.name.trim()) return;
          onSave();
        }}
      >
        {stepLabel && (
          <p className="mb-1 text-[11px] font-bold tracking-wide text-primary">{stepLabel}</p>
        )}
        <h2 className="text-lg font-bold">بيانات الشركة</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          تُستخدم هذه البيانات تلقائيًا عند إنشاء المحضر: الاسم، العنوان، والشركاء.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <TextField label="اسم الشركة" value={company.name} onChange={(e) => setName(e.target.value)} required />
          <TextField
            label="الاسم المختصر"
            value={company.shortName}
            onChange={(e) => onChange({ ...company, shortName: e.target.value })}
          />
          <TextField
            label="الشكل القانوني"
            value={company.legalForm}
            onChange={(e) => onChange({ ...company, legalForm: e.target.value })}
          />
          <TextField
            label="السجل التجاري"
            ltr
            value={company.commercialRegister}
            onChange={(e) => onChange({ ...company, commercialRegister: e.target.value })}
          />
          <TextField
            label="البطاقة الضريبية"
            ltr
            value={company.taxId}
            onChange={(e) => onChange({ ...company, taxId: e.target.value })}
          />
          <TextField
            label="رأس المال"
            value={company.capital}
            onChange={(e) => onChange({ ...company, capital: e.target.value })}
          />
          <div className="sm:col-span-2">
            <TextField
              label="المركز الرئيسي"
              value={company.address}
              onChange={(e) => onChange({ ...company, address: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <TextAreaField
              label="غرض الشركة"
              value={company.purpose}
              onChange={(e) => onChange({ ...company, purpose: e.target.value })}
            />
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">الشركاء</h3>
            <button
              type="button"
              onClick={() =>
                onChange({
                  ...company,
                  partners: [...company.partners, { id: uid(), name: "", share: "" }],
                })
              }
              className="btn-ghost py-1.5 text-xs"
            >
              إضافة شريك
            </button>
          </div>
          {company.partners.length === 0 && (
            <p className="mt-2 text-xs text-muted-foreground">اختياري الآن — يظهرون في بيان الحضور داخل المحضر.</p>
          )}
          <div className="mt-3 space-y-2">
            {company.partners.map((p) => (
              <div key={p.id} className="flex gap-2">
                <input
                  className="field-input"
                  placeholder="اسم الشريك"
                  value={p.name}
                  onChange={(e) =>
                    onChange({
                      ...company,
                      partners: company.partners.map((x) =>
                        x.id === p.id ? { ...x, name: e.target.value } : x,
                      ),
                    })
                  }
                />
                <input
                  className="field-input max-w-32"
                  placeholder="الحصة"
                  value={p.share}
                  onChange={(e) =>
                    onChange({
                      ...company,
                      partners: company.partners.map((x) =>
                        x.id === p.id ? { ...x, share: e.target.value } : x,
                      ),
                    })
                  }
                />
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      ...company,
                      partners: company.partners.filter((x) => x.id !== p.id),
                    })
                  }
                  className="rounded-md border border-border px-3 text-sm text-destructive hover:bg-secondary"
                >
                  حذف
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="btn-ghost">
            {cancelLabel}
          </button>
          <button type="submit" disabled={!company.name.trim()} className="btn-primary">
            حفظ الشركة
          </button>
        </div>
      </form>
    </div>
  );
}
