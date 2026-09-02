import { useCallback, useEffect, useState } from "react";
import { seedDB } from "./seed";

export type ReportKind = "ordinary" | "extraordinary";
export type ReportStatus = "draft" | "review" | "approved";

export interface Partner {
  id: string;
  name: string;
  share: string;
}

export interface Company {
  id: string;
  name: string;
  shortName: string;
  legalForm: string;
  commercialRegister: string;
  taxId: string;
  capital: string;
  address: string;
  purpose: string;
  partners: Partner[];
}

export interface Accountant {
  id: string;
  name: string;
  phone: string;
}

export type DisplayStatus = ReportStatus | "waiting";

export interface AgendaItem {
  id: string;
  title: string;
  discussion: string;
  resolution: string;
}

export interface Amendment {
  id: string;
  subject: string;
  before: string;
  after: string;
}

export interface Report {
  id: string;
  kind: ReportKind;
  status: ReportStatus;
  companyId: string;
  meetingDate: string;
  meetingTime: string;
  place: string;
  chairman: string;
  secretary: string;
  scrutineer: string;
  quorum: string;
  attendees: string;
  agenda: AgendaItem[];
  amendments: Amendment[];
  notes: string;
  updatedAt: string;
  reviewRequestedAt: string | null;
}

export interface DB {
  companies: Company[];
  reports: Report[];
  accountants: Accountant[];
}

const KEY = "bsa-assembly-db-v4";

export const uid = () => Math.random().toString(36).slice(2, 10);

const emptyDB = (): DB => ({ companies: [], reports: [], accountants: [] });
const seed = (): DB => emptyDB();

let cache: DB | null = null;
const listeners = new Set<() => void>();

function mergeDemo(db: DB): DB {
  const demo = seedDB();
  const accountants = db.accountants ?? [];
  const companyIds = new Set(db.companies.map((c) => c.id));
  const reportIds = new Set(db.reports.map((r) => r.id));
  const accountantIds = new Set(accountants.map((a) => a.id));
  return {
    ...db,
    companies: [...demo.companies.filter((c) => !companyIds.has(c.id)), ...db.companies],
    reports: [...demo.reports.filter((r) => !reportIds.has(r.id)), ...db.reports],
    accountants: [...demo.accountants.filter((a) => !accountantIds.has(a.id)), ...accountants],
  };
}

function load(): DB {
  if (cache) return cache;
  if (typeof window === "undefined") return seed();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      cache = seed();
      return cache;
    }
    const base = normalize(JSON.parse(raw) as DB);
    // Keep a truly empty start. If the accountant already has companies,
    // restore any missing demo files beside their own work.
    if (base.companies.length === 0 && base.reports.length === 0) {
      cache = base;
      return cache;
    }
    const merged = normalize(mergeDemo(base));
    cache = merged;
    if (
      merged.companies.length !== base.companies.length ||
      merged.reports.length !== base.reports.length ||
      merged.accountants.length !== base.accountants.length
    ) {
      window.localStorage.setItem(KEY, JSON.stringify(merged));
    }
  } catch {
    cache = seed();
  }
  return cache;
}

function normalize(db: DB): DB {
  return {
    ...db,
    companies: db.companies.map((c) => ({
      ...c,
      shortName: c.shortName || companyShortName(c.name),
    })),
    reports: db.reports.map((r) => ({
      ...r,
      reviewRequestedAt: r.reviewRequestedAt ?? null,
    })),
    accountants: (db.accountants ?? []).map((a) => ({
      id: a.id,
      name: a.name ?? "",
      phone: a.phone ?? "",
    })),
  };
}

function save(next: DB) {
  cache = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  }
  listeners.forEach((l) => l());
}

export function useDB() {
  const [db, setDb] = useState<DB>(() => (typeof window === "undefined" ? seed() : load()));

  useEffect(() => {
    const l = () => setDb({ ...load() });
    listeners.add(l);
    const current = normalize(load());
    if (current.companies.length > 0 || current.reports.length > 0) {
      const merged = normalize(mergeDemo(current));
      if (
        merged.companies.length !== current.companies.length ||
        merged.reports.length !== current.reports.length ||
        merged.accountants.length !== current.accountants.length
      ) {
        save(merged);
      } else {
        setDb(merged);
      }
    } else {
      setDb(current);
    }
    return () => {
      listeners.delete(l);
    };
  }, []);

  const update = useCallback((fn: (db: DB) => DB) => {
    save(fn(load()));
  }, []);

  return { db, update };
}

