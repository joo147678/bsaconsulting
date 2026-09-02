import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Building2, Files, LayoutDashboard, Menu, Plus, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  emptyReport,
  formatArabicDate,
  kindLabel,
  useDB,
  type ReportKind,
} from "@/lib/store";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "لوحة التحكم", icon: LayoutDashboard, exact: true },
  { to: "/companies", label: "الشركات", icon: Building2, exact: false },
] as const;

export function AppShell({
  title,
  subtitle,
  actions,
  flush,
  children,
}: {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  flush?: boolean;
  children: ReactNode;
}) {
  const { db, update } = useDB();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [kindOpen, setKindOpen] = useState(false);
  const kindRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setSidebarOpen(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const onPointer = (e: PointerEvent) => {
      if (kindRef.current && !kindRef.current.contains(e.target as Node)) {
        setKindOpen(false);
      }
    };
    window.addEventListener("pointerdown", onPointer);
    return () => window.removeEventListener("pointerdown", onPointer);
  }, []);

  const create = (kind: ReportKind) => {
    const report = emptyReport(kind, db.companies[0]?.id ?? "");
    update((d) => ({ ...d, reports: [report, ...d.reports] }));
    setKindOpen(false);
    navigate({ to: "/reports/$reportId", params: { reportId: report.id } });
  };

  const removeReport = (id: string) => {
    update((d) => ({ ...d, reports: d.reports.filter((r) => r.id !== id) }));
    if (pathname === `/reports/${id}`) {
      navigate({ to: "/reports" });
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background font-sans">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="إغلاق القائمة"
          className="no-print fixed inset-0 z-30 bg-foreground/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {sidebarOpen && (
        <aside className="no-print fixed inset-y-0 end-0 z-40 flex w-64 flex-col border-l border-border bg-card lg:static lg:z-auto">
          <Link to="/" className="flex items-center gap-2 border-b border-border px-4 py-4">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground">
              BSA
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-bold text-foreground">نظام محاضر الجمعيات</span>
              <span className="block text-[11px] text-muted-foreground">BSA Consulting</span>
            </span>
          </Link>

          <div className="relative mx-3 mt-3" ref={kindRef}>
            <button type="button" onClick={() => setKindOpen((v) => !v)} className="btn-primary w-full py-2.5">
              <Plus className="size-4" />
              محضر جديد
            </button>
            {kindOpen && (
              <div className="absolute inset-x-0 top-full z-40 mt-1 overflow-hidden rounded-md border border-border bg-card">
                <button
                  type="button"
                  onClick={() => create("ordinary")}
                  className="flex w-full px-3 py-2.5 text-sm font-semibold hover:bg-secondary"
                >
                  جمعية عمومية عادية
                </button>
                <button
                  type="button"
                  onClick={() => create("extraordinary")}
                  className="flex w-full border-t border-border px-3 py-2.5 text-sm font-semibold hover:bg-secondary"
                >
                  جمعية عمومية غير عادية
                </button>
              </div>
            )}
          </div>

          <nav className="mt-3 space-y-1 px-2">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.exact }}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground [&.active]:bg-primary-soft [&.active]:font-semibold [&.active]:text-primary"
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-4 flex items-center gap-1.5 px-4 text-[11px] font-bold tracking-wide text-muted-foreground">
            <Files className="size-3.5" />
            المحاضر المحفوظة
          </div>
          <div className="mt-2 flex-1 space-y-1 overflow-y-auto px-2 pb-4">
            {db.reports.length === 0 && (
              <p className="px-3 py-2 text-xs text-muted-foreground">لا توجد محاضر بعد.</p>
            )}
            {db.reports.map((r) => {
              const active = pathname === `/reports/${r.id}`;
              const company = db.companies.find((c) => c.id === r.companyId)?.name ?? "بدون شركة";
              return (
                <div
                  key={r.id}
                  className={cn(
                    "group flex items-center justify-between rounded-md px-3 py-2.5 text-sm transition-colors",
                    active
                      ? "bg-primary-soft text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  <Link to="/reports/$reportId" params={{ reportId: r.id }} className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{company}</span>
                    <span className="block truncate text-[11px] opacity-80">
                      {kindLabel[r.kind]} · {formatArabicDate(r.meetingDate)}
                    </span>
                  </Link>
                  <button
                    type="button"
                    aria-label="حذف المحضر"
                    onClick={() => removeReport(r.id)}
                    className="opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </aside>
      )}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="no-print flex items-center justify-between border-b border-border bg-card px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen((v) => !v)}
              className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary"
              aria-label={sidebarOpen ? "إخفاء القائمة" : "إظهار القائمة"}
            >
              {sidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold text-foreground">
                {title ?? "نظام محاضر الجمعيات العمومية"}
              </h1>
              {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            </div>
          </div>
          {actions && <div className="flex max-w-[58%] shrink-0 flex-wrap items-center justify-end gap-2">{actions}</div>}
        </header>
        <div className={cn("min-h-0 flex-1", flush ? "overflow-hidden" : "overflow-y-auto p-6 lg:p-10")}>
          {children}
        </div>
      </div>
    </div>
  );
}
