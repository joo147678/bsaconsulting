import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Building2, CheckCircle2, ClipboardList, Eye, Send } from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { openCompany, openReport } from "@/components/CreateFlow";
import { OnboardingCard } from "@/components/OnboardingCard";
import { StatusBadge, statusTone } from "@/components/StatusBadge";
import { useSession } from "@/lib/session";
import {
  companyLabel,
  displayStatus,
  displayStatusLabel,
  formatArabicDate,
  kindShortLabel,
  loadDemoData,
  useDB,
  type DisplayStatus,
} from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "لوحة التحكم | نظام محاضر الجمعيات العمومية" },
      {
        name: "description",
        content:
          "نظام عربي لإعداد ومراجعة وأرشفة محاضر الجمعيات العمومية العادية وغير العادية للشركات.",
      },
      { property: "og:title", content: "نظام محاضر الجمعيات العمومية | BSA Consulting" },
      {
        property: "og:description",
        content: "إعداد محاضر الجمعيات العمومية بمعاينة مباشرة وطباعة احترافية.",
      },
    ],
  }),
  component: Dashboard,
});

const FILTERS: { key: DisplayStatus; label: string; hint: string; icon: typeof ClipboardList }[] = [
  { key: "draft", label: "مسودات", hint: "قيد الإعداد", icon: ClipboardList },
  { key: "waiting", label: "بانتظار المشرف", hint: "أُرسلت للمراجعة", icon: Send },
  { key: "review", label: "قيد المراجعة", hint: "المشرف يراجع", icon: Eye },
  { key: "approved", label: "معتمدة", hint: "جاهزة للطباعة", icon: CheckCircle2 },
];

function Dashboard() {
  const { db } = useDB();
  const { isSupervisor } = useSession();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<DisplayStatus | "all">("all");

  const counts = useMemo(() => {
    const next: Record<DisplayStatus, number> = { draft: 0, waiting: 0, review: 0, approved: 0 };
    for (const report of db.reports) next[displayStatus(report)] += 1;
    return next;
  }, [db.reports]);

  const rows = useMemo(() => {
    const list = [...db.reports].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
    if (filter === "all") return list;
    return list.filter((r) => displayStatus(r) === filter);
  }, [db.reports, filter]);

  return (
    <AppShell
      title="لوحة التحكم"
      subtitle={
        isSupervisor ? "راجع المحاضر وأضف المحاسبين من الفريق." : "شركة ← محضر ← مراجعة المشرف ← اعتماد."
      }
    >
      {db.companies.length === 0 ? (
        <OnboardingCard
          onAddCompany={() => openCompany({ thenReport: true, onboard: true })}
          onLoadDemo={loadDemoData}
        />
      ) : (
        <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Building2 className="size-4" />
          <Link to="/companies" className="font-semibold text-foreground hover:text-primary">
            {db.companies.length} شركات
          </Link>
          <span>·</span>
          <span>{db.reports.length} محاضر</span>
          <span>·</span>
          <Link to="/team" className="hover:text-primary">
            {db.accountants.length} محاسبون
          </Link>
        </div>
        {db.reports.length === 0 && (
          <button type="button" onClick={() => openReport()} className="btn-primary py-2 text-sm">
            إنشاء محضر
          </button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {FILTERS.map((s) => {
          const active = filter === s.key;
          const Icon = s.icon;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => setFilter((prev) => (prev === s.key ? "all" : s.key))}
              className={cn(
                "rounded-lg border border-border border-s-4 p-4 text-start transition-shadow hover:shadow-sm cursor-pointer",
                statusTone[s.key].card,
                active && "ring-2 ring-ring",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold">{s.label}</p>
                <Icon className={cn("size-4", statusTone[s.key].value)} />
              </div>
              <p className={cn("mt-2 text-3xl font-bold tabular-nums", statusTone[s.key].value)}>
                {counts[s.key]}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">{s.hint}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-10 flex items-end justify-between gap-3">
        <h2 className="text-lg font-semibold">
          {filter === "all" ? "أحدث المحاضر" : displayStatusLabel[filter]}
        </h2>
        {filter !== "all" && (
          <button type="button" onClick={() => setFilter("all")} className="text-xs font-semibold text-primary">
            عرض الكل
          </button>
        )}
      </div>
      <div className="mt-3 overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full text-start text-sm">
          <thead className="bg-secondary text-secondary-foreground">
            <tr>
              <th className="p-3 font-semibold">الشركة</th>
              <th className="p-3 font-semibold">النوع</th>
              <th className="p-3 font-semibold">تاريخ الانعقاد</th>
              <th className="p-3 font-semibold">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-muted-foreground">
                  {db.reports.length === 0 ? (
                    <button type="button" onClick={() => openReport()} className="font-semibold text-primary">
                      لا توجد محاضر بعد — أنشئ محضرًا لهذه الشركة
                    </button>
                  ) : (
                    "لا توجد محاضر في هذه الحالة."
                  )}
                </td>
              </tr>
            )}
            {rows.map((r) => {
              const status = displayStatus(r);
              const company = db.companies.find((c) => c.id === r.companyId);
              return (
                <tr
                  key={r.id}
                  className="cursor-pointer border-t border-border hover:bg-muted"
                  onClick={() =>
                    navigate({
                      to: "/reports/$reportId",
                      params: { reportId: r.id },
                      search: isSupervisor ? { view: "supervisor" } : {},
                    })
                  }
                >
                  <td className="p-3">
                    <div className="flex items-center gap-3 font-semibold">
                      <span className={cn("h-8 w-1 shrink-0 rounded-full", statusTone[status].bar)} />
                      <span className="truncate">{companyLabel(company)}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap p-3 text-muted-foreground">{kindShortLabel[r.kind]}</td>
                  <td className="whitespace-nowrap p-3">{formatArabicDate(r.meetingDate)}</td>
                  <td className="p-3">
                    <StatusBadge report={r} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
        </>
      )}
    </AppShell>
  );
}
