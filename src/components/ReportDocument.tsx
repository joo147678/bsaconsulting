import { formatArabicDate, kindLabel, type Company, type Report } from "@/lib/store";

const dots = (v?: string) => (v && v.trim() ? v : "................");

export function ReportDocument({ report, company }: { report: Report; company?: Company }) {
  return (
    <article dir="rtl" className="doc-sheet text-black shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]">
      <header className="flex items-start justify-between border-b-2 border-black pb-4">
        <div className="text-center">
          <h1 className="text-3xl font-black tracking-wide">محضر</h1>
          <div className="mt-1 text-sm">
            الحالة : <span>{report.status === "approved" ? "معتمد" : report.status === "review" ? "قيد المراجعة" : "مسودة"}</span>
          </div>
        </div>
        <div className="text-start text-[11px] leading-relaxed">
          <div>النوع : {kindLabel[report.kind]}</div>
          <div>تاريخ الانعقاد : {formatArabicDate(report.meetingDate)}</div>
          <div>
            الساعة : <span dir="ltr">{dots(report.meetingTime)}</span>
          </div>
          <div>المكان : {dots(report.place)}</div>
        </div>
      </header>

      <section className="border-b border-black/20 py-4">
        <div className="mb-1 text-base font-bold">الشركة</div>
        <div className="text-sm">الاسم : {dots(company?.name ?? "")}</div>
        <div className="text-sm">{company?.legalForm}</div>
        <div className="text-sm">
          السجل التجاري : <span dir="ltr">{dots(company?.commercialRegister ?? "")}</span>
        </div>
        <div className="text-sm">{dots(company?.address ?? "")}</div>
      </section>

      <section className="space-y-2 py-4 text-justify text-sm">
        <p>
          إنه في يوم {formatArabicDate(report.meetingDate)} وفي تمام الساعة {dots(report.meetingTime)}،
          انعقدت {kindLabel[report.kind]} لشركة {dots(company?.name ?? "")}، المقيدة بالسجل التجاري رقم{" "}
          {dots(company?.commercialRegister ?? "")}، وذلك بمقر {dots(report.place)}.
        </p>
        <p>
          وقد ترأس الاجتماع السيد/ {dots(report.chairman)}، وتولى أمانة السر السيد/{" "}
          {dots(report.secretary)}، وجمع الأصوات السيد/ {dots(report.scrutineer)}.
        </p>
        <p>
          وبعد التحقق من صحة انعقاد الجمعية، تبين حضور ما نسبته {dots(report.quorum)} من رأس المال،
          وبذلك يكون النصاب القانوني متوفرًا لصحة الانعقاد.
        </p>
      </section>

      {report.attendees.trim() && (
        <section className="py-2">
          <h3 className="mb-2 font-bold">الحاضرون</h3>
          <ul className="list-inside list-disc space-y-1 text-sm">
            {report.attendees
              .split("\n")
              .filter(Boolean)
              .map((line, i) => (
                <li key={i}>{line}</li>
              ))}
          </ul>
        </section>
      )}

      {report.kind === "ordinary" ? (
        <section className="py-4">
          <h3 className="mb-2 font-bold">جدول الأعمال والقرارات</h3>
          <ol className="space-y-4 text-sm">
            {report.agenda.map((item, i) => (
              <li key={item.id}>
                <p className="font-bold">
                  {i + 1}. {dots(item.title)}
                </p>
                {item.discussion.trim() && <p className="text-justify">{item.discussion}</p>}
                <p className="text-justify">
                  <span className="font-bold">القرار : </span>
                  {dots(item.resolution)}
                </p>
              </li>
            ))}
          </ol>
        </section>
      ) : (
        <section className="py-4">
          <h3 className="mb-2 font-bold">التعديلات المقررة</h3>
          <table className="w-full border-collapse text-[11px]">
            <thead>
              <tr className="bg-secondary">
                <th className="border border-black/40 p-1.5 text-center font-bold">البند</th>
                <th className="border border-black/40 p-1.5 text-center font-bold">قبل التعديل</th>
                <th className="border border-black/40 p-1.5 text-center font-bold">بعد التعديل</th>
              </tr>
            </thead>
            <tbody>
              {report.amendments.map((a) => (
                <tr key={a.id}>
                  <td className="border border-black/30 p-1.5 align-top font-semibold">{dots(a.subject)}</td>
                  <td className="border border-black/30 p-1.5 align-top">{dots(a.before)}</td>
                  <td className="border border-black/30 p-1.5 align-top">{dots(a.after)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-justify text-sm">
            وقد وافقت الجمعية بالإجماع على التعديلات المبينة عاليه، وتفويض الإدارة في اتخاذ كافة
            الإجراءات اللازمة للتأشير بها في السجل التجاري.
          </p>
        </section>
      )}

      {report.notes.trim() && (
        <section className="py-2">
          <h3 className="mb-2 font-bold">ملاحظات</h3>
          <p className="text-justify text-sm">{report.notes}</p>
        </section>
      )}

      <section className="py-4 text-sm">
        <p className="text-justify">
          وحيث لم يكن هناك ما يستدعي المناقشة، فقد اختُتم الاجتماع في تمام الساعة .......... وحُرر هذا
          المحضر إثباتًا لما تقدم.
        </p>
      </section>

      <footer className="mt-8 grid grid-cols-3 gap-6 border-t border-black/20 pt-4 text-center text-sm">
        {[
          ["رئيس الاجتماع", report.chairman],
          ["أمين السر", report.secretary],
          ["جامع الأصوات", report.scrutineer],
        ].map(([role, name]) => (
          <div key={role}>
            <p className="font-bold">{role}</p>
            <p className="mt-8 border-t border-dashed border-black pt-1">{dots(name)}</p>
          </div>
        ))}
      </footer>
    </article>
  );
}
