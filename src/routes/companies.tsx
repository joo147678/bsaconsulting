import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
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
    <AppShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">الشركات</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            البيانات الأساسية تُستخدم تلقائيًا عند إنشاء المحاضر.
          </p>
        </div>
        <button
          onClick={() => setEditing(emptyCompany())}
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          إضافة شركة
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {db.companies.map((c) => (
          <div key={c.id} className="rounded-xl border border-border bg-card p-5 shadow-panel">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-bold">{c.name}</h2>
                <p className="text-sm text-muted-foreground">{c.legalForm}</p>
              </div>
              <button
                onClick={() => setEditing(c)}
                className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary"
              >
                تعديل
              </button>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-muted-foreground">السجل التجاري</dt>
                <dd>{c.commercialRegister || "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">البطاقة الضريبية</dt>
                <dd>{c.taxId || "—"}</dd>
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
          <div className="w-full max-w-2xl rounded-xl border border-border bg-card p-6 shadow-panel">
            <h2 className="text-lg font-bold">بيانات الشركة</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {(
                [
                  ["name", "اسم الشركة"],
                  ["legalForm", "الشكل القانوني"],
                  ["commercialRegister", "السجل التجاري"],
                  ["taxId", "البطاقة الضريبية"],
                  ["capital", "رأس المال"],
                  ["address", "المركز الرئيسي"],
                ] as const
              ).map(([key, label]) => (
                <div key={key}>
                  <label className="field-label">{label}</label>
                  <input
                    className="field-input"
                    value={editing[key]}
                    onChange={(e) => setEditing({ ...editing, [key]: e.target.value })}
                  />
                </div>
              ))}
              <div className="sm:col-span-2">
                <label className="field-label">غرض الشركة</label>
                <textarea
                  className="field-input min-h-20"
                  value={editing.purpose}
                  onChange={(e) => setEditing({ ...editing, purpose: e.target.value })}
                />
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">الشركاء</h3>
                <button
                  onClick={() =>
                    setEditing({
                      ...editing,
                      partners: [...editing.partners, { id: uid(), name: "", share: "" }],
                    })
                  }
                  className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary"
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
              <button
                onClick={() => setEditing(null)}
                className="rounded-md border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary"
              >
                إلغاء
              </button>
              <button
                onClick={saveCompany}
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
