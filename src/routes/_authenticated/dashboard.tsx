import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { MangystauNav } from "@/components/MangystauNav";
import { listReports, updateReportStatus, askEcoAdvisor, deleteReport } from "@/lib/reports.functions";
import { isCurrentUserAdmin, claimFirstAdmin } from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/context/LanguageContext";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Sparkles, Loader2, AlertTriangle, CheckCircle2, Clock, Activity, X, MapPin, Calendar, Trash2, ShieldAlert, LogOut } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/dashboard")({
  ssr: false,
  head: () => ({ meta: [{ title: "Әкімдік дашборды — TazaEl Mangystau" }] }),
  component: Dashboard,
});

const SEVERITY_COLOR: Record<string, string> = { low: "#16a34a", medium: "#eab308", high: "#f97316", critical: "#dc2626" };
const STATUS_COLOR: Record<string, string> = { new: "#3b82f6", in_review: "#a855f7", in_progress: "#eab308", resolved: "#16a34a", rejected: "#64748b" };
const STATUSES = ["new", "in_review", "in_progress", "resolved", "rejected"] as const;

const STATUS_LABEL: Record<"kk" | "ru", Record<string, string>> = {
  kk: { new: "Жаңа", in_review: "Қаралуда", in_progress: "Орындалуда", resolved: "Шешілді", rejected: "Қабылданбады" },
  ru: { new: "Новый", in_review: "На рассмотрении", in_progress: "В работе", resolved: "Решено", rejected: "Отклонено" },
};
const SEVERITY_LABEL: Record<"kk" | "ru", Record<string, string>> = {
  kk: { low: "Төмен", medium: "Орташа", high: "Жоғары", critical: "Аса қауіпті" },
  ru: { low: "Низкая", medium: "Средняя", high: "Высокая", critical: "Критическая" },
};
const CATEGORY_LABEL: Record<"kk" | "ru", Record<string, string>> = {
  kk: {
    illegal_dump: "Заңсыз қоқыс үйіндісі",
    oil_spill: "Мұнай төгілуі",
    water_shortage: "Су тапшылығы",
    air_pollution: "Ауаның ластануы",
    radioactive: "Радиоактивті",
    sea_pollution: "Каспий ластануы",
    dead_wildlife: "Жануарлардың өлімі",
    other: "Басқа",
  },
  ru: {
    illegal_dump: "Несанкционированная свалка",
    oil_spill: "Разлив нефти",
    water_shortage: "Дефицит воды",
    air_pollution: "Загрязнение воздуха",
    radioactive: "Радиоактивное",
    sea_pollution: "Загрязнение Каспия",
    dead_wildlife: "Гибель животных",
    other: "Другое",
  },
};

