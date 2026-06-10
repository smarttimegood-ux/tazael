import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { MangystauNav } from "@/components/MangystauNav";
import { listReports, updateReportStatus, askEcoAdvisor } from "@/lib/reports.functions";
import { useLanguage } from "@/context/LanguageContext";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Sparkles, Loader2, AlertTriangle, CheckCircle2, Clock, Activity } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Әкімдік дашборды — TazaEl Mangystau" }] }),
  component: Dashboard,
});

const SEVERITY_COLOR: Record<string, string> = { low: "#16a34a", medium: "#eab308", high: "#f97316", critical: "#dc2626" };
const STATUS_COLOR: Record<string, string> = { new: "#3b82f6", in_review: "#a855f7", in_progress: "#eab308", resolved: "#16a34a", rejected: "#64748b" };
const STATUSES = ["new", "in_review", "in_progress", "resolved", "rejected"] as const;

function Dashboard() {
  const listFn = useServerFn(listReports);
  const updateFn = useServerFn(updateReportStatus);
  const askFn = useServerFn(askEcoAdvisor);
  const qc = useQueryClient();
  const { lang } = useLanguage();
  const L = lang === "kk";

  const { data = [] } = useQuery({ queryKey: ["reports"], queryFn: () => listFn() });
  const mut = useMutation({
    mutationFn: (vars: { id: string; status: any }) => updateFn({ data: vars }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reports"] }),
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
    return Object.entries(m).map(([category, count]) => ({ category, count }));
  }, [data]);

  const byStatus = useMemo(() => {
    const m: Record<string, number> = {};
    data.forEach((r: any) => { m[r.status] = (m[r.status] ?? 0) + 1; });
    return Object.entries(m).map(([status, count]) => ({ status, count }));
  }, [data]);

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
              <BarChart data={byCategory} margin={{ top: 10, right: 10, left: -20, bottom: 30 }}>
                <XAxis dataKey="category" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card title={L ? "Мәртебе бойынша" : "По статусу"}>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={byStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={90} label={(e: any) => `${e.status}: ${e.count}`}>
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
            <Sparkles className="size-5 text-accent" />
            <h2 className="font-display text-xl font-bold">{L ? "AI Эко-кеңесші" : "AI Эко-советник"}</h2>
          </div>
          <p className="text-sm text-background/60 mb-4">{L ? "Маңғыстаудың экологиясы туралы кез-келген сұрақ қойыңыз. Lovable AI жауап береді." : "Задайте любой вопрос об экологии Мангистау."}</p>
          <div className="flex gap-2 flex-col sm:flex-row">
            <input value={question} onChange={(e) => setQuestion(e.target.value)}
              placeholder={L ? "мыс. Қошқар-Атаны қалай оқшаулауға болады?" : "напр. Как изолировать Кошкар-Ату?"}
              className="flex-1 bg-background/10 border border-background/20 rounded-xl px-4 py-3 text-sm focus:border-accent outline-none placeholder:text-background/40" />
            <button onClick={ask} disabled={asking || !question.trim()} className="bg-accent text-primary px-6 py-3 rounded-xl font-bold disabled:opacity-50 inline-flex items-center gap-2 justify-center">
              {asking ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />} {L ? "Сұрау" : "Спросить"}
            </button>
          </div>
          {answer && <div className="mt-4 bg-background/10 border border-background/20 rounded-2xl p-4 text-sm leading-relaxed whitespace-pre-wrap">{answer}</div>}
        </div>

        {/* Reports table */}
        <Card title={L ? "Барлық репорттар" : "Все репорты"}>
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
                {data.map((r: any) => (
                  <tr key={r.id} className="border-b border-foreground/5 hover:bg-secondary/40">
                    <td className="px-6 py-3">
                      <p className="font-semibold leading-tight">{r.title}</p>
                      <p className="text-xs text-foreground/50 mt-0.5">{r.category}</p>
                    </td>
                    <td className="px-3 py-3 text-foreground/70">{r.location_name}</td>
                    <td className="px-3 py-3">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full text-white" style={{ background: SEVERITY_COLOR[r.severity] }}>{r.severity}</span>
                    </td>
                    <td className="px-3 py-3 max-w-xs">
                      {r.ai_recommendation ? (
                        <p className="text-xs text-foreground/70 line-clamp-2" title={r.ai_recommendation}>💡 {r.ai_recommendation}</p>
                      ) : <span className="text-xs text-foreground/30">—</span>}
                    </td>
                    <td className="px-6 py-3">
                      <select value={r.status} disabled={mut.isPending}
                        onChange={(e) => mut.mutate({ id: r.id, status: e.target.value })}
                        className="text-xs font-bold px-2 py-1.5 rounded-lg border border-foreground/10 bg-background">
                        {STATUSES.map((s) => (<option key={s} value={s}>{s}</option>))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
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