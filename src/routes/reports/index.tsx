import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { emptyReport, formatArabicDate, kindLabel, statusLabel, useDB } from "@/lib/store";

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
  const { db, update } = useDB();
  const navigate = useNavigate();

  const create = (kind: "ordinary" | "extraordinary") => {
    const companyId = db.companies[0]?.id ?? "";
    const report = emptyReport(kind, companyId);
    update((d) => ({ ...d, reports: [report, ...d.reports] }));
    navigate({ to: "/reports/$reportId", params: { reportId: report.id } });
  };

  return (
    <AppShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">المحاضر</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            أنشئ محضرًا جديدًا أو تابع المحاضر القائمة.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => create("ordinary")}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            محضر جمعية عادية
          </button>
          <button
            onClick={() => create("extraordinary")}
            className="rounded-md border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-secondary"
          >
            محضر جمعية غير عادية
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {db.reports.map((r) => (
          <Link
            key={r.id}
            to="/reports/$reportId"
            params={{ reportId: r.id }}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-panel transition-colors hover:border-primary"
          >
            <div>
              <p className="font-semibold">
                {db.companies.find((c) => c.id === r.companyId)?.name ?? "بدون شركة"}
              </p>
              <p className="text-sm text-muted-foreground">
                {kindLabel[r.kind]} · {formatArabicDate(r.meetingDate)}
              </p>
            </div>
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold">
              {statusLabel[r.status]}
            </span>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