export function loadDemoData() {
  save(normalize(mergeDemo(load())));
}

export function missingDemo(db: DB) {
  const demo = seedDB();
  return (
    demo.companies.some((c) => !db.companies.some((x) => x.id === c.id)) ||
    demo.reports.some((r) => !db.reports.some((x) => x.id === r.id)) ||
    demo.accountants.some((a) => !db.accountants.some((x) => x.id === a.id))
  );
}

export function emptyReport(kind: ReportKind, companyId: string): Report {
  return {
    id: uid(),
    kind,
    status: "draft",
    companyId,
    meetingDate: new Date().toISOString().slice(0, 10),
    meetingTime: "11:00",
    place: "المقر الرئيسي للشركة",
    chairman: "",
    secretary: "",
    scrutineer: "",
    quorum: "100%",
    attendees: "",
    agenda: [{ id: uid(), title: "", discussion: "", resolution: "" }],
    amendments:
      kind === "extraordinary" ? [{ id: uid(), subject: "المركز الرئيسي", before: "", after: "" }] : [],
    notes: "",
    updatedAt: new Date().toISOString(),
    reviewRequestedAt: null,
  };
}

export function reportFromCompany(kind: ReportKind, company: Company): Report {
  const report = emptyReport(kind, company.id);
  if (company.address.trim()) report.place = company.address;
  const attendees = company.partners
    .filter((p) => p.name.trim())
    .map((p) => (p.share.trim() ? `${p.name} — ${p.share}` : p.name));
  if (attendees.length) report.attendees = attendees.join("\n");
  return report;
}

export function emptyCompany(): Company {
  return {
    id: uid(),
    name: "",
    shortName: "",
    legalForm: "شركة ذات مسؤولية محدودة",
    commercialRegister: "",
    taxId: "",
    capital: "",
    address: "",
    purpose: "",
    partners: [],
  };
}

export function emptyAccountant(): Accountant {
  return { id: uid(), name: "", phone: "" };
}

export const statusLabel: Record<ReportStatus, string> = {
  draft: "مسودة",
  review: "قيد المراجعة",
  approved: "معتمد",
};

export const displayStatusLabel: Record<DisplayStatus, string> = {
  draft: "مسودة",
  waiting: "بانتظار المشرف",
  review: "قيد المراجعة",
  approved: "معتمد",
};

export function displayStatus(report: Pick<Report, "status" | "reviewRequestedAt">): DisplayStatus {
  if (report.status === "draft" && report.reviewRequestedAt) return "waiting";
  return report.status;
}

export function companyShortName(name: string) {
  const latin = name.search(/[A-Za-z]/);
  const arabic = (latin > 0 ? name.slice(0, latin) : name).trim();
  return arabic.replace(/^شركة\s+/, "") || name;
}

export function companyLabel(company: Pick<Company, "name" | "shortName"> | undefined) {
  if (!company) return "بدون شركة";
  return company.shortName || companyShortName(company.name);
}

export function reportCompleteness(report: Report): number {
  const filled = [
    Boolean(report.companyId),
    Boolean(report.meetingDate),
    Boolean(report.meetingTime),
    Boolean(report.place.trim()),
    Boolean(report.chairman.trim()),
    Boolean(report.secretary.trim()),
    Boolean(report.scrutineer.trim()),
    Boolean(report.quorum.trim()),
    Boolean(report.attendees.trim()),
  ];
  if (report.kind === "ordinary") {
    filled.push(report.agenda.some((item) => item.title.trim() && item.resolution.trim()));
  } else {
    filled.push(report.amendments.some((item) => item.subject.trim() && item.after.trim()));
  }
  return Math.round((filled.filter(Boolean).length / filled.length) * 100);
}

export const kindLabel: Record<ReportKind, string> = {
  ordinary: "جمعية عمومية عادية",
  extraordinary: "جمعية عمومية غير عادية",
};

export const kindShortLabel: Record<ReportKind, string> = {
  ordinary: "عادية",
  extraordinary: "غير عادية",
};

export function formatArabicDate(iso: string) {
  if (!iso) return "................";
  try {
    return new Intl.DateTimeFormat("ar-EG", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
