import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Files,
  LayoutDashboard,
  Menu,
  Plus,
  Trash2,
  UserCog,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { statusTone } from "@/components/StatusBadge";
import { CreateFlowHost, openReport } from "@/components/CreateFlow";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useSession, type SessionRole } from "@/lib/session";
import {
  companyLabel,
  displayStatus,
  displayStatusLabel,
  kindShortLabel,
  useDB,
  type DisplayStatus,
} from "@/lib/store";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "لوحة التحكم", icon: LayoutDashboard, exact: true },
  { to: "/companies", label: "الشركات", icon: Building2, exact: false },
  { to: "/team", label: "الفريق", icon: Users, exact: false },
] as const;

const WORKFLOW: DisplayStatus[] = ["draft", "waiting", "review", "approved"];
const SIDEBAR_KEY = "bsa-sidebar-expanded";

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
  const { isSupervisor, setRole } = useSession();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const sidebarHydrated = useRef(false);

  useEffect(() => {
    if (!sidebarHydrated.current) {
      sidebarHydrated.current = true;
      setExpanded(window.localStorage.getItem(SIDEBAR_KEY) !== "0");
      return;
    }
    window.localStorage.setItem(SIDEBAR_KEY, expanded ? "1" : "0");
  }, [expanded]);

  const grouped = useMemo(() => {
    const buckets = Object.fromEntries(WORKFLOW.map((s) => [s, [] as typeof db.reports])) as Record<
      DisplayStatus,
      typeof db.reports
    >;
    for (const report of db.reports) {
      buckets[displayStatus(report)].push(report);
    }
    return buckets;
  }, [db.reports]);

  const startReport = () => {
    setMobileOpen(false);
    openReport({ onboard: db.companies.length === 0 });
  };

  const switchRole = (next: SessionRole) => {
    setRole(next);
    setMobileOpen(false);
    const match = pathname.match(/^\/reports\/([^/]+)$/);
    if (match) {
      navigate({
        to: "/reports/$reportId",
        params: { reportId: match[1] },
        search: next === "supervisor" ? { view: "supervisor" } : {},
      });
    }
  };

  const removeReport = (id: string) => {
    update((d) => ({ ...d, reports: d.reports.filter((r) => r.id !== id) }));
    if (pathname === `/reports/${id}`) {
      navigate({ to: "/reports" });
    }
  };

  const wide = expanded || mobileOpen;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background font-sans">
      <CreateFlowHost />
      {mobileOpen && (
        <button
          type="button"
          aria-label="إغلاق القائمة"
          className="no-print fixed inset-0 z-30 bg-foreground/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <TooltipProvider delayDuration={200}>
        <aside
          className={cn(
            "no-print z-40 flex shrink-0 flex-col border-l border-border bg-card transition-[width] duration-200",
            "fixed inset-y-0 end-0 lg:static lg:z-auto",
            wide ? "w-72" : "w-[4.5rem]",
            mobileOpen ? "flex" : "hidden lg:flex",
          )}
        >
          <div className={cn("flex items-center border-b border-border", wide ? "gap-2 px-3 py-3" : "flex-col gap-2 px-2 py-3")}>
            <Link
              to="/"
              className={cn("flex min-w-0 items-center gap-2", wide ? "flex-1" : "justify-center")}
              onClick={() => setMobileOpen(false)}
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-[11px] font-bold text-primary-foreground">
                BSA
              </span>
              {wide && (
                <span className="min-w-0 leading-tight">
                  <span className="block truncate text-sm font-bold text-foreground">نظام المحاضر</span>
                  <span className="block text-[11px] text-muted-foreground">BSA Consulting</span>
                </span>
              )}
            </Link>
            <button
              type="button"
              className="hidden rounded-md p-1.5 text-muted-foreground hover:bg-secondary lg:inline-flex"
              aria-label={expanded ? "طي القائمة" : "توسيع القائمة"}
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
            </button>
          </div>

          <div className={cn("relative mt-3", wide ? "mx-3" : "mx-2")}>
            {wide ? (
              <button type="button" onClick={startReport} className="btn-primary w-full py-2.5">
                <Plus className="size-4" />
                {db.companies.length === 0 ? "ابدأ بشركة" : "محضر جديد"}
              </button>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={startReport}
                    className="btn-primary w-full px-0 py-2.5"
                    aria-label={db.companies.length === 0 ? "ابدأ بشركة" : "محضر جديد"}
                  >
                    <Plus className="size-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  {db.companies.length === 0 ? "أضف شركة أولًا" : "محضر جديد"}
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          <nav className={cn("mt-3 space-y-1", wide ? "px-2" : "px-1.5")}>
            {nav.map((item) => {
              const link = (
                <Link
                  to={item.to}
                  activeOptions={{ exact: item.exact }}
                  aria-label={item.label}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center rounded-md text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground [&.active]:bg-primary-soft [&.active]:font-semibold [&.active]:text-primary",
                    wide ? "gap-2 px-3 py-2" : "justify-center px-0 py-2.5",
                  )}
                >
                  <item.icon className="size-4 shrink-0" />
                  {wide && item.label}
                </Link>
              );
              if (wide) {
                return (
                  <div key={item.to}>{link}</div>
                );
              }
              return (
                <Tooltip key={item.to}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="left">{item.label}</TooltipContent>
                </Tooltip>
              );
            })}
          </nav>

          {wide ? (
            <div className="mt-4 flex min-h-0 flex-1 flex-col">
              <div className="flex items-center justify-between px-4">
                <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-muted-foreground">
                  <Files className="size-3.5" />
                  المحاضر حسب الحالة
                </div>
                <span className="text-[11px] text-muted-foreground">{db.reports.length}</span>
              </div>
              <div className="mt-2 flex-1 space-y-2 overflow-y-auto px-2 pb-4">
                {db.companies.length === 0 ? (
                  <p className="px-2 text-xs leading-6 text-muted-foreground">
                    ابدأ بإضافة شركة. بعدها يظهر هنا محضرها حسب الحالة.
                  </p>
                ) : (
                  WORKFLOW.map((status) => {
                  const items = grouped[status];
                  return (
                    <section
                      key={status}
                      className={cn("rounded-lg border border-border border-s-4 p-2", statusTone[status].card)}
                    >
                      <div className="mb-1 flex items-center gap-2 px-1">
                        <span className={cn("size-1.5 rounded-full", statusTone[status].dot)} />
                        <span className="text-[11px] font-bold">{displayStatusLabel[status]}</span>
                        <span className="ms-auto text-[11px] tabular-nums text-muted-foreground">
                          {items.length}
                        </span>
                      </div>
                      {items.length === 0 && (
                        <p className="px-1 pb-0.5 text-[11px] text-muted-foreground/70">لا يوجد</p>
                      )}
                      {items.map((r) => {
                        const active = pathname === `/reports/${r.id}`;
                        const company = db.companies.find((c) => c.id === r.companyId);
                        return (
                          <div
                            key={r.id}
                            className={cn(
                              "group flex items-center justify-between rounded-md px-1.5 py-1.5 text-sm transition-colors",
                              active ? "bg-card text-primary shadow-sm" : "text-foreground hover:bg-card/80",
                            )}
                          >
                            <Link
                              to="/reports/$reportId"
                              params={{ reportId: r.id }}
                              search={isSupervisor ? { view: "supervisor" } : {}}
                              onClick={() => setMobileOpen(false)}
                              className="min-w-0 flex-1"
                            >
                              <span className="block truncate font-medium">{companyLabel(company)}</span>
                              <span className="block truncate text-[11px] text-muted-foreground">
                                {kindShortLabel[r.kind]}
                              </span>
                            </Link>
                            <button
                              type="button"
                              aria-label="حذف المحضر"
                              onClick={() => removeReport(r.id)}
                              className="opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </section>
                  );
                })
                )}
              </div>
            </div>
          ) : (
            <div className="mt-4 flex min-h-0 flex-1 flex-col items-center gap-2 overflow-y-auto px-1.5 pb-4">
              <div className="flex w-full flex-col items-center gap-1 rounded-lg border border-border bg-secondary/60 py-2">
                {WORKFLOW.map((status) => (
                  <Tooltip key={status}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => setExpanded(true)}
                        className={cn(
                          "flex w-10 flex-col items-center gap-0.5 rounded-md py-1 hover:bg-card",
                          grouped[status].some((r) => pathname === `/reports/${r.id}`) && "bg-card shadow-sm",
                        )}
                        aria-label={`${displayStatusLabel[status]}: ${grouped[status].length}`}
                      >
                        <span className={cn("size-2.5 rounded-full", statusTone[status].dot)} />
                        <span className="text-[10px] font-bold tabular-nums leading-none">
                          {grouped[status].length}
                        </span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      {displayStatusLabel[status]} — اضغط للتوسيع
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          )}

          <div className={cn("mt-auto shrink-0 border-t border-border", wide ? "p-3" : "p-1.5")}>
            {wide ? (
              <div>
                <p className="px-1 text-[11px] font-bold tracking-wide text-muted-foreground">الدور الحالي</p>
                <p className="mt-1 px-1 text-sm font-semibold">{isSupervisor ? "مشرف" : "محاسب"}</p>
                <button
                  type="button"
                  onClick={() => switchRole(isSupervisor ? "accountant" : "supervisor")}
                  className="btn-ghost mt-2 w-full py-2 text-xs"
                >
                  {isSupervisor ? "التبديل إلى محاسب" : "التبديل إلى مشرف"}
                </button>
              </div>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => switchRole(isSupervisor ? "accountant" : "supervisor")}
                    className="flex w-full flex-col items-center rounded-md py-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    aria-label={isSupervisor ? "التبديل إلى محاسب" : "التبديل إلى مشرف"}
                  >
                    <UserCog className="size-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  {isSupervisor ? "مشرف — اضغط للتبديل إلى محاسب" : "محاسب — اضغط للتبديل إلى مشرف"}
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </aside>
      </TooltipProvider>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="no-print flex items-center justify-between border-b border-border bg-card px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary lg:hidden"
              aria-label={mobileOpen ? "إخفاء القائمة" : "إظهار القائمة"}
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold text-foreground">
                {title ?? "نظام محاضر الجمعيات العمومية"}
              </h1>
              {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            </div>
          </div>
          {actions && (
            <div className="flex max-w-[58%] shrink-0 flex-wrap items-center justify-end gap-2">{actions}</div>
          )}
        </header>
        <div className={cn("min-h-0 flex-1", flush ? "overflow-hidden" : "overflow-y-auto p-6 lg:p-10")}>
          {children}
        </div>
      </div>
    </div>
  );
}
