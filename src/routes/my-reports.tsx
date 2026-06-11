import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { MangystauNav } from "@/components/MangystauNav";
import { getReportsByIds } from "@/lib/reports.functions";
import { useLanguage } from "@/context/LanguageContext";
import { ClipboardList, Loader2, Inbox, CheckCircle2, Clock, Activity, XCircle, Eye, Trash2 } from "lucide-react";

export const Route = createFileRoute("/my-reports")({
  ssr: false,
  head: () => ({ meta: [{ title: "Менің репорттарым — TazaEl Mangystau" }, { name: "description", content: "Сіз жіберген эко-репорттардың күйін бақылаңыз." }] }),
  component: MyReportsPage,
});

const KEY = "tazael_my_reports";

const STATUS_META: Record<string, { kk: string; ru: string; cls: string; icon: any }> = {
  new: { kk: "Жаңа", ru: "Новый", cls: "bg-blue-100 text-blue-700 border-blue-200", icon: Inbox },
  in_review: { kk: "Қаралуда", ru: "На рассмотрении", cls: "bg-purple-100 text-purple-700 border-purple-200", icon: Eye },
  in_progress: { kk: "Орындалуда", ru: "В работе", cls: "bg-amber-100 text-amber-700 border-amber-200", icon: Activity },
  resolved: { kk: "Шешілді", ru: "Решено", cls: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2 },
  rejected: { kk: "Қабылданбады", ru: "Отклонено", cls: "bg-slate-200 text-slate-600 border-slate-300", icon: XCircle },
};

function MyReportsPage() {
  const { lang } = useLanguage();
  const L = lang === "kk";
  const fetchFn = useServerFn(getReportsByIds);
  const [ids, setIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try { setIds(JSON.parse(localStorage.getItem(KEY) ?? "[]")); } catch {}
    setHydrated(true);
  }, []);

  const { data = [], isLoading, refetch } = useQuery({
    queryKey: ["my-reports", ids],
    queryFn: () => fetchFn({ data: { ids } }),
    enabled: hydrated && ids.length > 0,
    refetchInterval: 30_000,
  });

  function removeId(id: string) {
    const next = ids.filter((x) => x !== id);
    setIds(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  }

  const counts = data.reduce<Record<string, number>>((m, r: any) => { m[r.status] = (m[r.status] ?? 0) + 1; return m; }, {});

  return (
    <div className="min-h-screen bg-secondary/30">
      <MangystauNav />
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="size-10 rounded-2xl bg-primary/10 text-primary grid place-items-center">
            <ClipboardList className="size-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">{L ? "Менің әрекетім" : "Моя активность"}</p>
            <h1 className="font-display text-2xl md:text-3xl font-bold">{L ? "Менің репорттарым" : "Мои репорты"}</h1>
          </div>
        </div>
        <p className="text-sm text-foreground/60 mb-6">
          {L
            ? "Осы құрылғыдан жіберген репорттарыңыздың күйі. Әкімдік мәртебесін өзгерткен сайын жаңарып отырады."
            : "Статус репортов, отправленных с этого устройства. Обновляется автоматически."}
        </p>

        {hydrated && ids.length === 0 && (
          <div className="bg-background border border-foreground/5 rounded-3xl p-10 text-center">
            <Inbox className="size-10 mx-auto text-foreground/30 mb-3" />
            <p className="text-sm text-foreground/60 mb-4">{L ? "Сіз әлі репорт жібермедіңіз." : "Вы ещё не отправляли репорты."}</p>
            <Link to="/report" className="inline-flex bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-sm font-bold">
              {L ? "Алғашқы репортты жіберу" : "Отправить первый репорт"}
            </Link>
          </div>
        )}

        {ids.length > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-6">
              {(["new", "in_review", "in_progress", "resolved", "rejected"] as const).map((s) => {
                const meta = STATUS_META[s];
                const Icon = meta.icon;
                return (
                  <div key={s} className={`rounded-2xl border p-3 ${meta.cls}`}>
                    <Icon className="size-4 mb-1" />
                    <p className="font-display text-xl font-extrabold leading-none">{counts[s] ?? 0}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider mt-1">{L ? meta.kk : meta.ru}</p>
                  </div>
                );
              })}
            </div>

            {isLoading && (
              <div className="py-10 grid place-items-center"><Loader2 className="size-6 animate-spin text-primary" /></div>
            )}

            <div className="space-y-3">
              {data.map((r: any) => {
                const meta = STATUS_META[r.status] ?? STATUS_META.new;
                const Icon = meta.icon;
                return (
                  <div key={r.id} className="bg-background border border-foreground/5 rounded-2xl p-4 md:p-5 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold leading-tight">{r.title}</p>
                        <p className="text-xs text-foreground/50 mt-1">📍 {r.location_name} · {new Date(r.created_at).toLocaleDateString(L ? "kk-KZ" : "ru-RU")}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border shrink-0 ${meta.cls}`}>
                        <Icon className="size-3" /> {L ? meta.kk : meta.ru}
                      </span>
                    </div>
                    {r.ai_summary && (
                      <p className="text-xs text-foreground/70 bg-secondary/40 rounded-xl p-3 leading-relaxed">💡 {r.ai_summary}</p>
                    )}
                    <div className="flex items-center justify-between text-[11px] text-foreground/40">
                      <span>{L ? "Соңғы жаңарту:" : "Обновлён:"} {new Date(r.updated_at).toLocaleString(L ? "kk-KZ" : "ru-RU")}</span>
                      <button onClick={() => removeId(r.id)}
                        className="inline-flex items-center gap-1 hover:text-destructive">
                        <Trash2 className="size-3" /> {L ? "Жасыру" : "Скрыть"}
                      </button>
                    </div>
                  </div>
                );
              })}
              {!isLoading && data.length === 0 && ids.length > 0 && (
                <p className="text-center text-xs text-foreground/40 py-6">{L ? "Деректер табылмады" : "Данные не найдены"}</p>
              )}
            </div>

            <button onClick={() => refetch()} className="mt-6 w-full text-sm font-semibold text-primary hover:underline">
              {L ? "Қайта жаңарту" : "Обновить"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}