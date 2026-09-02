import { useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CompanyForm } from "@/components/CompanyForm";
import {
  companyLabel,
  emptyCompany,
  reportFromCompany,
  useDB,
  type Company,
  type ReportKind,
} from "@/lib/store";
import { cn } from "@/lib/utils";

type Mode =
  | { type: "company"; thenReport: boolean; onboard: boolean; backTo?: "report"; returnCompanyId?: string }
  | { type: "report"; companyId?: string; onboard: boolean };

type Request =
  | { type: "company"; thenReport: boolean; onboard: boolean; company?: Company }
  | { type: "report"; companyId?: string; onboard: boolean };

const EVENT = "bsa-create-flow";
let pending: Request | null = null;

function send(request: Request) {
  pending = request;
  window.dispatchEvent(new CustomEvent<Request>(EVENT, { detail: request }));
}

export function openCompany(opts?: { thenReport?: boolean; onboard?: boolean; company?: Company }) {
  send({
    type: "company",
    thenReport: opts?.thenReport ?? !opts?.company,
    onboard: opts?.onboard ?? false,
    company: opts?.company,
  });
}

export function openReport(opts?: { companyId?: string; onboard?: boolean }) {
  send({ type: "report", companyId: opts?.companyId, onboard: opts?.onboard ?? false });
}

export function CreateFlowHost() {
  const { db, update } = useDB();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode | null>(null);
  const [draft, setDraft] = useState<Company | null>(null);
  const dbRef = useRef(db);
  dbRef.current = db;

  useEffect(() => {
    const apply = (request: Request) => {
      pending = null;
      const companies = dbRef.current.companies;
      if (request.type === "company") {
        setDraft(request.company ?? emptyCompany());
        setMode({ type: "company", thenReport: request.thenReport, onboard: request.onboard });
        return;
      }
      if (companies.length === 0) {
        setDraft(emptyCompany());
        setMode({ type: "company", thenReport: true, onboard: true });
        return;
      }
      setMode({
        type: "report",
        companyId: request.companyId ?? (companies.length === 1 ? companies[0].id : undefined),
        onboard: request.onboard,
      });
    };

    const onOpen = (event: Event) => apply((event as CustomEvent<Request>).detail);
    window.addEventListener(EVENT, onOpen);
    if (pending) apply(pending);
    return () => window.removeEventListener(EVENT, onOpen);
  }, []);

  const saveCompany = () => {
    if (!draft?.name.trim() || mode?.type !== "company") return;
    const next = {
      ...draft,
      name: draft.name.trim(),
      shortName: draft.shortName.trim() || draft.name.trim(),
    };
    update((d) => ({
      ...d,
      companies: d.companies.some((c) => c.id === next.id)
        ? d.companies.map((c) => (c.id === next.id ? next : c))
        : [...d.companies, next],
    }));
    if (mode.thenReport) {
      setDraft(next);
      setMode({ type: "report", companyId: next.id, onboard: mode.onboard });
      return;
    }
    setDraft(null);
    setMode(null);
  };

  const createReport = (kind: ReportKind, companyId: string) => {
    const company =
      db.companies.find((c) => c.id === companyId) ?? (draft?.id === companyId ? draft : undefined);
    if (!company) return;
    const report = reportFromCompany(kind, company);
    update((d) => ({ ...d, reports: [report, ...d.reports] }));
    setDraft(null);
    setMode(null);
    navigate({ to: "/reports/$reportId", params: { reportId: report.id } });
  };

  const companiesForPicker =
    mode?.type === "report" && draft && !db.companies.some((c) => c.id === draft.id)
      ? [...db.companies, draft]
      : db.companies;

  const cancelCompany = () => {
    if (mode?.type === "company" && mode.backTo === "report") {
      setDraft(null);
      setMode({ type: "report", companyId: mode.returnCompanyId, onboard: false });
      return;
    }
    setDraft(null);
    setMode(null);
  };

  const addCompanyFromReport = () => {
    if (mode?.type !== "report") return;
    setDraft(emptyCompany());
    setMode({
      type: "company",
      thenReport: true,
      onboard: false,
      backTo: "report",
      returnCompanyId: mode.companyId,
    });
  };

  return (
    <>
      {mode?.type === "company" && draft && (
        <CompanyForm
          company={draft}
          onChange={setDraft}
          onCancel={cancelCompany}
          onSave={saveCompany}
          cancelLabel={mode.backTo === "report" ? "رجوع" : "إلغاء"}
          stepLabel={
            mode.backTo === "report"
              ? "محضر جديد — أضف الشركة أولًا"
              : mode.onboard
                ? "الخطوة 1 من 2 — الشركة"
                : mode.thenReport
                  ? "أولًا: الشركة"
                  : undefined
          }
        />
      )}
      {mode?.type === "report" && (
        <ReportKindDialog
          companies={companiesForPicker}
          companyId={mode.companyId}
          onboard={mode.onboard}
          onSelectCompany={(id) => setMode({ ...mode, companyId: id })}
          onAddCompany={addCompanyFromReport}
          onCreate={createReport}
          onSkip={() => {
            setDraft(null);
            setMode(null);
          }}
        />
      )}
    </>
  );
}

