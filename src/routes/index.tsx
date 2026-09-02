import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { formatArabicDate, kindLabel, statusLabel, useDB } from "@/lib/store";

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

function Dashboard() {
  const { db } = useDB();
  const stats = [
    { label: "الشركات", value: db.companies.length },
    { label: "المسودات", value: db.reports.filter((r) => r.status === "draft").length },
    { label: "قيد المراجعة", value: db.reports.filter((r) => r.status === "review").length },
    { label: "المعتمدة", value: db.reports.filter((r) => r.status === "approved").length },
  ];

  return (
    <AppShell title="لوحة التحكم" subtitle="نظرة عامة على الشركات ومحاضر الجمعيات العمومية.">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="mt-2 text-3xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-lg font-semibold">أحدث المحاضر</h2>
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
            {db.reports.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-muted-foreground">
                  لا توجد محاضر بعد.
                </td>
              </tr>
            )}
            {db.reports.map((r) => (
              <tr key={r.id} className="border-t border-border hover:bg-muted">
                <td className="p-3">
                  <Link
                    to="/reports/$reportId"
                    params={{ reportId: r.id }}
                    className="font-semibold text-primary hover:underline"
                  >
                    {db.companies.find((c) => c.id === r.companyId)?.name ?? "—"}
                  </Link>
                </td>
                <td className="p-3">{kindLabel[r.kind]}</td>
                <td className="p-3">{formatArabicDate(r.meetingDate)}</td>
                <td className="p-3">{statusLabel[r.status]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
