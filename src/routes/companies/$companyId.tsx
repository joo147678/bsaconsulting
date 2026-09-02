import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Plus } from "lucide-react";
import { openCompany, openReport } from "@/components/CreateFlow";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { companyLabel, formatArabicDate, kindLabel, useDB } from "@/lib/store";

export const Route = createFileRoute("/companies/$companyId")({
  head: () => ({
    meta: [
      { title: "ملف الشركة | نظام محاضر الجمعيات العمومية" },
      { name: "description", content: "بيانات الشركة ومحاضر الجمعيات المرتبطة بها." },
    ],
  }),
  component: CompanyFile,
});

function CompanyFile() {
  const { companyId } = Route.useParams();
  const { db } = useDB();
  const company = db.companies.find((c) => c.id === companyId);
  const minutes = db.reports
    .filter((r) => r.companyId === companyId)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  if (!company) {
    return (
      <AppShell title="الشركة غير موجودة">
        <p className="text-muted-foreground">لم يتم العثور على هذه الشركة.</p>
        <Link to="/companies" className="mt-3 inline-block text-primary hover:underline">
          العودة إلى الشركات
        </Link>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={companyLabel(company)}
      subtitle={company.legalForm}
      actions={
        <>
          <button
            type="button"
            onClick={() => openCompany({ company, thenReport: false })}
            className="btn-ghost"
          >
            تعديل البيانات
          </button>
          <button type="button" onClick={() => openReport({ companyId: company.id })} className="btn-primary">
            <Plus className="size-4" />
            محضر جديد
          </button>
        </>
      }
    >
      <Link to="/companies" className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-primary">
        <ChevronRight className="size-4" />
        كل الشركات
      </Link>

      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="text-sm font-bold">بيانات الشركة</h2>
        <p className="mt-1 text-sm text-muted-foreground">{company.name}</p>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
          <div>
            <dt className="text-muted-foreground">السجل التجاري</dt>
            <dd dir="ltr">{company.commercialRegister || "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">البطاقة الضريبية</dt>
            <dd dir="ltr">{company.taxId || "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">رأس المال</dt>
            <dd>{company.capital || "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">عدد الشركاء</dt>
            <dd>{company.partners.length}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground">المركز الرئيسي</dt>
            <dd>{company.address || "—"}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-end justify-between gap-3">
          <h2 className="text-lg font-semibold">المحاضر</h2>
          <span className="text-sm text-muted-foreground">{minutes.length}</span>
        </div>
        {minutes.length === 0 ? (
          <button
            type="button"
            onClick={() => openReport({ companyId: company.id })}
            className="w-full rounded-lg border border-dashed border-border bg-card p-6 text-center text-sm font-semibold text-primary"
          >
            لا توجد محاضر بعد — أنشئ محضرًا لهذه الشركة
          </button>
        ) : (
          <div className="space-y-2">
            {minutes.map((r) => (
              <Link
                key={r.id}
                to="/reports/$reportId"
                params={{ reportId: r.id }}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary"
              >
                <div>
                  <p className="font-semibold">{kindLabel[r.kind]}</p>
                  <p className="text-sm text-muted-foreground">{formatArabicDate(r.meetingDate)}</p>
                </div>
                <StatusBadge report={r} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
