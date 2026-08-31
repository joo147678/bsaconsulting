import { useCallback, useEffect, useState } from "react";

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
  legalForm: string;
  commercialRegister: string;
  taxId: string;
  capital: string;
  address: string;
  purpose: string;
  partners: Partner[];
}

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
}

export interface DB {
  companies: Company[];
  reports: Report[];
}

const KEY = "bsa-assembly-db-v1";

export const uid = () => Math.random().toString(36).slice(2, 10);

const seed = (): DB => {
  const companyId = "cmp-1";
  return {
    companies: [
      {
        id: companyId,
        name: "شركة النيل للتجارة والتوريدات",
        legalForm: "شركة ذات مسؤولية محدودة",
        commercialRegister: "123456",
        taxId: "300-450-981",
        capital: "1,000,000 جنيه مصري",
        address: "15 شارع التحرير، الدقي، الجيزة",
        purpose: "التجارة العامة والتوريدات",
        partners: [
          { id: uid(), name: "أحمد محمود سيد", share: "60%" },
          { id: uid(), name: "منى عبد الرحمن", share: "40%" },
        ],
      },
    ],
    reports: [
      {
        id: "rep-1",
        kind: "ordinary",
        status: "draft",
        companyId,
        meetingDate: "2026-03-30",
        meetingTime: "11:00",
        place: "المقر الرئيسي للشركة",
        chairman: "أحمد محمود سيد",
        secretary: "منى عبد الرحمن",
        scrutineer: "محاسب/ خالد فؤاد",
        quorum: "100%",
        attendees: "أحمد محمود سيد (60%)\nمنى عبد الرحمن (40%)",
        agenda: [
          {
            id: uid(),
            title: "اعتماد القوائم المالية عن السنة المالية المنتهية",
            discussion:
              "تمت مناقشة القوائم المالية وتقرير مراقب الحسابات عن السنة المالية المنتهية في 31/12/2025.",
            resolution: "تمت الموافقة بالإجماع على اعتماد القوائم المالية.",
          },
          {
            id: uid(),
            title: "تعيين مراقب الحسابات وتحديد أتعابه",
            discussion: "عُرض على الجمعية تجديد تعيين مراقب الحسابات الحالي.",
            resolution: "تمت الموافقة بالإجماع على تجديد التعيين لسنة مالية جديدة.",
          },
        ],
        amendments: [],
        notes: "",
        updatedAt: new Date().toISOString(),
      },
    ],
  };
};

let cache: DB | null = null;
const listeners = new Set<() => void>();

function load(): DB {
  if (cache) return cache;
  if (typeof window === "undefined") return seed();
  try {
    const raw = window.localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as DB) : seed();
  } catch {
    cache = seed();
  }
  return cache;
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
    setDb(load());
    const l = () => setDb({ ...load() });
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);

  const update = useCallback((fn: (db: DB) => DB) => {
    save(fn(load()));
  }, []);

  return { db, update };
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
  };
}

export function emptyCompany(): Company {
  return {
    id: uid(),
    name: "",
    legalForm: "شركة ذات مسؤولية محدودة",
    commercialRegister: "",
    taxId: "",
    capital: "",
    address: "",
    purpose: "",
    partners: [],
  };
}

export const statusLabel: Record<ReportStatus, string> = {
  draft: "مسودة",
  review: "قيد المراجعة",
  approved: "معتمد",
};

export const kindLabel: Record<ReportKind, string> = {
  ordinary: "جمعية عمومية عادية",
  extraordinary: "جمعية عمومية غير عادية",
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
