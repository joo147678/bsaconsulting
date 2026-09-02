import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Plus } from "lucide-react";
import { openCompany } from "@/components/CreateFlow";
import { AppShell } from "@/components/AppShell";
import { OnboardingCard } from "@/components/OnboardingCard";
import { companyLabel, loadDemoData, missingDemo, useDB } from "@/lib/store";

export const Route = createFileRoute("/companies/")({
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
  const { db } = useDB();

  return (
    <AppShell
      title="الشركات"
      subtitle="اضغط بطاقة الشركة لفتح ملفها ومحاضرها."
      actions={
        <>
          {missingDemo(db) && (
            <button type="button" onClick={loadDemoData} className="btn-ghost">
              إظهار شركات النموذج
            </button>
          )}
          <button
            type="button"
            onClick={() => openCompany({ thenReport: true, onboard: db.companies.length === 0 })}
            className="btn-primary"
          >
            <Plus className="size-4" />
            إضافة شركة
          </button>
        </>
      }
    >
      {db.companies.length === 0 ? (
        <OnboardingCard
          onAddCompany={() => openCompany({ thenReport: true, onboard: true })}
          onLoadDemo={loadDemoData}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {db.companies.map((c) => {
            const minutes = db.reports.filter((r) => r.companyId === c.id);
            return (
              <Link
                key={c.id}
                to="/companies/$companyId"
                params={{ companyId: c.id }}
                className="group block cursor-pointer rounded-lg border border-border bg-card p-5 text-start transition-colors hover:border-primary hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-bold group-hover:text-primary">{companyLabel(c)}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{c.legalForm}</p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary">
                    فتح
                    <ChevronLeft className="size-4" />
                  </span>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <dt className="text-muted-foreground">السجل التجاري</dt>
                    <dd dir="ltr">{c.commercialRegister || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">المحاضر</dt>
                    <dd className="font-semibold">{minutes.length}</dd>
                  </div>
                </dl>
                <p className="mt-4 text-xs text-muted-foreground">
                  {minutes.length === 0
                    ? "لا توجد محاضر بعد — افتح الشركة لإنشاء محضر."
                    : "افتح الشركة لعرض كل المحاضر والتعديل."}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
