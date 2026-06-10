import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { MangystauNav } from "@/components/MangystauNav";
import { EcoMap, type MapPoint } from "@/components/EcoMap";
import { listReports } from "@/lib/reports.functions";
import { useLanguage } from "@/context/LanguageContext";

export const Route = createFileRoute("/map")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Эко-карта Маңғыстау — TazaEl" },
      { name: "description", content: "Маңғыстау облысының барлық экологиялық репорттары интерактивті картада." },
    ],
  }),
  component: MapPage,
});

const CATEGORY_LABEL: Record<string, { kk: string; ru: string }> = {
  illegal_dump: { kk: "Заңсыз полигон", ru: "Свалка" },
  oil_spill: { kk: "Мұнай төгілуі", ru: "Разлив нефти" },
  water_shortage: { kk: "Су тапшылығы", ru: "Дефицит воды" },
  air_pollution: { kk: "Ауа ластануы", ru: "Загрязн. воздуха" },
  radioactive: { kk: "Радиоактивті", ru: "Радиоактивн." },
  sea_pollution: { kk: "Теңіз ластануы", ru: "Загрязн. моря" },
  dead_wildlife: { kk: "Жабайы жануарлар", ru: "Гибель животных" },
  other: { kk: "Басқа", ru: "Прочее" },
};

function MapPage() {
  const fn = useServerFn(listReports);
  const { data = [] } = useQuery({ queryKey: ["reports"], queryFn: () => fn() });
  const { lang } = useLanguage();
  const L = lang === "kk";
  const [filter, setFilter] = useState<string>("all");

  const filtered = useMemo(() => (filter === "all" ? data : data.filter((r: any) => r.category === filter)), [data, filter]);
  const points: MapPoint[] = filtered.map((r: any) => ({
    id: r.id, lat: r.lat, lng: r.lng, title: r.title, category: r.category, severity: r.severity, status: r.status, location_name: r.location_name,
  }));

  return (
    <div className="min-h-screen bg-background">
      <MangystauNav />
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">{L ? "Тірі эко-карта" : "Live эко-карта"}</p>
            <h1 className="font-display text-3xl md:text-4xl font-bold">{L ? "Маңғыстау облысы" : "Мангистауская область"}</h1>
            <p className="text-sm text-foreground/60 mt-1">{L ? `${filtered.length} белсенді репорт` : `${filtered.length} активных репортов`}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {(["all", ...Object.keys(CATEGORY_LABEL)] as const).map((k) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                  filter === k ? "bg-foreground text-background border-foreground" : "bg-background hover:bg-secondary border-foreground/10"
                }`}
              >
                {k === "all" ? (L ? "Барлығы" : "Все") : CATEGORY_LABEL[k][lang]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <EcoMap points={points} height={620} />
            <Legend lang={lang} />
          </div>
          <div className="space-y-3 max-h-[680px] overflow-y-auto pr-1">
            {filtered.map((r: any) => (
              <div key={r.id} className="bg-background border border-foreground/10 rounded-2xl p-4 hover:border-primary/30 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-bold text-sm leading-tight">{r.title}</h3>
                  <SeverityBadge sev={r.severity} />
                </div>
                <p className="text-xs text-foreground/60 mb-2">{r.location_name}</p>
                <p className="text-xs text-foreground/70 line-clamp-2">{r.description}</p>
                <div className="flex gap-2 mt-3 text-[10px] font-bold uppercase tracking-wider">
                  <span className="bg-secondary px-2 py-0.5 rounded-full">{CATEGORY_LABEL[r.category]?.[lang] ?? r.category}</span>
                  <span className="bg-foreground/5 px-2 py-0.5 rounded-full">{r.status}</span>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <p className="text-sm text-foreground/50 text-center py-12">{L ? "Репорт жоқ" : "Нет репортов"}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function SeverityBadge({ sev }: { sev: string }) {
  const map: Record<string, string> = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    critical: "bg-red-100 text-red-800",
  };
  return <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${map[sev] ?? "bg-gray-100 text-gray-800"}`}>{sev}</span>;
}

function Legend({ lang }: { lang: "kk" | "ru" }) {
  const L = lang === "kk";
  const items = [
    { c: "#16a34a", l: "low" }, { c: "#eab308", l: "medium" }, { c: "#f97316", l: "high" }, { c: "#dc2626", l: "critical" },
  ];
  return (
    <div className="mt-3 flex items-center gap-4 flex-wrap text-xs text-foreground/60">
      <span className="font-semibold">{L ? "Қауіптілік:" : "Тяжесть:"}</span>
      {items.map((i) => (
        <span key={i.l} className="inline-flex items-center gap-1.5">
          <span className="size-3 rounded-full" style={{ background: i.c }} /> {i.l}
        </span>
      ))}
    </div>
  );
}