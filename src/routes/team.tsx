import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { TextField } from "@/components/Field";
import { useSession } from "@/lib/session";
import { emptyAccountant, uid, useDB } from "@/lib/store";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "الفريق | نظام محاضر الجمعيات العمومية" },
      { name: "description", content: "إدارة المحاسبين الذين يعدّون المحاضر ويرسلونها لمراجعة المشرف." },
    ],
  }),
  component: Team,
});

function Team() {
  const { db, update } = useDB();
  const { isSupervisor, setRole } = useSession();
  const [draft, setDraft] = useState(emptyAccountant);

  const add = () => {
    if (!draft.name.trim()) return;
    const next = { ...draft, id: uid(), name: draft.name.trim(), phone: draft.phone.trim() };
    update((d) => ({ ...d, accountants: [...d.accountants, next] }));
    setDraft(emptyAccountant());
  };

  const remove = (id: string) => {
    update((d) => ({ ...d, accountants: d.accountants.filter((a) => a.id !== id) }));
  };

  return (
    <AppShell
      title="الفريق"
      subtitle="المشرف يضيف المحاسبين. المحاسب يعدّ المحضر ويرسله للمراجعة."
    >
      {!isSupervisor && (
        <div className="mb-6 rounded-lg border border-border bg-card p-4">
          <p className="text-sm font-semibold">هذه الصفحة للمشرف</p>
          <p className="mt-1 text-sm text-muted-foreground">
            بدّل دورك إلى مشرف لإضافة محاسبين إلى الفريق.
          </p>
          <button type="button" onClick={() => setRole("supervisor")} className="btn-primary mt-3">
            التبديل إلى المشرف
          </button>
        </div>
      )}

      {isSupervisor && (
        <form
          className="rounded-lg border border-border bg-card p-5"
          onSubmit={(e) => {
            e.preventDefault();
            add();
          }}
        >
          <p className="flex items-center gap-2 text-sm font-bold">
            <Users className="size-4 text-primary" />
            إضافة محاسب
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            يظهر في الفريق ويمكنه إعداد المحاضر وإرسالها إليك على واتساب للمراجعة.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_12rem_auto]">
            <TextField
              label="اسم المحاسب"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              required
              placeholder="مثال: دينا محمد عبد الله"
            />
            <TextField
              label="واتساب"
              ltr
              inputMode="tel"
              value={draft.phone}
              onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
              placeholder="01xxxxxxxxx"
            />
            <div className="flex items-end">
              <button type="submit" disabled={!draft.name.trim()} className="btn-primary w-full sm:w-auto">
                <Plus className="size-4" />
                إضافة
              </button>
            </div>
          </div>
        </form>
      )}

      <section className="mt-8">
        <div className="mb-3 flex items-end justify-between gap-3">
          <h2 className="text-lg font-semibold">المحاسبون</h2>
          <span className="text-sm text-muted-foreground">{db.accountants.length}</span>
        </div>
        {db.accountants.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
            لا يوجد محاسبون بعد.
            {isSupervisor ? " أضف اسمًا أعلاه ليظهر هنا." : ""}
          </p>
        ) : (
          <div className="space-y-2">
            {db.accountants.map((a) => (
              <div
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-4"
              >
                <div>
                  <p className="font-semibold">{a.name}</p>
                  <p className="text-sm text-muted-foreground" dir="ltr">
                    {a.phone || "بدون رقم واتساب"}
                  </p>
                </div>
                {isSupervisor && (
                  <button
                    type="button"
                    aria-label={`حذف ${a.name}`}
                    onClick={() => remove(a.id)}
                    className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
