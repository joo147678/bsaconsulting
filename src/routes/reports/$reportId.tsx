import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ReportDocument } from "@/components/ReportDocument";
import {
  kindLabel,
  statusLabel,
  uid,
  useDB,
  type Report,
  type ReportStatus,
} from "@/lib/store";

export const Route = createFileRoute("/reports/$reportId")({
  head: () => ({
    meta: [
      { title: "محرر المحضر | نظام محاضر الجمعيات العمومية" },
      {
        name: "description",
        content: "محرر ثنائي اللوحات مع معاينة مباشرة للمحضر وإمكانية الطباعة والتصدير PDF.",
      },
      { property: "og:title", content: "محرر محضر الجمعية العمومية" },
      { property: "og:description", content: "تحرير المحضر مع معاينة فورية بتنسيق A4." },
    ],
  }),
  component: Builder,
});

function Builder() {
  const { reportId } = Route.useParams();
  const { db, update } = useDB();
  const stored = db.reports.find((r) => r.id === reportId);
  const [draft, setDraft] = useState<Report | null>(stored ?? null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit");

  useEffect(() => {
    if (stored && !draft) setDraft(stored);
  }, [stored, draft]);

  const company = useMemo(
    () => db.companies.find((c) => c.id === draft?.companyId),
    [db.companies, draft?.companyId],
  );

  const save = useMemo(
    () => (next: Report) => {
      update((d) => ({
        ...d,
        reports: d.reports.map((r) =>
          r.id === next.id ? { ...next, updatedAt: new Date().toISOString() } : r,
        ),
      }));
      setSavedAt(new Date().toLocaleTimeString("ar-EG"));
    },
    [update],
  );

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!draft) return;
    const t = setInterval(() => save(draft), 30000);
    return () => clearInterval(t);
  }, [draft, save]);

  if (!draft) {
    return (
      <AppShell>
        <p className="text-muted-foreground">لم يتم العثور على المحضر.</p>
        <Link to="/reports" className="mt-3 inline-block text-primary hover:underline">
          العودة إلى المحاضر
        </Link>
      </AppShell>
    );
  }

  const set = <K extends keyof Report>(key: K, value: Report[K]) =>
    setDraft({ ...draft, [key]: value });

  return (
    <AppShell>
      <div className="no-print flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-panel">
        <div>
          <h1 className="text-lg font-bold">{kindLabel[draft.kind]}</h1>
          <p className="text-xs text-muted-foreground">
            {savedAt ? `آخر حفظ: ${savedAt}` : "لم يتم الحفظ بعد"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="field-input max-w-44"
            value={draft.status}
            onChange={(e) => {
              const next = { ...draft, status: e.target.value as ReportStatus };
              setDraft(next);
              save(next);
            }}
          >
            {(["draft", "review", "approved"] as ReportStatus[]).map((s) => (
              <option key={s} value={s}>
                {statusLabel[s]}
              </option>
            ))}
          </select>
          <button
            onClick={() => save(draft)}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            حفظ
          </button>
          <button
            onClick={() => window.print()}
            className="rounded-md border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary"
          >
            طباعة / PDF
          </button>
          <div className="flex rounded-md border border-border lg:hidden">
            <button
              onClick={() => setMobileView("edit")}
              className={`px-3 py-2 text-sm ${mobileView === "edit" ? "bg-secondary font-semibold" : ""}`}
            >
              تحرير
            </button>
            <button
              onClick={() => setMobileView("preview")}
              className={`px-3 py-2 text-sm ${mobileView === "preview" ? "bg-secondary font-semibold" : ""}`}
            >
              معاينة
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div
          className={`print-area ${mobileView === "preview" ? "block" : "hidden"} max-h-[80vh] overflow-auto rounded-xl bg-muted p-4 lg:sticky lg:top-24 lg:block`}
        >
          <ReportDocument report={draft} company={company} />
        </div>

        <div
          className={`no-print ${mobileView === "edit" ? "block" : "hidden"} space-y-6 lg:block`}
        >
          <section className="rounded-xl border border-border bg-card p-5 shadow-panel">
            <h2 className="mb-4 font-bold">بيانات الاجتماع</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="field-label">الشركة</label>
                <select
                  className="field-input"
                  value={draft.companyId}
                  onChange={(e) => set("companyId", e.target.value)}
                >
                  <option value="">— اختر شركة —</option>
                  {db.companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label">تاريخ الانعقاد</label>
                <input
                  type="date"
                  className="field-input"
                  value={draft.meetingDate}
                  onChange={(e) => set("meetingDate", e.target.value)}
                />
              </div>
              <div>
                <label className="field-label">الساعة</label>
                <input
                  type="time"
                  className="field-input"
                  value={draft.meetingTime}
                  onChange={(e) => set("meetingTime", e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="field-label">مكان الانعقاد</label>
                <input
                  className="field-input"
                  value={draft.place}
                  onChange={(e) => set("place", e.target.value)}
                />
              </div>
              <div>
                <label className="field-label">رئيس الاجتماع</label>
                <input
                  className="field-input"
                  value={draft.chairman}
                  onChange={(e) => set("chairman", e.target.value)}
                />
              </div>
              <div>
                <label className="field-label">أمين السر</label>
                <input
                  className="field-input"
                  value={draft.secretary}
                  onChange={(e) => set("secretary", e.target.value)}
                />
              </div>
              <div>
                <label className="field-label">جامع الأصوات</label>
                <input
                  className="field-input"
                  value={draft.scrutineer}
                  onChange={(e) => set("scrutineer", e.target.value)}
                />
              </div>
              <div>
                <label className="field-label">نسبة الحضور (النصاب)</label>
                <input
                  className="field-input"
                  value={draft.quorum}
                  onChange={(e) => set("quorum", e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="field-label">الحاضرون (سطر لكل حاضر)</label>
                <textarea
                  className="field-input min-h-24"
                  value={draft.attendees}
                  onChange={(e) => set("attendees", e.target.value)}
                />
              </div>
            </div>
          </section>

          {draft.kind === "ordinary" ? (
            <section className="rounded-xl border border-border bg-card p-5 shadow-panel">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-bold">جدول الأعمال</h2>
                <button
                  onClick={() =>
                    set("agenda", [
                      ...draft.agenda,
                      { id: uid(), title: "", discussion: "", resolution: "" },
                    ])
                  }
                  className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary"
                >
                  إضافة بند
                </button>
              </div>
              <div className="space-y-5">
                {draft.agenda.map((item, i) => (
                  <div key={item.id} className="rounded-lg border border-border p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-semibold">البند {i + 1}</span>
                      <button
                        onClick={() =>
                          set(
                            "agenda",
                            draft.agenda.filter((x) => x.id !== item.id),
                          )
                        }
                        className="text-xs font-semibold text-destructive hover:underline"
                      >
                        حذف
                      </button>
                    </div>
                    <div className="space-y-3">
                      <input
                        className="field-input"
                        placeholder="عنوان البند"
                        value={item.title}
                        onChange={(e) =>
                          set(
                            "agenda",
                            draft.agenda.map((x) =>
                              x.id === item.id ? { ...x, title: e.target.value } : x,
                            ),
                          )
                        }
                      />
                      <textarea
                        className="field-input min-h-20"
                        placeholder="المناقشة"
                        value={item.discussion}
                        onChange={(e) =>
                          set(
                            "agenda",
                            draft.agenda.map((x) =>
                              x.id === item.id ? { ...x, discussion: e.target.value } : x,
                            ),
                          )
                        }
                      />
                      <textarea
                        className="field-input min-h-16"
                        placeholder="القرار"
                        value={item.resolution}
                        onChange={(e) =>
                          set(
                            "agenda",
                            draft.agenda.map((x) =>
                              x.id === item.id ? { ...x, resolution: e.target.value } : x,
                            ),
                          )
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : (
            <section className="rounded-xl border border-border bg-card p-5 shadow-panel">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-bold">التعديلات (قبل / بعد)</h2>
                <button
                  onClick={() =>
                    set("amendments", [
                      ...draft.amendments,
                      { id: uid(), subject: "", before: "", after: "" },
                    ])
                  }
                  className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary"
                >
                  إضافة تعديل
                </button>
              </div>
              <div className="space-y-5">
                {draft.amendments.map((a) => (
                  <div key={a.id} className="rounded-lg border border-border p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <select
                        className="field-input max-w-60"
                        value={a.subject}
                        onChange={(e) =>
                          set(
                            "amendments",
                            draft.amendments.map((x) =>
                              x.id === a.id ? { ...x, subject: e.target.value } : x,
                            ),
                          )
                        }
                      >
                        <option value="">— بند التعديل —</option>
                        {[
                          "المركز الرئيسي",
                          "غرض الشركة",
                          "زيادة رأس المال",
                          "تخفيض رأس المال",
                          "دخول شريك",
                          "خروج شريك",
                          "إعادة توزيع الحصص",
                          "اسم الشركة",
                        ].map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() =>
                          set(
                            "amendments",
                            draft.amendments.filter((x) => x.id !== a.id),
                          )
                        }
                        className="text-xs font-semibold text-destructive hover:underline"
                      >
                        حذف
                      </button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <textarea
                        className="field-input min-h-20"
                        placeholder="قبل التعديل"
                        value={a.before}
                        onChange={(e) =>
                          set(
                            "amendments",
                            draft.amendments.map((x) =>
                              x.id === a.id ? { ...x, before: e.target.value } : x,
                            ),
                          )
                        }
                      />
                      <textarea
                        className="field-input min-h-20"
                        placeholder="بعد التعديل"
                        value={a.after}
                        onChange={(e) =>
                          set(
                            "amendments",
                            draft.amendments.map((x) =>
                              x.id === a.id ? { ...x, after: e.target.value } : x,
                            ),
                          )
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-xl border border-border bg-card p-5 shadow-panel">
            <label className="field-label">ملاحظات</label>
            <textarea
              className="field-input min-h-20"
              value={draft.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
          </section>
        </div>
      </div>
    </AppShell>
  );
}
