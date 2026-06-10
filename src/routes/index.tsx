import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useLanguage } from "@/context/LanguageContext";
import { MangystauNav } from "@/components/MangystauNav";
import heroImg from "@/assets/hero.jpg";
import { AlertTriangle, Droplets, Flame, Radiation, Waves, MapPin, Sparkles, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TazaEl Mangystau — Азаматтық эко-репорт платформасы" },
      { name: "description", content: "Маңғыстау облысының экологиялық проблемаларын картаға тіркеп, әкімдікке тікелей жеткізетін цифрлық платформа." },
      { property: "og:title", content: "TazaEl Mangystau" },
      { property: "og:description", content: "Заңсыз полигондар, мұнай төгілуі, Қошқар-Ата, су тапшылығы — азаматтар хабарлайды, әкімдік әрекет етеді." },
    ],
  }),
  component: Index,
});

function Index() {
  const { lang } = useLanguage();
  const L = lang === "kk";

  const problems = [
    { icon: AlertTriangle, title: L ? "Ашық ТҚҚ полигондары" : "Открытые полигоны ТБО", stat: L ? "ҚР ең желді өңірі" : "Самый ветреный регион РК", desc: L ? "Жабылмаған полигондардан қоқыс далаға ұшады." : "Мусор разносится ветром по степи." },
    { icon: Droplets, title: L ? "Ауыз су тапшылығы" : "Дефицит питьевой воды", stat: "23 000 м³/тәу", desc: L ? "Жазғы тапшылық — тәулігіне 23 мың м³-ге дейін." : "Летний дефицит до 23 тыс. м³ в сутки." },
    { icon: Radiation, title: L ? "Қошқар-Ата уыты" : "Кошкар-Ата токсины", stat: L ? "100 млн тонна" : "100 млн тонн", desc: L ? "Ақтаудан 3–4 шақырым: уытты және радиоактивті қалдықтар." : "В 3–4 км от Актау: токсичные и радиоактивные отходы." },
    { icon: Flame, title: L ? "Мұнай төгілуі" : "Разливы нефти", stat: L ? "200+ объект" : "200+ объектов", desc: L ? "Каспий жағалауында 200-ден астам мұнай объектісі." : "На побережье Каспия более 200 объектов." },
    { icon: Waves, title: L ? "Каспий ластануы" : "Загрязнение Каспия", stat: L ? "Итбалықтар азаюда" : "Тюлени гибнут", desc: L ? "Жағалау экожүйесіне қауіп төніп тұр." : "Прибрежная экосистема под угрозой." },
    { icon: MapPin, title: L ? "Бірыңғай жүйе жоқ" : "Нет единой системы", stat: L ? "Деректер шашыраңқы" : "Данные разрозненны", desc: L ? "Әкімдік пен азаматтар арасында байланыс үзік." : "Связь между акиматом и жителями прерывна." },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <MangystauNav />

      {/* Hero */}
      <section className="px-6 py-12 md:py-20 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-flex items-center gap-2 bg-accent text-primary px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6">
            <span className="size-2 bg-primary rounded-full animate-pulse" /> {L ? "Маңғыстау · Хакатон MVP" : "Мангистау · Хакатон MVP"}
          </span>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6">
            {L ? (<>Маңғыстаудың экологиясы — <span className="text-primary">бір картада</span>.</>) : (<>Экология Мангистау — <span className="text-primary">на одной карте</span>.</>)}
          </h1>
          <p className="text-lg text-foreground/70 mb-8 leading-relaxed max-w-xl">
            {L
              ? "Тұрғын ашық полигонды, мұнай төгілуін немесе су тапшылығын картаға тіркейді. AI оны жіктеп, әкімдік дашбордында нақты тапсырмаға айналдырады."
              : "Житель отмечает свалку, разлив или дефицит воды на карте. ИИ классифицирует и превращает это в задачу для акимата."}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/report" className="bg-primary text-primary-foreground px-7 py-4 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all inline-flex items-center gap-2">
              {L ? "Репорт жіберу" : "Сообщить о проблеме"} <ArrowRight className="size-4" />
            </Link>
            <Link to="/map" className="border-2 border-foreground/10 px-7 py-4 rounded-2xl font-bold hover:bg-foreground/5 transition-all inline-flex items-center gap-2">
              <MapPin className="size-4" /> {L ? "Эко-картаны ашу" : "Открыть эко-карту"}
            </Link>
            <Link to="/dashboard" className="px-7 py-4 rounded-2xl font-bold text-foreground/60 hover:text-foreground transition-colors inline-flex items-center gap-2">
              {L ? "Әкімдік дашборды" : "Дашборд акимата"} →
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-4 max-w-lg">
            <Stat value="23K" label={L ? "м³/тәу су тапшылығы" : "м³/сут дефицит воды"} />
            <Stat value="200+" label={L ? "мұнай объектісі" : "нефтяных объектов"} />
            <Stat value="100M" label={L ? "тонна Қошқар-Ата" : "тонн Кошкар-Ата"} />
          </div>
        </div>
        <div className="relative">
          <img src={heroImg} alt="Mangystau" width={1024} height={1024} className="w-full aspect-square object-cover rounded-[40px]" />
          <div className="absolute -bottom-6 -left-6 bg-background p-5 rounded-3xl shadow-2xl border border-foreground/5 max-w-[280px]">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary">AI Eco-Advisor</p>
            </div>
          </div>
          <div className="absolute -top-4 -right-4 bg-foreground text-background px-4 py-3 rounded-2xl shadow-xl">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">{L ? "Тірі деректер" : "Live данные"}</p>
            <p className="font-display font-bold text-lg">8 {L ? "белсенді репорт" : "активных репортов"}</p>
          </div>
        </div>
      </section>

      {/* Problems */}
      <section className="py-20 px-6 bg-secondary/40 border-y border-foreground/5">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">{L ? "Кейс контексі" : "Контекст кейса"}</p>
              <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight max-w-2xl">{L ? "Маңғыстау — Қазақстанның экологиялық осал өңірі." : "Мангистау — экологически уязвимый регион РК."}</h2>
            </div>
            <p className="text-foreground/60 max-w-md">{L ? "Шешімді алты негізгі мәселе айналасында құрдық. Әр бағыт — нақты дерек, нақты әрекет." : "Решение построено вокруг шести проблем. Каждое направление — конкретные данные и действие."}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {problems.map((p) => (
              <div key={p.title} className="bg-background p-6 rounded-3xl border border-foreground/5 hover:border-primary/30 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="size-11 bg-primary/10 rounded-2xl grid place-items-center">
                    <p.icon className="size-5 text-primary" />
                  </div>
                  <span className="text-xs font-bold text-primary bg-accent px-2.5 py-1 rounded-full">{p.stat}</span>
                </div>
                <h3 className="font-display text-lg font-bold mb-1.5">{p.title}</h3>
                <p className="text-sm text-foreground/60 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">{L ? "Қалай жұмыс істейді" : "Как это работает"}</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold">{L ? "3 қадам — мәселеден шешімге дейін" : "3 шага — от проблемы до решения"}</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { n: "01", t: L ? "Азамат хабарлайды" : "Житель сообщает", d: L ? "Картаға тіркеп, фото мен сипаттама жібереді. 30 секунд." : "Отмечает на карте, фото и описание. 30 секунд." },
            { n: "02", t: L ? "AI жіктейді" : "ИИ классифицирует", d: L ? "TazaEl AI категория мен қауіптілікті анықтап, әкімдікке нақты ұсыныс береді." : "TazaEl AI определяет категорию, тяжесть и даёт рекомендацию." },
            { n: "03", t: L ? "Әкімдік әрекет етеді" : "Акимат реагирует", d: L ? "Дашбордта мәртебе жаңартылады, азамат хабарланады. Барлығы ашық." : "В дашборде обновляется статус, житель уведомляется. Всё прозрачно." },
          ].map((s) => (
            <div key={s.n} className="relative bg-background border border-foreground/10 rounded-3xl p-8">
              <span className="font-display text-6xl font-extrabold text-primary/15 absolute top-4 right-6 select-none">{s.n}</span>
              <h3 className="font-display text-xl font-bold mb-3 mt-8">{s.t}</h3>
              <p className="text-sm text-foreground/60 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link to="/report" className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-4 rounded-2xl font-bold hover:bg-primary transition-colors">
            {L ? "Қазір репорт жіберу" : "Отправить репорт сейчас"} <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-foreground/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-6 items-start md:items-center">
          <div>
            <p className="font-display font-bold text-lg">TazaEl Mangystau</p>
            <p className="text-xs text-foreground/50 mt-1">{L ? "© 2026 · Хакатон шешімі · Lovable Cloud + AI" : "© 2026 · Решение хакатона · Lovable Cloud + AI"}</p>
          </div>
          <div className="flex gap-4 text-xs text-foreground/50 font-mono">
            <span className="py-1 px-2 border border-foreground/10 rounded">MVP v1.0</span>
            <span className="py-1 px-2 border border-foreground/10 rounded">Mangystau-2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-display text-2xl md:text-3xl font-extrabold text-primary leading-none">{value}</p>
      <p className="text-[11px] text-foreground/60 mt-1 leading-tight">{label}</p>
    </div>
  );
}
