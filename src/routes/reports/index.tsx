import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { openCompany, openReport } from "@/components/CreateFlow";
import { OnboardingCard } from "@/components/OnboardingCard";
import { StatusBadge } from "@/components/StatusBadge";
import { formatArabicDate, kindLabel, loadDemoData, useDB } from "@/lib/store";

export const Route = createFileRoute("/reports/")({
  head: () => ({
    meta: [
      { title: "المحاضر | نظام محاضر الجمعيات العمومية" },
      { name: "description", content: "قائمة محاضر الجمعيات العمومية العادية وغير العادية وحالتها." },
      { property: "og:title", content: "محاضر الجمعيات العمومية" },
      { property: "og:description", content: "إنشاء ومتابعة محاضر الجمعيات العادية وغير العادية." },
    ],
  }),
  component: Reports,
});

function Reports() {
  const { db } = useDB();

  return (
    <AppShell title="المحاضر" subtitle="كل محضر مرتبط بشركة. ابدأ بالشركة إن لم تُضف بعد.">
      {db.companies.length === 0 ? (
        <OnboardingCard
          onAddCompany={() => openCompany({ thenReport: true, onboard: true })}
          onLoadDemo={loadDemoData}
        />
      ) : (
      <div className="space-y-6">
        {db.reports.length === 0 && (
          <p className="rounded-lg border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            لا توجد محاضر بعد.{" "}
            <button type="button" onClick={() => openReport()} className="font-semibold text-primary">
              أنشئ محضرًا
            </button>
          </p>
        )}
        {db.companies.map((company) => {
          const items = db.reports.filter((r) => r.companyId === company.id);
          if (items.length === 0) return null;
          return (
            <section key={company.id}>
              <h2 className="mb-2">
                <Link
                  to="/companies/$companyId"
                  params={{ companyId: company.id }}
                  className="text-sm font-bold hover:text-primary"
                >
                  {company.name}
                </Link>
              </h2>
              <div className="space-y-2">
                {items.map((r) => (
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
            </section>
          );
        })}
      </div>
      )}
    </AppShell>
  );
}