function ReportKindDialog({
  companies,
  companyId,
  onboard,
  onSelectCompany,
  onAddCompany,
  onCreate,
  onSkip,
}: {
  companies: Company[];
  companyId?: string;
  onboard: boolean;
  onSelectCompany: (id: string) => void;
  onAddCompany: () => void;
  onCreate: (kind: ReportKind, companyId: string) => void;
  onSkip: () => void;
}) {
  const company = companies.find((c) => c.id === companyId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6">
        <p className="text-[11px] font-bold tracking-wide text-primary">
          {onboard ? "الخطوة 2 من 2 — المحضر" : "محضر جديد"}
        </p>
        <h2 className="mt-1 text-lg font-bold">
          {company ? `محضر ${companyLabel(company)}` : "اختر الشركة ثم نوع الجمعية"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          العنوان والشركاء يُنقلان من ملف الشركة إلى المسودة.
        </p>

        <div className="mt-4 space-y-1">
          <div className="max-h-44 space-y-1 overflow-y-auto">
            {companies.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelectCompany(c.id)}
                className={cn(
                  "flex w-full flex-col items-start rounded-md border px-3 py-2.5 text-start text-sm transition-colors",
                  c.id === companyId
                    ? "border-primary bg-primary-soft font-semibold text-primary"
                    : "border-border hover:bg-secondary",
                )}
              >
                {companyLabel(c)}
                <span className="text-[11px] font-normal text-muted-foreground">{c.legalForm}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onAddCompany}
            className="flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-border px-3 py-2.5 text-sm font-semibold text-primary hover:bg-secondary"
          >
            <Plus className="size-4" />
            الشركة ليست هنا — أضف شركة
          </button>
        </div>

        <div className="mt-4 overflow-hidden rounded-md border border-border">
          <button
            type="button"
            disabled={!companyId}
            onClick={() => companyId && onCreate("ordinary", companyId)}
            className="flex w-full flex-col items-start px-4 py-3 text-start hover:bg-secondary disabled:opacity-40"
          >
            <span className="font-semibold">جمعية عمومية عادية</span>
            <span className="text-[11px] text-muted-foreground">قوائم مالية، مراقب حسابات، إبراء ذمة</span>
          </button>
          <button
            type="button"
            disabled={!companyId}
            onClick={() => companyId && onCreate("extraordinary", companyId)}
            className="flex w-full flex-col items-start border-t border-border px-4 py-3 text-start hover:bg-secondary disabled:opacity-40"
          >
            <span className="font-semibold">جمعية عمومية غير عادية</span>
            <span className="text-[11px] text-muted-foreground">تعديل عقد، إدارة، أو مركز رئيسي</span>
          </button>
        </div>

        <div className="mt-4 flex justify-end">
          <button type="button" onClick={onSkip} className="btn-ghost">
            {onboard ? "لاحقًا" : "إلغاء"}
          </button>
        </div>
      </div>
    </div>
  );
}
