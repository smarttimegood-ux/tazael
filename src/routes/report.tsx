import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { MangystauNav } from "@/components/MangystauNav";
import { createReport } from "@/lib/reports.functions";
import { useLanguage } from "@/context/LanguageContext";
import { Loader2, MapPin, Sparkles, CheckCircle2, ImagePlus, X, ClipboardList } from "lucide-react";

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
  const queryClient = useQueryClient();
  const { lang } = useLanguage();
  const L = lang === "kk";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [locIdx, setLocIdx] = useState(0);
  const [reporterName, setReporterName] = useState("");
  const [reporterContact, setReporterContact] = useState("");
  const [imageData, setImageData] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
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
          image_data: imageData,
        },
      });
      setSuccess(r);
      // Refetch map + reports so the new point appears immediately
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      try {
        const KEY = "tazael_my_reports";
        const prev: string[] = JSON.parse(localStorage.getItem(KEY) ?? "[]");
        if (r?.id && !prev.includes(r.id)) {
          localStorage.setItem(KEY, JSON.stringify([r.id, ...prev].slice(0, 100)));
        }
      } catch {}
    } catch (err: any) {
      setError(err?.message ?? "Қате");
    } finally {
      setLoading(false);
    }
  }

  async function handleFile(file: File) {
    setImageError(null);
    if (!file.type.startsWith("image/")) {
      setImageError(L ? "Тек сурет файлы" : "Только изображение");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setImageError(L ? "Файл тым үлкен (макс 15МБ)" : "Файл слишком большой (макс 15МБ)");
      return;
    }
    try {
      const dataUrl = await resizeImage(file, 1280, 0.72);
      setImageData(dataUrl);
    } catch {
      setImageError(L ? "Сурет жүктелмеді" : "Не удалось загрузить");
    }
  }

  const sevLabel = success ? ({
    low: L ? "Төмен" : "Низкая",
    medium: L ? "Орташа" : "Средняя",
    high: L ? "Жоғары" : "Высокая",
    critical: L ? "Аса қауіпті" : "Критическая",
  } as Record<string, string>)[success.severity] ?? success.severity : "";

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <MangystauNav />
        <div className="max-w-2xl mx-auto px-6 py-16">
          <div className="bg-background border border-primary/20 rounded-3xl p-8 shadow-xl">
            <CheckCircle2 className="size-12 text-primary mb-4" />
            <h1 className="font-display text-3xl font-bold mb-2">{L ? "Репорт қабылданды!" : "Репорт принят!"}</h1>
            <p className="text-foreground/60 mb-6">{L ? "AI талдады, әкімдік дашбордына түсті." : "ИИ обработал, отправлено в дашборд акимата."}</p>

            {success.image_url && (
              <img src={success.image_url} alt="" className="w-full rounded-2xl mb-5 max-h-80 object-cover" />
            )}
            <div className="space-y-3 bg-secondary/40 rounded-2xl p-5 mb-6">
              <Row k={L ? "Тақырып" : "Заголовок"} v={success.title} />
              <Row k={L ? "Орын" : "Место"} v={success.location_name} />
              <Row k={L ? "Категория" : "Категория"} v={success.category} />
              <Row k={L ? "Қауіптілік" : "Тяжесть"} v={sevLabel} />
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
            <button onClick={() => navigate({ to: "/my-reports" })}
              className="mt-3 w-full inline-flex items-center justify-center gap-2 text-sm font-semibold text-primary hover:underline">
              <ClipboardList className="size-4" /> {L ? "Менің репорттарымның күйі" : "Статус моих репортов"}
            </button>
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

          <Field label={<span className="inline-flex items-center gap-1.5"><ImagePlus className="size-3.5" /> {L ? "Сурет (міндетті емес)" : "Фото (необяз.)"}</span>}>
            {imageData ? (
              <div className="relative">
                <img src={imageData} alt="" className="w-full max-h-72 object-cover rounded-xl border border-foreground/10" />
                <button type="button" onClick={() => setImageData(null)}
                  className="absolute top-2 right-2 bg-background/90 backdrop-blur rounded-full p-1.5 border border-foreground/10 hover:bg-background">
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 w-full border-2 border-dashed border-foreground/15 hover:border-primary/50 rounded-xl py-8 cursor-pointer transition-colors bg-secondary/30">
                <ImagePlus className="size-6 text-foreground/40" />
                <span className="text-sm text-foreground/60">{L ? "Сурет таңдау немесе түсіру" : "Выбрать или снять фото"}</span>
                <span className="text-xs text-foreground/40">{L ? "JPG / PNG · 15МБ дейін" : "JPG / PNG · до 15МБ"}</span>
                <input type="file" accept="image/*" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              </label>
            )}
            {imageError && <p className="text-xs text-destructive mt-2">{imageError}</p>}
          </Field>

          <button disabled={loading} type="submit"
            className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-[1.01] disabled:opacity-50 disabled:scale-100 transition-all inline-flex items-center justify-center gap-2">
            {loading ? (<><Loader2 className="size-4 animate-spin" /> {L ? "AI талдауда..." : "ИИ анализирует..."}</>) : (L ? "Репорт жіберу + AI талдау" : "Отправить + AI анализ")}
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

function resizeImage(file: File, maxDim: number, quality: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("decode"));
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("ctx"));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}