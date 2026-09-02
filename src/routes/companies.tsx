import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { TextAreaField, TextField } from "@/components/Field";
import { emptyCompany, uid, useDB, type Company } from "@/lib/store";

export const Route = createFileRoute("/companies")({
  head: () => ({
    meta: [
      { title: "الشركات | نظام محاضر الجمعيات العمومية" },
      { name: "description", content: "إدارة بيانات الشركات والشركاء ورأس المال والسجل التجاري." },
      { property: "og:title", content: "إدارة الشركات" },
      { property: "og:description", content: "بيانات الشركات والشركاء المستخدمة في إعداد المحاضر." },
    ],
  }),
  component: Companies,
});

function Companies() {
  const { db, update } = useDB();
  const [editing, setEditing] = useState<Company | null>(null);

  const saveCompany = () => {
    if (!editing) return;
    update((d) => ({
      ...d,
      companies: d.companies.some((c) => c.id === editing.id)
        ? d.companies.map((c) => (c.id === editing.id ? editing : c))
        : [...d.companies, editing],
    }));
    setEditing(null);
  };

  return (
    <AppShell
      title="الشركات"
      subtitle="البيانات الأساسية تُستخدم تلقائيًا عند إنشاء المحاضر."
      actions={
        <button type="button" onClick={() => setEditing(emptyCompany())} className="btn-primary">
          <Plus className="size-4" />
          إضافة شركة
        </button>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        {db.companies.map((c) => (
          <div key={c.id} className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-bold">{c.name}</h2>
                <p className="text-sm text-muted-foreground">{c.legalForm}</p>
              </div>
              <button type="button" onClick={() => setEditing(c)} className="btn-ghost py-1.5 text-xs">
                تعديل
              </button>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-muted-foreground">السجل التجاري</dt>
                <dd dir="ltr">{c.commercialRegister || "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">البطاقة الضريبية</dt>
                <dd dir="ltr">{c.taxId || "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">رأس المال</dt>
                <dd>{c.capital || "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">عدد الشركاء</dt>
                <dd>{c.partners.length}</dd>
              </div>
            </dl>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/40 p-4">
          <div className="w-full max-w-2xl rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-bold">بيانات الشركة</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <TextField
                label="اسم الشركة"
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              />
              <TextField
                label="الشكل القانوني"
                value={editing.legalForm}
                onChange={(e) => setEditing({ ...editing, legalForm: e.target.value })}
              />
              <TextField
                label="السجل التجاري"
                ltr
                value={editing.commercialRegister}
                onChange={(e) => setEditing({ ...editing, commercialRegister: e.target.value })}
              />
              <TextField
                label="البطاقة الضريبية"
                ltr
                value={editing.taxId}
                onChange={(e) => setEditing({ ...editing, taxId: e.target.value })}
              />
              <TextField
                label="رأس المال"
                value={editing.capital}
                onChange={(e) => setEditing({ ...editing, capital: e.target.value })}
              />
              <TextField
                label="المركز الرئيسي"
                value={editing.address}
                onChange={(e) => setEditing({ ...editing, address: e.target.value })}
              />
              <div className="sm:col-span-2">
                <TextAreaField
                  label="غرض الشركة"
                  value={editing.purpose}
                  onChange={(e) => setEditing({ ...editing, purpose: e.target.value })}
                />
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">الشركاء</h3>
                <button
                  type="button"
                  onClick={() =>
                    setEditing({
                      ...editing,
                      partners: [...editing.partners, { id: uid(), name: "", share: "" }],
                    })
                  }
                  className="btn-ghost py-1.5 text-xs"
                >
                  إضافة شريك
                </button>
              </div>
              <div className="mt-3 space-y-2">
                {editing.partners.map((p) => (
                  <div key={p.id} className="flex gap-2">
                    <input
                      className="field-input"
                      placeholder="اسم الشريك"
                      value={p.name}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          partners: editing.partners.map((x) =>
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
                        setEditing({
                          ...editing,
                          partners: editing.partners.map((x) =>
                            x.id === p.id ? { ...x, share: e.target.value } : x,
                          ),
                        })
                      }
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setEditing({
                          ...editing,
                          partners: editing.partners.filter((x) => x.id !== p.id),
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
              <button type="button" onClick={() => setEditing(null)} className="btn-ghost">
                إلغاء
              </button>
              <button type="button" onClick={saveCompany} className="btn-primary">
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