function Dashboard() {
  const adminFn = useServerFn(isCurrentUserAdmin);
  const claimFn = useServerFn(claimFirstAdmin);
  const qcRoot = useQueryClient();
  const adminQ = useQuery({ queryKey: ["isAdmin"], queryFn: () => adminFn(), retry: false });

  if (adminQ.isLoading) {
    return <div className="min-h-screen grid place-items-center"><Loader2 className="size-6 animate-spin text-primary" /></div>;
  }
  if (!adminQ.data?.isAdmin) {
    return <AccessDenied onClaim={async () => {
      const r = await claimFn();
      if (r.claimed) qcRoot.invalidateQueries({ queryKey: ["isAdmin"] });
      else alert("Әкімші бар. Қолданушыңызға рұқсат беру керек.");
    }} />;
  }

  const listFn = useServerFn(listReports);
  const updateFn = useServerFn(updateReportStatus);
  const askFn = useServerFn(askEcoAdvisor);
  const deleteFn = useServerFn(deleteReport);
  const qc = useQueryClient();
  const { lang } = useLanguage();
  const L = lang === "kk";
  const [selected, setSelected] = useState<any | null>(null);
  const [cityFilter, setCityFilter] = useState<string>("all");

  const { data = [] } = useQuery({ queryKey: ["reports"], queryFn: () => listFn() });
  const mut = useMutation({
    mutationFn: (vars: { id: string; status: any }) => updateFn({ data: vars }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reports"] }),
  });
  const delMut = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reports"] });
      setSelected(null);
    },
  });

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);

  const stats = useMemo(() => {
    const total = data.length;
    const critical = data.filter((r: any) => r.severity === "critical").length;
    const resolved = data.filter((r: any) => r.status === "resolved").length;
    const active = total - resolved;
    return { total, critical, resolved, active };
  }, [data]);

  const byCategory = useMemo(() => {
    const m: Record<string, number> = {};
    data.forEach((r: any) => { m[r.category] = (m[r.category] ?? 0) + 1; });
    return Object.entries(m).map(([category, count]) => ({ category, label: CATEGORY_LABEL[lang][category] ?? category, count }));
  }, [data, lang]);

  const byStatus = useMemo(() => {
    const m: Record<string, number> = {};
    data.forEach((r: any) => { m[r.status] = (m[r.status] ?? 0) + 1; });
    return Object.entries(m).map(([status, count]) => ({ status, label: STATUS_LABEL[lang][status] ?? status, count }));
  }, [data, lang]);

  // City detection from location_name (e.g. "Ақтау, 7 мкр" -> "Ақтау")
  function detectCity(loc: string): string {
    const s = (loc ?? "").toLowerCase();
    if (s.includes("жаңаөзен") || s.includes("жанаозен") || s.includes("zhanaozen")) return "Жаңаөзен";
    if (s.includes("ақтау") || s.includes("актау") || s.includes("aktau")) return "Ақтау";
    if (s.includes("бейнеу")) return "Бейнеу";
    if (s.includes("форт") || s.includes("шевченко")) return "Форт-Шевченко";
    if (s.includes("құрық") || s.includes("курык")) return "Құрық";
    if (s.includes("шетпе")) return "Шетпе";
    return L ? "Басқа" : "Другое";
  }

  const byCity = useMemo(() => {
    const m: Record<string, number> = {};
    data.forEach((r: any) => {
      const c = detectCity(r.location_name);
      m[c] = (m[c] ?? 0) + 1;
    });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [data, lang]);

  const filteredReports = useMemo(() => {
    if (cityFilter === "all") return data;
    return data.filter((r: any) => detectCity(r.location_name) === cityFilter);
  }, [data, cityFilter, lang]);

  async function ask() {
    if (!question.trim()) return;
    setAsking(true); setAnswer(null);
    try {
      const r = await askFn({ data: { question } });
      setAnswer(r.answer);
    } catch (e: any) { setAnswer("Қате: " + (e?.message ?? "")); }
    finally { setAsking(false); }
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <MangystauNav />
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">{L ? "Әкімдік командасы" : "Команда акимата"}</p>
            <h1 className="font-display text-3xl md:text-4xl font-bold">{L ? "Маңғыстау эко-дашборд" : "Эко-дашборд Мангистау"}</h1>
          </div>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Kpi icon={Activity} label={L ? "Барлық репорт" : "Всего репортов"} value={stats.total} color="text-primary" />
          <Kpi icon={AlertTriangle} label={L ? "Аса қауіпті" : "Критических"} value={stats.critical} color="text-red-600" />
          <Kpi icon={Clock} label={L ? "Белсенді" : "Активных"} value={stats.active} color="text-orange-600" />
          <Kpi icon={CheckCircle2} label={L ? "Шешілді" : "Решено"} value={stats.resolved} color="text-green-600" />
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card title={L ? "Категориялар бойынша" : "По категориям"}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={byCategory} margin={{ top: 10, right: 10, left: -20, bottom: 60 }}>
                <XAxis dataKey="label" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" interval={0} height={70} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card title={L ? "Мәртебе бойынша" : "По статусу"}>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={byStatus} dataKey="count" nameKey="label" cx="50%" cy="50%" outerRadius={90} label={(e: any) => `${e.label}: ${e.count}`}>
                  {byStatus.map((s) => (<Cell key={s.status} fill={STATUS_COLOR[s.status] ?? "#64748b"} />))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* AI Advisor */}
        <div className="bg-foreground text-background rounded-3xl p-6 md:p-8 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="font-display text-xl font-bold">{L ? "AI Эко-кеңесші" : "AI Эко-советник"}</h2>
          </div>
          <p className="text-sm text-background/60 mb-4">{L ? "Маңғыстаудың экологиясы туралы кез-келген сұрақ қойыңыз. TazaEl AI жауап береді." : "Задайте любой вопрос об экологии Мангистау. TazaEl AI ответит."}</p>
          <div className="flex gap-2 flex-col sm:flex-row">
            <input value={question} onChange={(e) => setQuestion(e.target.value)}
              placeholder={L ? "мыс. Қошқар-Атаны қалай оқшаулауға болады?" : "напр. Как изолировать Кошкар-Ату?"}
              className="flex-1 bg-background/10 border border-background/20 rounded-xl px-4 py-3 text-sm focus:border-accent outline-none placeholder:text-background/40" />
            <button onClick={ask} disabled={asking || !question.trim()} className="bg-accent text-primary px-6 py-3 rounded-xl font-bold disabled:opacity-50 inline-flex items-center gap-2 justify-center">
              {asking && <Loader2 className="size-4 animate-spin" />} {L ? "Сұрау" : "Спросить"}
            </button>
          </div>
          {answer && <div className="mt-4 bg-background/10 border border-background/20 rounded-2xl p-4 text-sm leading-relaxed whitespace-pre-wrap">{answer}</div>}
        </div>

        {/* Reports table */}
        <div className="mb-4">
          <p className="text-[10px] uppercase font-bold tracking-widest text-foreground/50 mb-3">{L ? "Қала бойынша сүзгі" : "Фильтр по городу"}</p>
          <div className="flex flex-wrap gap-2">
            <CityChip active={cityFilter === "all"} label={L ? "Барлығы" : "Все"} count={data.length} onClick={() => setCityFilter("all")} />
            {byCity.map(([city, count]) => (
              <CityChip key={city} active={cityFilter === city} label={city} count={count} onClick={() => setCityFilter(city)} />
            ))}
          </div>
        </div>

        <Card title={cityFilter === "all" ? (L ? "Барлық репорттар" : "Все репорты") : `${cityFilter} — ${L ? "репорттар" : "репорты"} (${filteredReports.length})`}>
          <div className="overflow-x-auto -mx-6">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-foreground/50">
                <tr className="border-b border-foreground/5">
                  <th className="text-left font-semibold px-6 py-3">{L ? "Тақырып" : "Заголовок"}</th>
                  <th className="text-left font-semibold px-3 py-3">{L ? "Орын" : "Место"}</th>
                  <th className="text-left font-semibold px-3 py-3">{L ? "Қауіпт." : "Тяжесть"}</th>
                  <th className="text-left font-semibold px-3 py-3">AI</th>
                  <th className="text-left font-semibold px-6 py-3">{L ? "Мәртебе" : "Статус"}</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-foreground/40 text-xs">{L ? "Бұл қала бойынша репорт жоқ" : "Нет репортов по этому городу"}</td></tr>
                )}
                {filteredReports.map((r: any) => (
                  <tr key={r.id} onClick={() => setSelected(r)} className="border-b border-foreground/5 hover:bg-secondary/40 cursor-pointer">
                    <td className="px-6 py-3">
                      <p className="font-semibold leading-tight">{r.title}</p>
                      <p className="text-xs text-foreground/50 mt-0.5">{CATEGORY_LABEL[lang][r.category] ?? r.category}</p>
                    </td>
                    <td className="px-3 py-3 text-foreground/70">{r.location_name}</td>
                    <td className="px-3 py-3">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full text-white" style={{ background: SEVERITY_COLOR[r.severity] }}>{SEVERITY_LABEL[lang][r.severity] ?? r.severity}</span>
                    </td>
                    <td className="px-3 py-3 max-w-xs">
                      {r.ai_recommendation ? (
                        <p className="text-xs text-foreground/70 line-clamp-2" title={r.ai_recommendation}>💡 {r.ai_recommendation}</p>
                      ) : <span className="text-xs text-foreground/30">—</span>}
                    </td>
                    <td className="px-6 py-3" onClick={(e) => e.stopPropagation()}>
                      <select value={r.status} disabled={mut.isPending}
                        onChange={(e) => mut.mutate({ id: r.id, status: e.target.value })}
                        className="text-xs font-bold px-2 py-1.5 rounded-lg border border-foreground/10 bg-background">
                        {STATUSES.map((s) => (<option key={s} value={s}>{STATUS_LABEL[lang][s]}</option>))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full text-white" style={{ background: SEVERITY_COLOR[selected.severity] }}>
                    {SEVERITY_LABEL[lang][selected.severity] ?? selected.severity}
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full text-white" style={{ background: STATUS_COLOR[selected.status] }}>
                    {STATUS_LABEL[lang][selected.status] ?? selected.status}
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-secondary text-foreground/70">
                    {CATEGORY_LABEL[lang][selected.category] ?? selected.category}
                  </span>
                </div>
                <DialogTitle className="font-display text-2xl">{selected.title}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 text-sm">
                <div className="flex flex-wrap gap-4 text-xs text-foreground/60">
                  <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" /> {selected.location_name}</span>
                  <span className="inline-flex items-center gap-1"><Calendar className="size-3.5" /> {new Date(selected.created_at).toLocaleString(lang === "kk" ? "kk-KZ" : "ru-RU")}</span>
                  <span className="font-mono text-[11px]">{selected.lat.toFixed(4)}, {selected.lng.toFixed(4)}</span>
                </div>

                {selected.image_url && (
                  <img src={selected.image_url} alt={selected.title} className="w-full rounded-2xl border border-foreground/10" />
                )}

                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-foreground/50 mb-1">{L ? "Сипаттама" : "Описание"}</p>
                  <p className="leading-relaxed whitespace-pre-wrap">{selected.description}</p>
                </div>

                {selected.ai_summary && (
                  <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-primary mb-1 inline-flex items-center gap-1"><Sparkles className="size-3" /> {L ? "AI түйін" : "AI резюме"}</p>
                    <p className="leading-relaxed">{selected.ai_summary}</p>
                  </div>
                )}

                {selected.ai_recommendation && (
                  <div className="bg-accent/10 border border-accent/30 rounded-2xl p-4">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-foreground/70 mb-1">💡 {L ? "AI ұсынысы" : "Рекомендация AI"}</p>
                    <p className="leading-relaxed">{selected.ai_recommendation}</p>
                  </div>
                )}

                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-foreground/50 mb-2">{L ? "Мәртебесін өзгерту" : "Изменить статус"}</p>
                  <div className="flex flex-wrap gap-2">
                    {STATUSES.map((s) => (
                      <button key={s} disabled={mut.isPending}
                        onClick={() => mut.mutate({ id: selected.id, status: s }, { onSuccess: () => setSelected({ ...selected, status: s }) })}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition ${selected.status === s ? "text-white border-transparent" : "border-foreground/10 hover:bg-secondary"}`}
                        style={selected.status === s ? { background: STATUS_COLOR[s] } : {}}>
                        {STATUS_LABEL[lang][s]}
                      </button>
                    ))}
                  </div>
                </div>

                {selected.status === "resolved" && (
                  <div className="pt-4 border-t border-foreground/5">
                    <button
                      disabled={delMut.isPending}
                      onClick={() => {
                        if (confirm(L ? "Бұл шешілген репортты толық өшіруді растайсыз ба?" : "Удалить этот решённый репорт навсегда?")) {
                          delMut.mutate(selected.id);
                        }
                      }}
                      className="inline-flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      {delMut.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                      {L ? "Шешілген репортты өшіру" : "Удалить решённый репорт"}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, color }: any) {
  return (
    <div className="bg-background border border-foreground/5 rounded-3xl p-5">
      <Icon className={`size-5 ${color} mb-3`} />
      <p className="font-display text-3xl font-extrabold">{value}</p>
      <p className="text-xs text-foreground/60 mt-1">{label}</p>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-background border border-foreground/5 rounded-3xl p-6">
      <h3 className="font-display font-bold text-sm uppercase tracking-wider text-foreground/60 mb-4">{title}</h3>
      {children}
    </div>
  );
}

function CityChip({ active, label, count, onClick }: { active: boolean; label: string; count: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
        active
          ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
          : "bg-background border-foreground/10 hover:border-primary/40 hover:bg-secondary"
      }`}
    >
      <span>{label}</span>
      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active ? "bg-primary-foreground/20" : "bg-secondary text-foreground/60"}`}>{count}</span>
    </button>
  );
}