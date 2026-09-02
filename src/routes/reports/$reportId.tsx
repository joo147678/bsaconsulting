import { createFileRoute, Link } from "@tanstack/react-router";
import { Calculator, Download, FileText, ListChecks, PenLine, Printer, Save, StickyNote } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Field, TextAreaField, TextField } from "@/components/Field";
import { FormSection } from "@/components/FormSection";
import { ReportDocument } from "@/components/ReportDocument";
import {
  kindLabel,
  reportCompleteness,
  statusLabel,
  uid,
  useDB,
  type Report,
  type ReportStatus,
} from "@/lib/store";
import { cn } from "@/lib/utils";

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
    if (stored && stored.id !== draft?.id) setDraft(stored);
  }, [stored, draft?.id]);

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

  useEffect(() => {
    if (!draft) return;
    const t = setInterval(() => save(draft), 30000);
    return () => clearInterval(t);
  }, [draft, save]);

  if (!draft) {
    return (
      <AppShell title="المحضر غير موجود">
        <p className="text-muted-foreground">لم يتم العثور على المحضر.</p>
        <Link to="/reports" className="mt-3 inline-block text-primary hover:underline">
          العودة إلى المحاضر
        </Link>
      </AppShell>
    );
  }

  const set = <K extends keyof Report>(key: K, value: Report[K]) => setDraft({ ...draft, [key]: value });
  const pct = reportCompleteness(draft);

  return (
    <AppShell
      flush
      title={kindLabel[draft.kind]}
      subtitle={savedAt ? `آخر حفظ: ${savedAt}` : "لم يتم الحفظ بعد"}
      actions={
        <>
          <select
            className="field-input max-w-40 py-2"
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
          <button type="button" onClick={() => window.print()} className="btn-ghost">
            <Printer className="size-4" />
            طباعة
          </button>
          <button type="button" onClick={() => window.print()} className="btn-ghost hidden sm:inline-flex">
            <Download className="size-4" />
            تحميل PDF
          </button>
          <button type="button" onClick={() => save(draft)} className="btn-primary">
            <Save className="size-4" />
            حفظ
          </button>
          <div className="flex rounded-md border border-border lg:hidden">
            <button
              type="button"
              onClick={() => setMobileView("edit")}
              className={cn("px-3 py-2 text-sm", mobileView === "edit" && "bg-secondary font-semibold")}
            >
              تحرير
            </button>
            <button
              type="button"
              onClick={() => setMobileView("preview")}
              className={cn("px-3 py-2 text-sm", mobileView === "preview" && "bg-secondary font-semibold")}
            >
              معاينة
            </button>
          </div>
        </>
      }
    >
      <div className="flex h-full overflow-hidden">
        <section
          className={cn(
            "no-print relative w-full overflow-y-auto border-l border-border bg-background lg:w-[45%]",
            mobileView === "preview" ? "hidden lg:block" : "block",
          )}
        >
          <div className="sticky top-0 z-10 h-1 w-full bg-secondary">
            <div className="h-1 bg-accent transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex items-center justify-between px-6 pt-5 lg:px-10">
            <span className="text-sm font-bold text-foreground">اكتمال المحضر</span>
            <span className="rounded-md bg-primary-soft px-2 py-0.5 text-sm font-bold text-primary">
              {pct}%
            </span>
          </div>

          <div className="flex flex-col gap-7 p-6 lg:p-10 lg:pt-6">
            <FormSection title="بيانات الاجتماع" icon={FileText}>
              <Field label="الشركة">
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
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <TextField
                  label="تاريخ الانعقاد"
                  type="date"
                  ltr
                  value={draft.meetingDate}
                  onChange={(e) => set("meetingDate", e.target.value)}
                />
                <TextField
                  label="الساعة"
                  type="time"
                  ltr
                  value={draft.meetingTime}
                  onChange={(e) => set("meetingTime", e.target.value)}
                />
                <div className="col-span-2">
                  <TextField
                    label="مكان الانعقاد"
                    value={draft.place}
                    onChange={(e) => set("place", e.target.value)}
                  />
                </div>
                <TextField
                  label="رئيس الاجتماع"
                  value={draft.chairman}
                  onChange={(e) => set("chairman", e.target.value)}
                />
                <TextField
                  label="أمين السر"
                  value={draft.secretary}
                  onChange={(e) => set("secretary", e.target.value)}
                />
                <TextField
                  label="جامع الأصوات"
                  value={draft.scrutineer}
                  onChange={(e) => set("scrutineer", e.target.value)}
                />
                <TextField
                  label="نسبة الحضور (النصاب)"
                  ltr
                  value={draft.quorum}
                  onChange={(e) => set("quorum", e.target.value)}
                />
                <div className="col-span-2">
                  <TextAreaField
                    label="الحاضرون (سطر لكل حاضر)"
                    value={draft.attendees}
                    onChange={(e) => set("attendees", e.target.value)}
                  />
                </div>
              </div>
            </FormSection>

            {draft.kind === "ordinary" ? (
              <FormSection title="جدول الأعمال" icon={ListChecks}>
                {draft.agenda.map((item, i) => (
                  <div key={item.id} className="rounded-lg border border-border bg-muted/60 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-bold text-primary">بند #{i + 1}</span>
                      <button
                        type="button"
                        onClick={() => set("agenda", draft.agenda.filter((x) => x.id !== item.id))}
                        className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-destructive hover:bg-red-50"
                      >
                        حذف
                      </button>
                    </div>
                    <div className="flex flex-col gap-3">
                      <TextField
                        label="عنوان البند"
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
                      <TextAreaField
                        label="المناقشة"
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
                      <TextAreaField
                        label="القرار"
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
                <button
                  type="button"
                  className="btn-dashed"
                  onClick={() =>
                    set("agenda", [
                      ...draft.agenda,
                      { id: uid(), title: "", discussion: "", resolution: "" },
                    ])
                  }
                >
                  إضافة بند
                </button>
              </FormSection>
            ) : (
              <FormSection title="التعديلات (قبل / بعد)" icon={PenLine}>
                {draft.amendments.map((a) => (
                  <div key={a.id} className="rounded-lg border border-border bg-muted/60 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <select
                        className="field-input"
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
                        type="button"
                        onClick={() =>
                          set("amendments", draft.amendments.filter((x) => x.id !== a.id))
                        }
                        className="shrink-0 text-xs font-semibold text-destructive hover:underline"
                      >
                        حذف
                      </button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <TextAreaField
                        label="قبل التعديل"
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
                      <TextAreaField
                        label="بعد التعديل"
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
                <button
                  type="button"
                  className="btn-dashed"
                  onClick={() =>
                    set("amendments", [
                      ...draft.amendments,
                      { id: uid(), subject: "", before: "", after: "" },
                    ])
                  }
                >
                  إضافة تعديل
                </button>
              </FormSection>
            )}

            <FormSection title="ملاحظات" icon={StickyNote} defaultOpen={Boolean(draft.notes)}>
              <TextAreaField
                label="ملاحظات"
                value={draft.notes}
                onChange={(e) => set("notes", e.target.value)}
              />
            </FormSection>

            <div className="rounded-lg bg-stage p-4 text-white">
              <div className="flex items-center justify-between py-1 text-sm">
                <span className="flex items-center gap-2 text-white/70">
                  <Calculator className="size-4" />
                  اكتمال البيانات
                </span>
                <span className="font-semibold">{pct}%</span>
              </div>
              <div className="mt-1 flex items-center justify-between border-t border-white/15 pt-2 text-base">
                <span className="font-bold text-accent">حالة المحضر</span>
                <span className="font-black text-accent">{statusLabel[draft.status]}</span>
              </div>
            </div>
          </div>
        </section>

        <section
          className={cn(
            "print-area hidden w-[55%] overflow-y-auto bg-stage p-8 pt-10 lg:block",
            mobileView === "preview" && "!block w-full lg:w-[55%]",
          )}
        >
          <ReportDocument report={draft} company={company} />
        </section>
      </div>
    </AppShell>
  );
}
