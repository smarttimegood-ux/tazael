import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { MangystauNav } from "@/components/MangystauNav";
import { createReport } from "@/lib/reports.functions";
import { useLanguage } from "@/context/LanguageContext";
import { Loader2, MapPin, Sparkles, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/report")({
  head: () => ({ meta: [{ title: "Эко-репорт жіберу — TazaEl Mangystau" }, { name: "description", content: "Маңғыстаудағы экологиялық проблеманы 30 секундта тіркеңіз." }] }),
  component: ReportPage,
});

const MANGYSTAU_LOCATIONS = [
  { name: "Ақтау орталығы", lat: 43.6481, lng: 51.1722 },
  { name: "Жаңаөзен", lat: 43.3416, lng: 52.8576 },
  { name: "Форт-Шевченко", lat: 44.5089, lng: 50.2640 },
  { name: "Бейнеу", lat: 45.3145, lng: 55.1959 },
  { name: "Қошқар-Ата", lat: 43.6920, lng: 51.2210 },
  { name: "Каспий жағалауы", lat: 43.5800, lng: 51.1500 },
  { name: "Мұнайлы ауданы", lat: 43.7820, lng: 51.2440 },
];

function ReportPage() {
  const create = useServerFn(createReport);
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const L = lang === "kk";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [locIdx, setLocIdx] = useState(0);
  const [reporterName, setReporterName] = useState("");
  const [reporterContact, setReporterContact] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const loc = MANGYSTAU_LOCATIONS[locIdx];
      const r = await create({
        data: {
          title, description,
          location_name: loc.name,
          lat: loc.lat, lng: loc.lng,
          reporter_name: reporterName || null,
          reporter_contact: reporterContact || null,
        },
      });
      setSuccess(r);
    } catch (err: any) {
      setError(err?.message ?? "Қате");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <MangystauNav />
        <div className="max-w-2xl mx-auto px-6 py-16">
          <div className="bg-background border border-primary/20 rounded-3xl p-8 shadow-xl">
            <CheckCircle2 className="size-12 text-primary mb-4" />
            <h1 className="font-display text-3xl font-bold mb-2">{L ? "Репорт қабылданды!" : "Репорт принят!"}</h1>
            <p className="text-foreground/60 mb-6">{L ? "AI талдады, әкімдік дашбордына түсті." : "ИИ обработал, отправлено в дашборд акимата."}</p>

            <div className="space-y-3 bg-secondary/40 rounded-2xl p-5 mb-6">
              <Row k={L ? "Тақырып" : "Заголовок"} v={success.title} />
              <Row k={L ? "Орын" : "Место"} v={success.location_name} />
              <Row k={L ? "Категория" : "Категория"} v={success.category} />
              <Row k={L ? "Қауіптілік" : "Тяжесть"} v={success.severity} />
              {success.ai_summary && (
                <div className="pt-3 border-t border-foreground/10">
                  <div className="flex items-center gap-1.5 mb-1 text-xs text-primary font-bold uppercase tracking-wider"><Sparkles className="size-3" /> AI түйін</div>
                  <p className="text-sm">{success.ai_summary}</p>
                </div>
              )}
              {success.ai_recommendation && (
                <div>
                  <div className="text-xs text-primary font-bold uppercase tracking-wider mb-1">{L ? "AI ұсынысы әкімдікке" : "Рекомендация акимату"}</div>
                  <p className="text-sm">{success.ai_recommendation}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => navigate({ to: "/map" })} className="flex-1 bg-primary text-primary-foreground py-3 rounded-2xl font-bold">{L ? "Картадан көру" : "Открыть на карте"}</button>
              <button onClick={() => { setSuccess(null); setTitle(""); setDescription(""); }} className="px-5 py-3 rounded-2xl border border-foreground/10 font-semibold">{L ? "Тағы біреу" : "Ещё один"}</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MangystauNav />
      <div className="max-w-2xl mx-auto px-6 py-12">
        <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">{L ? "Жаңа репорт" : "Новый репорт"}</p>
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">{L ? "Экологиялық мәселе жайында хабарлаңыз" : "Сообщите об экологической проблеме"}</h1>
        <p className="text-foreground/60 mb-8 text-sm">{L ? "AI сіздің хабарламаңызды автоматты түрде жіктеп, қауіптілікті анықтап, әкімдікке ұсыныс дайындайды." : "ИИ автоматически классифицирует и подготовит рекомендацию для акимата."}</p>

        <form onSubmit={submit} className="space-y-5">
          <Field label={L ? "Тақырып" : "Заголовок"}>
            <input required minLength={3} maxLength={200} value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder={L ? "мыс. Жағажайдағы пластик үйіндісі" : "напр. Куча пластика на пляже"}
              className="w-full bg-secondary/50 border border-foreground/10 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none" />
          </Field>
          <Field label={L ? "Сипаттама" : "Описание"}>
            <textarea required minLength={10} maxLength={2000} value={description} onChange={(e) => setDescription(e.target.value)} rows={4}
              placeholder={L ? "Не байқадыңыз? Қашан? Қандай көлемде?" : "Что вы заметили? Когда? Какого масштаба?"}
              className="w-full bg-secondary/50 border border-foreground/10 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none resize-none" />
          </Field>
          <Field label={<span className="inline-flex items-center gap-1.5"><MapPin className="size-3.5" /> {L ? "Орын" : "Место"}</span>}>
            <select value={locIdx} onChange={(e) => setLocIdx(Number(e.target.value))}
              className="w-full bg-secondary/50 border border-foreground/10 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none">
              {MANGYSTAU_LOCATIONS.map((l, i) => (<option key={l.name} value={i}>{l.name}</option>))}
            </select>
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label={L ? "Атыңыз (міндетті емес)" : "Имя (необяз.)"}>
              <input value={reporterName} onChange={(e) => setReporterName(e.target.value)} maxLength={120}
                className="w-full bg-secondary/50 border border-foreground/10 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none" />
            </Field>
            <Field label={L ? "Байланыс (міндетті емес)" : "Контакт (необяз.)"}>
              <input value={reporterContact} onChange={(e) => setReporterContact(e.target.value)} maxLength={200}
                placeholder={L ? "Телефон немесе email" : "Телефон или email"}
                className="w-full bg-secondary/50 border border-foreground/10 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none" />
            </Field>
          </div>

          {error && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-xl">{error}</p>}

          <button disabled={loading} type="submit"
            className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-[1.01] disabled:opacity-50 disabled:scale-100 transition-all inline-flex items-center justify-center gap-2">
            {loading ? (<><Loader2 className="size-4 animate-spin" /> {L ? "AI талдауда..." : "ИИ анализирует..."}</>) : (<><Sparkles className="size-4" /> {L ? "Репорт жіберу + AI талдау" : "Отправить + AI анализ"}</>)}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-bold uppercase tracking-wider text-foreground/70 mb-2">{label}</span>
      {children}
    </label>
  );
}
function Row({ k, v }: { k: string; v: string }) {
  return (<div className="flex justify-between text-sm"><span className="text-foreground/50">{k}</span><span className="font-semibold">{v}</span></div>);
}