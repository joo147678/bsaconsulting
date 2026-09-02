import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { formatArabicDate, kindLabel, statusLabel, useDB } from "@/lib/store";

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
    <AppShell title="المحاضر" subtitle="افتح محضرًا من القائمة أو أنشئ محضرًا جديدًا من الشريط الجانبي.">
      <div className="space-y-2">
        {db.reports.length === 0 && (
          <p className="rounded-lg border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            لا توجد محاضر بعد. استخدم «محضر جديد» في الشريط الجانبي.
          </p>
        )}
        {db.reports.map((r) => (
          <Link
            key={r.id}
            to="/reports/$reportId"
            params={{ reportId: r.id }}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary"
          >
            <div>
              <p className="font-semibold">
                {db.companies.find((c) => c.id === r.companyId)?.name ?? "بدون شركة"}
              </p>
              <p className="text-sm text-muted-foreground">
                {kindLabel[r.kind]} · {formatArabicDate(r.meetingDate)}
              </p>
            </div>
            <span className="rounded-md bg-secondary px-3 py-1 text-xs font-semibold">
              {statusLabel[r.status]}
            </span>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
